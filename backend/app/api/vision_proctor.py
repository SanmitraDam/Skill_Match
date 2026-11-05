"""
SkillMatch DNA v17.0 — Vision Proctoring API Router
Pillar 1: Multi-Face, 3D Gaze Vector & Deepfake Liveness Detection
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.vision_proctor_service import (
    vision_proctor_service,
    VisionFrameEvaluateRequest
)

router = APIRouter(prefix="/proctor/vision", tags=["Vision Proctoring"])


@router.post("/evaluate-frame")
async def evaluate_vision_frame(req: VisionFrameEvaluateRequest) -> Dict[str, Any]:
    """
    Evaluates real-time 3D face mesh, gaze vectors, head pose Euler angles,
    and liveness/virtual camera indicators.
    """
    try:
        return vision_proctor_service.evaluate_frame(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/gaze-pose")
async def evaluate_gaze_and_pose(req: VisionFrameEvaluateRequest) -> Dict[str, Any]:
    """
    Alias dedicated to high-frequency 3D gaze vector and head Euler tracking.
    """
    try:
        return vision_proctor_service.evaluate_frame(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
