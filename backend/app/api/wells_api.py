from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.well import Well
from app.schemas.well_schema import WellResponse

router = APIRouter(prefix="", tags=["wells"])


@router.get("/wells", response_model=list[WellResponse])
def list_wells(db: Session = Depends(get_db)) -> list[Well]:
    """Return all uploaded wells ordered by newest first."""
    return db.query(Well).order_by(Well.upload_date.desc()).all()
