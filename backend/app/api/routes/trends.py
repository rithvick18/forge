from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional

from app.schemas.trend import (
    TrendFetchRequest, TrendResponse, TrendTimeseriesResponse,
    ForecastResponse,
)
from app.services.ingestion.google_trends import google_trends_service
from app.services.ml.forecaster import forecast_service
from app.core.cache import cache_get, cache_set
from app.utils.logger import logger

router = APIRouter()


@router.post("/fetch", response_model=List[dict])
async def fetch_trends(request: TrendFetchRequest):
    """
    Fetch real-time Google Trends data for given keywords.
    Results are cached for 1 hour.
    """
    cache_key = f"trends:{':'.join(sorted(request.keywords))}:{request.geo}:{request.timeframe}"

    cached = await cache_get(cache_key)
    if cached:
        return cached

    try:
        results = await google_trends_service.get_full_trend_profile(
            keywords=request.keywords,
            category=request.category,
            geo=request.geo,
            timeframe=request.timeframe,
        )
    except Exception as e:
        logger.error(f"Trend fetch error: {e}")
        raise HTTPException(status_code=502, detail=f"Google Trends fetch failed: {str(e)}")

    if not results:
        raise HTTPException(status_code=404, detail="No trend data returned for given keywords")

    await cache_set(cache_key, results)
    return results


@router.get("/categories", response_model=List[str])
async def list_categories():
    """Return the FMCG categories configured for tracking."""
    from app.core.config import settings
    return settings.FMCG_CATEGORIES


@router.post("/forecast", response_model=List[dict])
async def forecast_trends(
    keywords: List[str] = Query(...),
    category: str = Query(default="general"),
    geo: str = Query(default="IN"),
    timeframe: str = Query(default="today 12-m"),
    periods: int = Query(default=12, ge=1, le=52),
):
    """
    Fetch historical trend data and run Prophet forecast.
    Returns both historical and predicted values.
    """
    cache_key = f"forecast:{':'.join(sorted(keywords))}:{geo}:{timeframe}:{periods}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    try:
        trends = await google_trends_service.get_full_trend_profile(
            keywords=keywords,
            category=category,
            geo=geo,
            timeframe=timeframe,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

    if not trends:
        raise HTTPException(status_code=404, detail="No trend data to forecast")

    forecast_inputs = [
        {
            "keyword": t["keyword"],
            "category": t["category"],
            "timeseries": t["raw_data"].get("timeseries", []),
        }
        for t in trends
    ]

    forecasts = forecast_service.batch_forecast(forecast_inputs, periods=periods)
    await cache_set(cache_key, forecasts, ttl=3600 * 6)
    return forecasts


@router.get("/compare")
async def compare_keywords(
    keywords: List[str] = Query(..., description="Comma-separated keywords"),
    geo: str = Query(default="IN"),
    timeframe: str = Query(default="today 3-m"),
):
    """Compare multiple keywords side-by-side with regional breakdown."""
    if len(keywords) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 keywords allowed")

    results = await google_trends_service.get_full_trend_profile(
        keywords=keywords,
        category="compare",
        geo=geo,
        timeframe=timeframe,
    )
    return results
