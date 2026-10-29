import os
from typing import List
from dotenv import load_dotenv

# Load from backend directory .env if present
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "AI-Powered Root Cause Analysis (RCA) Module"
    PROJECT_VERSION: str = "1.0.0"
    
    # Groq API Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "").strip()
    
    # Supported Groq Models
    # Available options: llama-3.3-70b-versatile, gemma2-9b-it, llama-3.1-8b-instant, mixtral-8x7b-32768
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
    
    SUPPORTED_MODELS: List[str] = [
        "llama-3.3-70b-versatile",
        "gemma2-9b-it",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768"
    ]
    
    # Database Configuration (PostgreSQL, MySQL, or SQLite fallback)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./rca_pharma.db")
    
    # Server & CORS
    APP_ENV: str = os.getenv("APP_ENV", "development")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    
    CORS_ORIGINS: List[str] = [
        origin.strip() for origin in os.getenv(
            "CORS_ORIGINS", 
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
        ).split(",") if origin.strip()
    ]
    
    # File Limits
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "15"))
    ALLOWED_EXTENSIONS: List[str] = [
        ext.strip().lower() for ext in os.getenv("ALLOWED_EXTENSIONS", "pdf,txt").split(",")
    ]
    
    @property
    def is_groq_configured(self) -> bool:
        return bool(self.GROQ_API_KEY and len(self.GROQ_API_KEY) > 10 and not self.GROQ_API_KEY.startswith("your_"))

settings = Settings()
