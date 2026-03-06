from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.well_log_data import WellLogData
from app.services.interpretation_service import (
    chat_with_llm,
    compute_statistics,
    interpret_logs_with_llm,
)
from app.services.log_service import get_well_logs

router = APIRouter(prefix="", tags=["interpret", "chat"])


@router.post("/interpret")
def interpret_logs(
    well_id: int = Body(...),
    curves: list[str] = Body(default_factory=list),
    depth_min: float | None = Body(default=None),
    depth_max: float | None = Body(default=None),
    db: Session = Depends(get_db),
) -> dict:
    """Fetch selected logs, compute stats, and get LLM interpretation."""
    logs = get_well_logs(
        db=db,
        well_id=well_id,
        curves=curves,
        depth_min=depth_min,
        depth_max=depth_max,
    )

    if not logs.get("depth"):
        raise HTTPException(status_code=404, detail="No log data found for selected filters")

    statistics = compute_statistics(logs)
    summary = interpret_logs_with_llm(
        {
            "well_id": well_id,
            "depth_min": depth_min,
            "depth_max": depth_max,
            "statistics": statistics,
        }
    )

    return {
        "summary": summary,
        "statistics": statistics,
    }


@router.post("/chat")
def chat_about_logs(
    well_id: int = Body(...),
    message: str = Body(...),
    depth_min: float | None = Body(default=None),
    depth_max: float | None = Body(default=None),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """Chat-style question answering over well logs using Groq LLM."""
    curves = [
        row[0]
        for row in db.query(WellLogData.curve_name)
        .filter(WellLogData.well_id == well_id)
        .distinct()
        .all()
    ]

    if not curves:
        raise HTTPException(status_code=404, detail="No curves found for the selected well")

    # Limit contextual curves to keep prompts focused and responsive.
    selected_curves = curves[:8]
    logs = get_well_logs(
        db=db,
        well_id=well_id,
        curves=selected_curves,
        depth_min=depth_min,
        depth_max=depth_max,
    )

    if not logs.get("depth"):
        raise HTTPException(status_code=404, detail="No log data available for chat context")

    response = chat_with_llm(
        message=message,
        well_id=well_id,
        depth_min=depth_min,
        depth_max=depth_max,
        log_payload=logs,
    )

    return {"response": response}
