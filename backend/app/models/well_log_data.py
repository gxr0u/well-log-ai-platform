from sqlalchemy import Column, Float, ForeignKey, Index, Integer, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class WellLogData(Base):
    __tablename__ = "well_log_data"

    id = Column(Integer, primary_key=True, index=True)
    well_id = Column(Integer, ForeignKey("wells.id", ondelete="CASCADE"), nullable=False)
    depth = Column(Float, nullable=False)
    curve_name = Column(String(64), nullable=False)
    value = Column(Float, nullable=True)

    well = relationship("Well", back_populates="log_data")

    __table_args__ = (
        Index("ix_well_log_data_well_id_depth", "well_id", "depth"),
    )


