import json
import redis.asyncio as aioredis
from typing import Any, Optional
from app.core.config import settings
from app.utils.logger import logger

_redis: Optional[aioredis.Redis] = None


async def init_cache():
    global _redis
    try:
        _redis = await aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
        await _redis.ping()
        logger.info("Redis cache connected")
    except Exception as e:
        logger.warning(f"Redis unavailable, running without cache: {e}")
        _redis = None


async def get_cache() -> Optional[aioredis.Redis]:
    return _redis


async def cache_get(key: str) -> Optional[Any]:
    if not _redis:
        return None
    try:
        value = await _redis.get(key)
        return json.loads(value) if value else None
    except Exception as e:
        logger.error(f"Cache GET error: {e}")
        return None


async def cache_set(key: str, value: Any, ttl: int = settings.CACHE_TTL_SECONDS):
    if not _redis:
        return
    try:
        await _redis.setex(key, ttl, json.dumps(value, default=str))
    except Exception as e:
        logger.error(f"Cache SET error: {e}")


async def cache_delete(key: str):
    if not _redis:
        return
    await _redis.delete(key)
