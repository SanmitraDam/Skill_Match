import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./skillmatch.db")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 15))

    # AI APIs
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-flash-latest")

    # Local Fallback
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2:3b")

    # Storage: "local", "s3", or "cloudinary"
    STORAGE_TYPE: str = os.getenv("STORAGE_TYPE", "local")
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")

    # Real-Time & vLLM Serving (suggestion-v2.md)
    VLLM_BASE_URL: str = os.getenv("VLLM_BASE_URL", "http://localhost:8000/v1")
    VLLM_MODEL: str = os.getenv("VLLM_MODEL", "meta-llama/Llama-3.3-70B-Instruct")
    STUN_SERVER: str = os.getenv("STUN_SERVER", "stun:stun.l.google.com:19302")
    TURN_SERVER: str = os.getenv("TURN_SERVER", "turn:turn.skillmatch.ai:3478")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    # Enterprise Architecture & Speculative Decoding (suggestion-v3.md)
    SPECULATIVE_DRAFT_MODEL: str = os.getenv("SPECULATIVE_DRAFT_MODEL", "meta-llama/Llama-3.2-1B-Instruct")
    SPECULATIVE_TARGET_MODEL: str = os.getenv("SPECULATIVE_TARGET_MODEL", "meta-llama/Llama-3.3-70B-Instruct")
    LLAMA_GUARD_MODEL: str = os.getenv("LLAMA_GUARD_MODEL", "meta-llama/Llama-Guard-3-8B")
    ED25519_SECRET_KEY: str = os.getenv("ED25519_SECRET_KEY", "ed25519_priv_master_key_skillmatch_compliance_v4")
    DEFAULT_TENANT_ID: str = os.getenv("DEFAULT_TENANT_ID", "tenant_default")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
