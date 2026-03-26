from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any, List

from app.core.database import get_db
from app.models.settings import Setting
from app.core.config import settings

router = APIRouter()

@router.get("/")
async def get_all_settings(db: AsyncSession = Depends(get_db)):
    """Fetch all dynamic settings merged with defaults."""
    result = await db.execute(select(Setting))
    db_items = result.scalars().all()
    db_settings = {s.key: s.value for s in db_items}
    
    return {
        "MISTRAL_API_KEY": db_settings.get("MISTRAL_API_KEY", settings.MISTRAL_API_KEY),
        "FMCG_CATEGORIES": db_settings.get("FMCG_CATEGORIES", settings.FMCG_CATEGORIES),
        "INDIAN_STATES": db_settings.get("INDIAN_STATES", settings.INDIAN_STATES),
        "APP_NAME": db_settings.get("APP_NAME", settings.APP_NAME),
    }

@router.patch("/")
async def update_settings(updates: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """Update one or more settings in the database."""
    allowed_keys = ["MISTRAL_API_KEY", "FMCG_CATEGORIES", "INDIAN_STATES", "APP_NAME"]
    
    for key, value in updates.items():
        if key not in allowed_keys:
            continue
            
        # Check if exists
        result = await db.execute(select(Setting).where(Setting.key == key))
        db_setting = result.scalar_one_or_none()
        
        if db_setting:
            db_setting.value = value
        else:
            new_item = Setting(key=key, value=value)
            db.add(new_item)
            
    await db.commit()
    return {"status": "updated", "keys": list(updates.keys())}

@router.get("/{key}")
async def get_setting_by_key(key: str, db: AsyncSession = Depends(get_db)):
    """Fetch a specific setting."""
    result = await db.execute(select(Setting).where(Setting.key == key))
    db_setting = result.scalar_one_or_none()
    
    if db_setting:
        return {key: db_setting.value}
    
    # Fallback to static config
    if hasattr(settings, key):
        return {key: getattr(settings, key)}
        
    raise HTTPException(status_code=404, detail="Setting not found")
