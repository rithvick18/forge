from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "FMCG Consumer Intelligence"
    DEBUG: bool = False
    API_VERSION: str = "v1"

    # Database (Supabase / PostgreSQL)
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/fmcg_intel"
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    CACHE_TTL_SECONDS: int = 3600  # 1 hour

    # LLM Keys
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""  # Gemini
    MISTRAL_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Google Trends
    PYTRENDS_LANGUAGE: str = "en-IN"
    PYTRENDS_GEO: str = "IN"  # India
    PYTRENDS_TIMEFRAME: str = "today 3-m"

    # FMCG Categories to track
    FMCG_CATEGORIES: List[str] = [
        "personal care", "packaged food", "beverages",
        "home care", "dairy products", "snacks",
        "health supplements", "baby care", "skincare"
    ]

    # Indian states for geo analysis
    INDIAN_STATES: List[str] = [
        "Maharashtra", "Tamil Nadu", "Karnataka", "Delhi",
        "Gujarat", "Rajasthan", "West Bengal", "Uttar Pradesh",
        "Andhra Pradesh", "Telangana", "Kerala", "Punjab"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
