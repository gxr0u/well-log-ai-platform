from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.log_service import get_well_logs
from app.models.well_log_data import WellLogData

router = APIRouter(tags=["logs"])


@router.get("/logs")
def get_logs(
    well_id: int = Query(...),
    curves: list[str] = Query(default=[]),
    depth_min: float | None = None,
    depth_max: float | None = None,
    db: Session = Depends(get_db),
):
    """Return depth-series payload grouped by selected curves."""
    return get_well_logs(
        db=db,
        well_id=well_id,
        curves=curves,
        depth_min=depth_min,
        depth_max=depth_max,
    )


@router.get("/curves")
def get_curves(well_id: int, db: Session = Depends(get_db)):
    curves = (
        db.query(WellLogData.curve_name)
        .filter(WellLogData.well_id == well_id)
        .distinct()
        .all()
    )

    return [c[0] for c in curves]