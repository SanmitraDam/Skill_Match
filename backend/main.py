"""
Entrypoint for Vercel and ASGI servers.
Re-exports the FastAPI app from app.main.
"""
from app.main import app

__all__ = ["app"]

