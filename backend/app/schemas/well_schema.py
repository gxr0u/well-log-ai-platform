from datetime import datetime

from pydantic import BaseModel, ConfigDict


class WellCreate(BaseModel):
    name: str
    s3_url: str | None = None


class WellResponse(BaseModel):
    id: int
    name: str
    upload_date: datetime
    s3_url: str | None = None

    model_config = ConfigDict(from_attributes=True)
