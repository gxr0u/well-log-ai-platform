from collections import defaultdict

import pandas as pd
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.models.well_log_data import WellLogData


def store_log_data(db, well_id: int, dataframe: pd.DataFrame, batch_size: int = 20000):
    """High-performance batch insertion using pandas melt."""

    if dataframe.empty:
        return 0

    # Convert wide dataframe -> long format
    melted = dataframe.melt(
        id_vars=["depth"],
        var_name="curve_name",
        value_name="value",
    )

    # Drop NaN values
    melted = melted.dropna(subset=["value"])

    # Attach well_id
    melted["well_id"] = well_id

    # Reorder columns
    melted = melted[["well_id", "depth", "curve_name", "value"]]

    inserted = 0

    records = melted.to_dict(orient="records")

    for i in range(0, len(records), batch_size):
        batch = records[i : i + batch_size]

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
