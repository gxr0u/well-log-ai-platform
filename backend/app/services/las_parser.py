from pathlib import Path

import lasio  # type: ignore[import-untyped]
import pandas as pd
from lasio.exceptions import (   # type: ignore[import-untyped]
    LASDataError,
    LASHeaderError,
    LASUnknownUnitError,
)


def parse_las_file(file_path: str | Path) -> tuple[pd.DataFrame, list[str]]:
    """Parse a LAS file and return a normalized dataframe plus curve names."""
    try:
        las = lasio.read(str(file_path))
    except (LASDataError, LASHeaderError, LASUnknownUnitError, OSError, ValueError) as exc:
        raise ValueError(f"Invalid LAS file: {exc}") from exc

    # las.df() returns depth-indexed logs; reset index to materialize depth column.
    dataframe = las.df().reset_index()
    dataframe = dataframe.copy()
    if dataframe.empty:
        raise ValueError("LAS file contains no log data rows")

    # Normalize depth column name for the rest of the pipeline.
    dataframe.columns = [c.lower() for c in dataframe.columns]

    if "dept" in dataframe.columns and "depth" not in dataframe.columns:
        dataframe.rename(columns={"dept": "depth"}, inplace=True)
    original_depth_col = dataframe.columns[0]
    dataframe = dataframe.rename(columns={original_depth_col: "depth"})

    # Ensure numeric values for depth and curve columns.
    dataframe["depth"] = pd.to_numeric(dataframe["depth"], errors="coerce")
    dataframe = dataframe.dropna(subset=["depth"])
    if dataframe.empty:
        raise ValueError("LAS file has no valid depth values")

    curves = [column for column in dataframe.columns if column != "depth"]
    if not curves:
        raise ValueError("LAS file does not contain any curves")

    for curve in curves:
        dataframe[curve] = pd.to_numeric(dataframe[curve], errors="coerce")

    return dataframe, curves
