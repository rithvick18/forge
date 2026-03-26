from fastapi import APIRouter
from app.core.cache import get_cache

router = APIRouter()


@router.get("/health")
async def health_check():
    cache = await get_cache()
    return {
        "status": "healthy",
        "services": {
            "api": "ok",
            "cache": "ok" if cache else "unavailable",
        },
    }
