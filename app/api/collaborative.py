"""
SkillMatch DNA v16.0 — Collaborative Mock Rooms Router
Pillar 3: Collaborative Peer-to-Peer & AI-Agent Mock Interview Rooms
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.collaborative_service import (
    collaborative_service,
    CreateRoomRequest,
    ArchitectureCanvasUpdateRequest
)

router = APIRouter(prefix="/collaborative", tags=["Collaborative Mock Rooms"])


@router.post("/create-room")
async def create_mock_room(req: CreateRoomRequest) -> Dict[str, Any]:
    """
    Spawns a collaborative mock interview chamber (P2P Peer, AI Panel Dual Candidate, or Pair AI).
    """
    try:
        return collaborative_service.create_room(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/room-state/{room_id}")
async def get_mock_room_state(room_id: str) -> Dict[str, Any]:
    """
    Retrieves the current WebRTC signaling room state and active spatial architecture canvas.
    """
    try:
        return collaborative_service.get_room_state(room_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/update-canvas")
async def update_spatial_architecture_canvas(req: ArchitectureCanvasUpdateRequest) -> Dict[str, Any]:
    """
    Updates the 3D spatial architecture diagram and executes real-time throughput bottleneck profiling.
    """
    try:
        return collaborative_service.update_canvas(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
