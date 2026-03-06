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

LOCAL_UPLOAD_DIR = Path("uploads")


def _store_file_locally(source_path: str, filename: str) -> str:
    """Persist uploaded file to local storage and return local path string."""
    LOCAL_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    destination = LOCAL_UPLOAD_DIR / Path(filename).name

    # Prevent copying file onto itself
    if Path(source_path).resolve() != destination.resolve():
        shutil.copyfile(source_path, destination)

    return str(destination)


@router.post("/upload")
def upload_las_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> dict[str, int | str | list[str] | dict[str, float]]:
    """Upload LAS file, store original in S3 (or local fallback), parse, and ingest data."""
    filename = file.filename or ""
    if not filename.lower().endswith(".las"):
        raise HTTPException(status_code=400, detail="Only .las files are supported")

    temp_path: str | None = None
    try:
        # Save upload to a temporary path for S3 upload + parsing.
        LOCAL_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        temp_path = LOCAL_UPLOAD_DIR / filename

        with open(temp_path, "wb") as temp_file:
            while chunk := file.file.read(1024 * 1024):
                temp_file.write(chunk)
                
        print("Step 1: file received")

        # Try S3 first; fallback to local storage when S3 is not configured/available.
        print("Step 2: uploading to S3 or local")
        s3_url = upload_file_to_s3(temp_path, filename)
        if s3_url is None:
            s3_url = _store_file_locally(temp_path, filename)
            
        print("Step 3: parsing LAS file")   
        dataframe, curves = parse_las_file(temp_path)
        if dataframe.empty or not curves:
            raise HTTPException(status_code=400, detail="LAS file has no usable curve data")

        print("Step 4: calculating depth range")
        min_depth = float(dataframe["depth"].min())
        max_depth = float(dataframe["depth"].max())

        # Create well record before storing child log rows.
        print("Step 5: creating well record")
        well = Well(name=Path(filename).stem, s3_url=s3_url)
        db.add(well)
        db.flush()

        print("Step 6: storing log data")
        inserted = store_log_data(db=db, well_id=well.id, dataframe=dataframe)
        if inserted == 0:
            raise HTTPException(status_code=400, detail="No log samples were extracted from LAS file")

        db.commit()
        db.refresh(well)

        return {
            "well_id": well.id,
            "curves": curves,
            "depth_range": {"min_depth": min_depth, "max_depth": max_depth},
            "s3_url": well.s3_url,
        }
    except HTTPException:
        db.rollback()
        raise
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database ingestion failed") from exc
    except Exception as exc:
        db.rollback()
        import traceback
        print("\nUPLOAD ERROR:")
        traceback.print_exc()
        print("\n")
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
        file.file.close()
