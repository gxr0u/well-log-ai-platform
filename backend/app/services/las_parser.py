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
    dataframe = las.df().reset_index().copy()
    if dataframe.empty:
        raise ValueError("LAS file contains no log data rows")

    dataframe.columns = (
    dataframe.columns
    .str.lower()
    .str.replace(" ", "_")
    )

    dataframe.rename(columns={dataframe.columns[0]: "depth"}, inplace=True)

    # Ensure numeric values for depth and curve columns.
    dataframe["depth"] = pd.to_numeric(dataframe["depth"], errors="coerce")
    dataframe = dataframe.dropna(subset=["depth"])
    if dataframe.empty:
        raise ValueError("LAS file has no valid depth values")

    curves = [column for column in dataframe.columns if column != "depth"]
    if not curves:
        raise ValueError("LAS file does not contain any curves")

    for curve in curves:
        dataframe[curves] = dataframe[curves].apply(pd.to_numeric, errors="coerce")

    return dataframe, curves
