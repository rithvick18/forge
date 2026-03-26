from sqlalchemy import Column, String, Float, Integer, DateTime, JSON, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base


class TrendStatus(str, enum.Enum):
    RISING = "rising"
    FALLING = "falling"
    STABLE = "stable"
    EMERGING = "emerging"


class TrendRecord(Base):
    __tablename__ = "trend_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    keyword = Column(String(200), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    geo = Column(String(50), default="IN")
    interest_score = Column(Float, nullable=False)    # 0–100 from pytrends
    status = Column(Enum(TrendStatus), default=TrendStatus.STABLE)
    related_queries = Column(JSON, default=list)      # [{"query": str, "value": int}]
    regional_breakdown = Column(JSON, default=dict)   # {"Maharashtra": 78, ...}
    timeframe = Column(String(50))
    raw_data = Column(JSON, default=dict)             # Full pytrends response
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InsightRecord(Base):
    __tablename__ = "insight_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    summary = Column(Text, nullable=False)
    category = Column(String(100), index=True)
    keywords = Column(JSON, default=list)             # driving keywords
    confidence_score = Column(Float)                  # 0.0–1.0
    source_trends = Column(JSON, default=list)        # list of trend_record IDs
    llm_analysis = Column(Text)                       # full LLM-generated brief
    recommended_actions = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ProductRecommendation(Base):
    __tablename__ = "product_recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    category = Column(String(100), index=True)
    description = Column(Text)
    target_region = Column(String(100))
    target_demographic = Column(String(100))
    opportunity_score = Column(Float)                 # 0–100 composite score
    trend_basis = Column(JSON, default=list)          # which trends drove this
    llm_rationale = Column(Text)
    price_range = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ForecastRecord(Base):
    __tablename__ = "forecast_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    keyword = Column(String(200), nullable=False, index=True)
    category = Column(String(100))
    forecast_dates = Column(JSON, default=list)       # ["2024-01-01", ...]
    forecast_values = Column(JSON, default=list)      # [72.3, 75.1, ...]
    lower_bound = Column(JSON, default=list)
    upper_bound = Column(JSON, default=list)
    model_used = Column(String(50), default="prophet")
    mae = Column(Float)                               # Mean Absolute Error
    created_at = Column(DateTime(timezone=True), server_default=func.now())
