"""
SkillMatch DNA v6.0 - Neuro-Symbolic Logic Solver API Router
Endpoints:
- POST /logic/verify-prerequisites : Formally verifies roadmap ordering against hard prerequisite constraints
- POST /logic/check-circularity : Mathematically proves acyclicity (zero circular loops) in DAG
- POST /logic/entailment-proof : Synthesizes deductive proof for skill-to-objective transition
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from app.services.neuro_symbolic_solver import NeuroSymbolicSolver

router = APIRouter(prefix="/logic", tags=["Neuro-Symbolic Logic Solver (Z3)"])

class VerifyRoadmapRequest(BaseModel):
    modules: List[Dict[str, Any]] = Field(
        ...,
        json_schema_extra={"example": [
            {"module_index": 1, "title": "Linear Algebra & Probability", "skills_covered": ["linear algebra & probability"]},
            {"module_index": 2, "title": "Attention & Transformers", "skills_covered": ["attention mechanisms", "deep learning / transformers"]},
            {"module_index": 3, "title": "Inference Systems", "skills_covered": ["vllm pagedattention"]}
        ]}
    )
    custom_prerequisites: Optional[Dict[str, List[str]]] = None

class CheckCircularityRequest(BaseModel):
    edges: List[List[str]] = Field(
        ...,
        json_schema_extra={"example": [
            ["Linear Algebra & Probability", "Attention Mechanisms"],
            ["Attention Mechanisms", "Deep Learning / Transformers"],
            ["Deep Learning / Transformers", "vLLM PagedAttention"]
        ]}
    )

class EntailmentProofRequest(BaseModel):
    antecedent_skill: str = Field(..., json_schema_extra={"example": "Attention Mechanisms"})
    consequent_skill: str = Field(..., json_schema_extra={"example": "Deep Learning / Transformers"})

@router.post("/verify-prerequisites")
def verify_prerequisites(req: VerifyRoadmapRequest):
    solver = NeuroSymbolicSolver()
    result = solver.verify_roadmap_logic(
        modules=req.modules,
        custom_prerequisites=req.custom_prerequisites
    )
    return {"status": "success", **result}

@router.post("/check-circularity")
def check_circularity(req: CheckCircularityRequest):
    solver = NeuroSymbolicSolver()
    # Convert edge list of pairs
    tuple_edges = [(e[0], e[1]) for e in req.edges if len(e) >= 2]
    result = solver.detect_circular_dependencies(edges=tuple_edges)
    return {"status": "success", **result}

@router.post("/entailment-proof")
def generate_entailment_proof(req: EntailmentProofRequest):
    solver = NeuroSymbolicSolver()
    result = solver.generate_formal_entailment_proof(
        antecedent_skill=req.antecedent_skill,
        consequent_skill=req.consequent_skill
    )
    return {"status": "success", **result}
