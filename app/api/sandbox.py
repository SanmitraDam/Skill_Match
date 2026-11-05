"""
SkillMatch DNA v16.0 — Live Coding Sandbox Router
Pillar 1: Browser-Based WebAssembly Live Coding Sandbox & AST AI Co-Pilot
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.sandbox_service import sandbox_service, SandboxExecuteRequest, ASTProfileRequest

router = APIRouter(prefix="/sandbox", tags=["Live Sandbox"])


@router.post("/execute")
async def execute_code_in_sandbox(req: SandboxExecuteRequest) -> Dict[str, Any]:
    """
    Executes code against edge test cases with sub-10ms SLA,
    evaluates static AST complexity and code quality rubric.
    """
    try:
        return sandbox_service.execute_and_evaluate(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ast-profile")
async def profile_ast_complexity(req: ASTProfileRequest) -> Dict[str, Any]:
    """
    Statically analyzes source code AST for asymptotic Big-O time and space complexity.
    """
    try:
        return sandbox_service.profile_ast_complexity(req.source_code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
