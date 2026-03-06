from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Well(Base):
    __tablename__ = "wells"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    upload_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    s3_url = Column(String(1024), nullable=True)

    log_data = relationship(
        "WellLogData",
        back_populates="well",
        cascade="all, delete-orphan",
    )
