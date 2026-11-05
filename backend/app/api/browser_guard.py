"""
SkillMatch DNA v17.0 — Browser Guard & Typing Biometrics API Router
Pillar 3: Browser Runtime, OS Environment & Peripheral Device Detection
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.browser_guard_service import (
    browser_guard_service,
    BrowserTelemetryRequest,
    KeystrokeEntropyRequest
)

router = APIRouter(prefix="/proctor/browser", tags=["Browser & Typing Proctoring"])


@router.post("/telemetry")
async def evaluate_browser_telemetry(req: BrowserTelemetryRequest) -> Dict[str, Any]:
    """
    Evaluates browser window visibility, blur, copy-paste lock,
    devtools tampering, and unauthorized peripheral hardware.
    """
    try:
        return browser_guard_service.evaluate_browser_telemetry(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/keystroke-entropy")
async def evaluate_keystroke_entropy(req: KeystrokeEntropyRequest) -> Dict[str, Any]:
    """
    Evaluates keystroke dynamics, dwell/flight times, typing entropy,
    and flags automated code injection / macro typers.
    """
    try:
        return browser_guard_service.evaluate_keystroke_entropy(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
