"""
SkillMatch DNA v17.0 — Audio Proctoring API Router
Pillar 2: Acoustic Diarization & Environmental Audio Proctoring
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.audio_proctor_service import (
    audio_proctor_service,
    VoiceEnrollRequest,
    AudioDiarizationRequest
)

router = APIRouter(prefix="/proctor/audio", tags=["Audio Proctoring"])


@router.post("/enroll-voice")
async def enroll_candidate_voice(req: VoiceEnrollRequest) -> Dict[str, Any]:
    """
    Enrolls a candidate's 5-second voice sample into a 192-dim acoustic baseline.
    """
    try:
        return audio_proctor_service.enroll_voice_baseline(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/diarize-window")
async def diarize_audio_window(req: AudioDiarizationRequest) -> Dict[str, Any]:
    """
    Diarizes a 500ms sliding audio window to detect secondary speakers, whispers,
    and ultrasonic beacons.
    """
    try:
        return audio_proctor_service.diarize_audio_window(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
