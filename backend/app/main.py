from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from huggingface_hub import InferenceClient

from app.config import get_settings
from app.database import get_engine
from app.extraction.router import router as extraction_router
from app.health.routes import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    # Startup — initialize HF client and warm up DB engine
    settings = get_settings()
    app.state.hf_client = InferenceClient(token=settings.hf_api_key)

    yield

    # Shutdown — cleanly dispose DB connection pool
    await get_engine().dispose()


settings = get_settings()

app = FastAPI(
    title="AutoU Email Classifier API",
    description="Classify emails as Produtivo or Improdutivo using HF Inference API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend origins (env-driven) + Vercel preview deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health_router)
app.include_router(extraction_router)
