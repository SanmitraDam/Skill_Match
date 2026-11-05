"""
Autonomous Bio-Digital Skill Genome API Router — SkillMatch DNA v22.0
Pillar 2: Gene-Phenotype Skill Hierarchy, Adaptation Velocity & Learning DNA
"""
from fastapi import APIRouter
from typing import Any, Dict, List
from app.services.skill_genome_service import (
    skill_genome_service,
    SkillGenomeMatrix,
    AdaptationVelocityRequest,
    AdaptationVelocityResult,
    SyntheticLearningDNARequest,
    SyntheticMicroLearningDNA
)

router = APIRouter(prefix="/genome", tags=["Autonomous Bio-Digital Skill Genome"])


@router.post("/map-candidate", response_model=SkillGenomeMatrix)
def map_candidate_skill_genome(payload: Dict[str, Any]):
    """Maps candidate capability vector into Foundational DNA, Specialized RNA, and Expressed Phenotypes."""
    candidate_id = payload.get("candidate_id", "cand-default")
    verified_skills = payload.get("verified_skills", ["Rust", "WASM", "eBPF", "vLLM"])
    return skill_genome_service.map_candidate_genome(candidate_id, verified_skills)


@router.post("/adaptation-velocity", response_model=AdaptationVelocityResult)
def calculate_candidate_adaptation_velocity(req: AdaptationVelocityRequest):
    """Calculates candidate learning curve acceleration and predict novel framework ramp-up velocity."""
    return skill_genome_service.calculate_adaptation_velocity(req)


@router.post("/synthesize-learning-dna", response_model=SyntheticMicroLearningDNA)
def synthesize_micro_learning_dna(req: SyntheticLearningDNARequest):
    """Generates targeted synthetic gene remediation modules for detected skill gaps."""
    return skill_genome_service.synthesize_micro_learning_dna(req)


@router.get("/hierarchy/{candidate_id}")
def get_candidate_genome_hierarchy(candidate_id: str):
    """Returns biological skill genome hierarchy and gene density for candidate."""
    record = skill_genome_service.get_genome_hierarchy(candidate_id)
    return record.dict() if record else skill_genome_service.map_candidate_genome(candidate_id, ["Rust", "WASM", "eBPF"]).dict()
