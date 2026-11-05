"""
SkillMatch DNA v6.0 - Neuromorphic On-Device Inference & Edge Speculative Voice API Router
Endpoints:
- POST /neuromorphic/edge-turn : Evaluate sub-120ms edge speculative voice turn
- GET /neuromorphic/telemetry : Aggregate client NPU offload statistics and latency distribution
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.neuromorphic_engine import NeuromorphicEngine

router = APIRouter(prefix="/neuromorphic", tags=["Neuromorphic Computing & Edge Speculative Voice"])

class EdgeTurnRequest(BaseModel):
    session_id: str = Field(..., json_schema_extra={"example": "session_edge_voice_01"})
    client_hardware: str = Field(
        "apple_silicon",
        json_schema_extra={"example": "apple_silicon"}
    )  # apple_silicon, qualcomm_hexagon, standard_webgpu
    draft_tokens_generated: int = Field(8, json_schema_extra={"example": 8})
    candidate_utterance_text: str = Field(
        "I implemented raft consensus with heartbeats",
        json_schema_extra={"example": "I implemented raft consensus with heartbeats"}
    )

@router.post("/edge-turn")
def evaluate_edge_turn(req: EdgeTurnRequest):
    engine = NeuromorphicEngine()
    result = engine.evaluate_edge_speculative_turn(
        session_id=req.session_id,
        client_hardware=req.client_hardware,
        draft_tokens_generated=req.draft_tokens_generated,
        candidate_utterance_text=req.candidate_utterance_text
    )
    return {"status": "success", **result}

@router.get("/telemetry")
def get_neuromorphic_telemetry():
    engine = NeuromorphicEngine()
    telemetry = engine.get_neuromorphic_telemetry()
    return {"status": "success", **telemetry}
