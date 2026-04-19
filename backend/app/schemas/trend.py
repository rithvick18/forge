from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


class TrendStatus(str, Enum):
    RISING = "rising"
    FALLING = "falling"
    STABLE = "stable"
    EMERGING = "emerging"


# ── Trends ──────────────────────────────────────────────────────────────────

class TrendFetchRequest(BaseModel):
    keywords: List[str] = Field(..., min_length=1, max_length=5,
                                description="Up to 5 keywords to compare")
    category: str = Field(default="general")
    geo: str = Field(default="IN", description="ISO country/region code")
    timeframe: str = Field(default="today 3-m",
                           description="pytrends timeframe string")


class RegionalBreakdown(BaseModel):
    region: str
    score: float


class RelatedQuery(BaseModel):
    query: str
    value: int
    query_type: str  # "top" or "rising"


class TrendResponse(BaseModel):
    id: UUID
    keyword: str
    category: str
    geo: str
    interest_score: float
    status: TrendStatus
    related_queries: List[RelatedQuery] = []
    regional_breakdown: Dict[str, float] = {}
    fetched_at: datetime

    class Config:
        from_attributes = True


class TrendTimeseriesPoint(BaseModel):
    date: str
    value: float


class TrendTimeseriesResponse(BaseModel):
    keyword: str
    timeseries: List[TrendTimeseriesPoint]


# ── Insights ─────────────────────────────────────────────────────────────────

class InsightResponse(BaseModel):
    id: UUID
    title: str
    summary: str
    category: str
    keywords: List[str]
    confidence_score: float
    llm_analysis: Optional[str]
    recommended_actions: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


class InsightGenerateRequest(BaseModel):
    category: str
    trend_ids: Optional[List[str]] = None
    focus: Optional[str] = Field(
        None, description="Specific angle, e.g. 'rural consumers in Tamil Nadu'"
    )
    model_name: str = Field(default="mistral")


# ── Products ─────────────────────────────────────────────────────────────────

class ProductRecommendationResponse(BaseModel):
    id: UUID
    name: str
    category: str
    description: str
    target_region: Optional[str]
    target_demographic: Optional[str]
    opportunity_score: float
    trend_basis: List[str]
    llm_rationale: str
    price_range: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ProductRecommendationRequest(BaseModel):
    category: str
    region: Optional[str] = None
    top_n: int = Field(default=5, ge=1, le=20)
    model_name: str = Field(default="mistral")


# ── Forecast ──────────────────────────────────────────────────────────────────

class ForecastPoint(BaseModel):
    date: str
    yhat: float
    yhat_lower: float
    yhat_upper: float


class ForecastResponse(BaseModel):
    keyword: str
    category: Optional[str]
    forecast: List[ForecastPoint]
    model_used: str
    mae: Optional[float]


# ── Generic ───────────────────────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    data: List[Any]


class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None
