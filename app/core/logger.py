import logging
import sys
from pathlib import Path
from loguru import logger

# Create logs directory
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# Remove default handler
logger.remove()

# Structured JSON logging for production (stdout)
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="INFO",
)

# Rotating file logging for diagnostics
logger.add(
    log_dir / "app_{time:YYYY-MM-DD}.log",
    rotation="10 MB",
    retention="10 days",
    compression="zip",
    level="DEBUG",
    format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level} | {name}:{function}:{line} - {message}"
)

def get_logger(name: str):
    """Returns a configured logger instance for a specific module."""
    return logger.bind(module=name)
