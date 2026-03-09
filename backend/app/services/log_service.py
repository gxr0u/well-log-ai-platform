from collections import defaultdict

import pandas as pd
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.models.well_log_data import WellLogData


def store_log_data(db, well_id: int, dataframe: pd.DataFrame, batch_size: int = 5000):
    """Efficient batch insertion using streaming batches."""

    if dataframe.empty:
        return 0

    curves = [c for c in dataframe.columns if c != "depth"]

    inserted = 0
    batch = []

    for _, row in dataframe.iterrows():
        depth = row["depth"]

        for curve in curves:
            value = row[curve]   # <-- FIXED ACCESS

            if pd.isna(value):
                continue

            batch.append(
                {
                    "well_id": well_id,
                    "depth": float(depth),
                    "curve_name": curve,
                    "value": float(value),
                }
            )

            if len(batch) >= batch_size:
                db.bulk_insert_mappings(WellLogData, batch)
                inserted += len(batch)
                batch.clear()

    if batch:
        db.bulk_insert_mappings(WellLogData, batch)
        inserted += len(batch)

    db.commit()

    return inserted
    
def get_well_logs(
    db: Session,
    well_id: int,
    curves: list[str],
    depth_min: float | None,
    depth_max: float | None,
) -> dict[str, list[float | None]]:
    """Fetch logs and group values by depth and selected curve names."""
    conditions = [WellLogData.well_id == well_id]

    if curves:
        conditions.append(WellLogData.curve_name.in_(curves))
    if depth_min is not None:
        conditions.append(WellLogData.depth >= depth_min)
    if depth_max is not None:
        conditions.append(WellLogData.depth <= depth_max)

    stmt = (
        select(WellLogData.depth, WellLogData.curve_name, WellLogData.value)
        .where(and_(*conditions))
        .order_by(WellLogData.depth.asc(), WellLogData.curve_name.asc())
    )

    rows = db.execute(stmt).all()

    depth_map: dict[float, dict[str, float | None]] = defaultdict(dict)
    for depth, curve_name, value in rows:
        depth_map[depth][curve_name] = value

    sorted_depths = sorted(depth_map.keys())
    selected_curves = curves or sorted({row.curve_name for row in rows})

    result: dict[str, list[float | None]] = {"depth": sorted_depths}
    for curve in selected_curves:
        result[curve] = [depth_map[d].get(curve) for d in sorted_depths]

    return result
