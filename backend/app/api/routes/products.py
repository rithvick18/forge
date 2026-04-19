from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.schemas.trend import ProductRecommendationRequest
from app.services.ingestion.google_trends import google_trends_service
from app.services.llm.agent import fmcg_agent
from app.api.routes.insights import _get_category_keywords
from app.core.cache import cache_get, cache_set

router = APIRouter()


@router.post("/recommend")
async def recommend_products(request: ProductRecommendationRequest):
    """
    Generate AI product innovation recommendations based on trending signals.
    """
    cache_key = f"products:{request.category}:{request.region}:{request.top_n}:{request.model_name}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    keywords = _get_category_keywords(request.category)

    try:
        trends = await google_trends_service.get_full_trend_profile(
            keywords=keywords,
            category=request.category,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

    if not trends:
        raise HTTPException(status_code=404, detail="No trend data available")

    try:
        products = await fmcg_agent.generate_product_recommendations(
            trends=trends,
            category=request.category,
            region=request.region,
            top_n=request.top_n,
            model_name=request.model_name,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    result = {
        "category": request.category,
        "region": request.region or "Pan India",
        "recommendations": products,
    }
    await cache_set(cache_key, result, ttl=3600 * 12)
    return result


@router.get("/categories")
async def list_product_categories():
    from app.core.config import settings
    return settings.FMCG_CATEGORIES
