from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.core.cache import init_cache
from app.api.routes import trends, insights, products, health, copilot, settings as settings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await init_cache()
    yield


app = FastAPI(
    title="FMCG Consumer Intelligence API",
    description="AI system to analyze Indian consumer trends and predict purchasing behaviors",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router,    prefix="/api/v1",          tags=["health"])
app.include_router(trends.router,    prefix="/api/v1/trends",   tags=["trends"])
app.include_router(insights.router,  prefix="/api/v1/insights", tags=["insights"])
app.include_router(products.router,  prefix="/api/v1/products", tags=["products"])
app.include_router(copilot.router,   prefix="/api/v1/copilot",  tags=["copilot"])
app.include_router(settings_router.router, prefix="/api/v1/settings", tags=["settings"])


@app.get("/")
async def root():
    return {"message": "FMCG Consumer Intelligence API", "status": "running"}
