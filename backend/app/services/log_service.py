from collections import defaultdict

import io
import pandas as pd
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.models.well_log_data import WellLogData


def store_log_data(db: Session, well_id: int, dataframe: pd.DataFrame) -> int:
    """High performance ingestion using PostgreSQL COPY."""

    if dataframe.empty:
        return 0

    # Convert wide → long
    melted = dataframe.melt(
        id_vars=["depth"],
        var_name="curve_name",
        value_name="value",
    )

    melted = melted.dropna(subset=["value"])

    melted["well_id"] = well_id

    melted = melted[["well_id", "depth", "curve_name", "value"]]

    # Convert dataframe → CSV buffer
    buffer = io.StringIO()
    melted.to_csv(buffer, index=False, header=False)
    buffer.seek(0)

    connection = db.connection().connection
    cursor = connection.cursor()

    cursor.copy_expert(
        """
        COPY well_log_data (well_id, depth, curve_name, value)
        FROM STDIN WITH CSV
        """,
        buffer,
    )

    connection.commit()

    return len(melted)
    
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
