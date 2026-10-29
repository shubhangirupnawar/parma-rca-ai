import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.api.investigations import router as investigations_router

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("pharma_rca.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing PharmaRCA Application Services...")
    init_db()
    logger.info(f"PharmaRCA Backend is ready. Groq API configured: {settings.is_groq_configured} (Model: {settings.GROQ_MODEL})")
    yield
    logger.info("Shutting down PharmaRCA Application Services...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Enterprise Root Cause Analysis (RCA) & CAPA Decision Support System for Pharmaceutical API Manufacturing.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development allow all; in production restrict via settings.CORS_ORIGINS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(investigations_router)

@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "database": settings.DATABASE_URL.split("://")[0],
        "groq_configured": settings.is_groq_configured,
        "model": settings.GROQ_MODEL
    }

@app.get("/api/config", tags=["System"])
def get_system_config():
    return {
        "groq_configured": settings.is_groq_configured,
        "groq_model": settings.GROQ_MODEL,
        "supported_models": settings.SUPPORTED_MODELS,
        "max_file_size_mb": settings.MAX_FILE_SIZE_MB,
        "allowed_extensions": settings.ALLOWED_EXTENSIONS,
        "mode": "Live Groq AI" if settings.is_groq_configured else "Pharma Simulation / Demo Mode"
    }

@app.get("/", tags=["System"])
def root():
    return {
        "message": "Welcome to AI-Powered Root Cause Analysis (RCA) Module API",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }
