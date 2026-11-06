import os
import logging
import sys
from pathlib import Path
from loguru import logger

# Remove default handler
logger.remove()

# Structured JSON/text logging to stdout (compatible with Vercel, Docker, & local)
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="INFO",
)

# Only attach local file sink when running on a writable local environment (not Vercel serverless)
if not os.environ.get("VERCEL"):
    try:
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        logger.add(
            log_dir / "app_{time:YYYY-MM-DD}.log",
            rotation="10 MB",
            retention="10 days",
            compression="zip",
            level="DEBUG",
            format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level} | {name}:{function}:{line} - {message}"
        )
    except Exception as e:
        print(f"[Logger Notice] File logging disabled: {e}")

def get_logger(name: str):
    """Returns a configured logger instance for a specific module."""
    return logger.bind(module=name)
