from pydantic import BaseModel


class LogDataResponse(BaseModel):
    depth: list[float]
    curves: dict[str, list[float | None]]
