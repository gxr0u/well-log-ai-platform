import os
import shutil
import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.well import Well
from app.services.las_parser import parse_las_file
from app.services.log_service import store_log_data
from app.services.s3_service import upload_file_to_s3

router = APIRouter(prefix="", tags=["upload"])

# Render allows writing only to /tmp
LOCAL_UPLOAD_DIR = Path("/tmp/uploads")
LOCAL_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _store_file_locally(source_path: str, filename: str) -> str:
    """Persist uploaded file to local storage and return local path."""
    LOCAL_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    destination = LOCAL_UPLOAD_DIR / Path(filename).name

    if Path(source_path).resolve() != destination.resolve():
        shutil.copyfile(source_path, destination)

    return str(destination)


@router.post("/upload")
def upload_las_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload LAS file, store original, parse, and ingest logs."""

    filename = file.filename or ""
    if not filename.lower().endswith(".las"):
        raise HTTPException(status_code=400, detail="Only .las files are supported")

    temp_path = None

    try:
        # Create a unique temp file in /tmp
        with tempfile.NamedTemporaryFile(delete=False, suffix=".las", dir="/tmp") as tmp:
            temp_path = tmp.name

            # stream write (avoids memory spike)
            while chunk := file.file.read(1024 * 1024):
                tmp.write(chunk)

        print("Step 1: file received")

        # Upload to S3 if configured
        print("Step 2: uploading to S3 or local")
        s3_url = upload_file_to_s3(temp_path, filename)

        if s3_url is None:
            s3_url = _store_file_locally(temp_path, filename)

        # Parse LAS
        print("Step 3: parsing LAS file")
        dataframe, curves = parse_las_file(temp_path)

        if dataframe.empty or not curves:
            raise HTTPException(status_code=400, detail="LAS file has no usable curve data")

        print("Step 4: calculating depth range")
        min_depth = float(dataframe["depth"].min())
        max_depth = float(dataframe["depth"].max())

        # Create well
        print("Step 5: creating well record")
        well = Well(name=Path(filename).stem, s3_url=s3_url)

        db.add(well)
        db.flush()

        # Insert logs
        print("Step 6: storing log data")
        inserted = store_log_data(db=db, well_id=well.id, dataframe=dataframe)

        if inserted == 0:
            raise HTTPException(status_code=400, detail="No log samples extracted")

        db.commit()
        db.refresh(well)

        return {
            "well_id": well.id,
            "curves": curves,
            "depth_range": {
                "min_depth": min_depth,
                "max_depth": max_depth,
            },
            "s3_url": well.s3_url,
        }

    except HTTPException:
        db.rollback()
        raise

    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database ingestion failed")

    except Exception as exc:
        db.rollback()
        import traceback

        print("\nUPLOAD ERROR:")
        traceback.print_exc()
        print("\n")

        raise HTTPException(status_code=500, detail=str(exc))

    finally:
        # cleanup temp file
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

        file.file.close()
