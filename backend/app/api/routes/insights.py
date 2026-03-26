from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List

from app.schemas.trend import InsightGenerateRequest, InsightResponse
from app.services.ingestion.google_trends import google_trends_service
from app.services.llm.agent import fmcg_agent
from app.core.config import settings
from app.utils.logger import logger

router = APIRouter()


@router.post("/generate")
async def generate_insight(request: InsightGenerateRequest):
    """
    Pull latest trend data for a category and generate an LLM insight brief.
    """
    # Pick representative keywords for this category
    category_keywords = _get_category_keywords(request.category)

    try:
        trends = await google_trends_service.get_full_trend_profile(
            keywords=category_keywords,
            category=request.category,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Trend fetch failed: {e}")

    if not trends:
        raise HTTPException(status_code=404, detail="No trend data for this category")

    try:
        insight = await fmcg_agent.generate_insight(
            trends=trends,
            category=request.category,
            focus=request.focus,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return {
        "category": request.category,
        "trends_analyzed": len(trends),
        "insight": insight,
    }


@router.get("/categories")
async def insights_by_category(
    category: str = Query(...),
    focus: Optional[str] = Query(None),
):
    """Quick GET endpoint to generate insight for a category."""
    req = InsightGenerateRequest(category=category, focus=focus)
    return await generate_insight(req)


def _get_category_keywords(category: str) -> List[str]:
    """Map category names to representative search keywords for Indian market."""
    mapping = {
        "personal care": ["face wash", "moisturizer", "shampoo"],
        "packaged food": ["instant noodles", "ready to eat", "biscuits"],
        "beverages": ["energy drink", "packaged juice", "green tea"],
        "home care": ["floor cleaner", "dish wash", "toilet cleaner"],
        "dairy products": ["paneer", "curd", "flavoured milk"],
        "snacks": ["namkeen", "chips", "popcorn"],
        "health supplements": ["protein powder", "multivitamin", "immunity booster"],
        "baby care": ["baby lotion", "diapers", "baby food"],
        "skincare": ["sunscreen", "face serum", "lip balm"],
    }
    return mapping.get(category.lower(), [category])[:5]
