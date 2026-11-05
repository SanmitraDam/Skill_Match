"""
SkillMatch DNA Version 26.0: Sub-Cortical Telepathy API Router.
Pillar 2 of suggestion-v25.md:
- POST /subcortical-telepathy/decode-intuition
- POST /subcortical-telepathy/compile-wasm
- POST /subcortical-telepathy/scaffolding-stream
"""

from fastapi import APIRouter, HTTPException
from app.services.subcortical_telepathy_service import (
    subcortical_telepathy_service,
    DecodeIntuitionRequest,
    CompileThoughtWASMRequest,
    CoProcessorScaffoldRequest
)

router = APIRouter(prefix="/subcortical-telepathy", tags=["Sub-Cortical Telepathy & Thought Compilation (v26.0)"])


@router.post("/decode-intuition")
async def decode_intuition(req: DecodeIntuitionRequest):
    try:
        return subcortical_telepathy_service.decode_preverbal_intuition(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compile-wasm")
async def compile_thought_wasm(req: CompileThoughtWASMRequest):
    try:
        return subcortical_telepathy_service.compile_thought_to_wasm(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/scaffolding-stream")
async def stream_scaffolding(req: CoProcessorScaffoldRequest):
    try:
        return subcortical_telepathy_service.stream_coprocessor_scaffolding(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
