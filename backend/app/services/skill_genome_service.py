"""
Autonomous Bio-Digital Skill Genome Service — SkillMatch DNA v22.0
Pillar 2: Gene-Phenotype Hierarchy, Adaptation Velocity Index (AVI) & Synthetic Micro-Learning DNA
"""
from __future__ import annotations

import math
import time
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class FoundationalDNAGene(BaseModel):
    gene_id: str
    gene_name: str # e.g. "Algorithmic Complexity Theory", "Distributed Systems Topology"
    mastery_percentile: float # 0 - 100%
    stability_half_life_months: int = 120 # Foundational DNA stays relevant for a decade
    expression_weight: float = 0.4


class SpecializedRNAGene(BaseModel):
    gene_id: str
    gene_name: str # e.g. "WebAssembly (WASM)", "eBPF Tracing", "vLLM Kernel Tuning"
    proficiency_score: float # 0 - 100%
    evolution_speed_rank: str = "HIGH_MUTATION_RATE"
    parent_dna_gene_ids: List[str]
    expression_weight: float = 0.35


class ExpressedPhenotype(BaseModel):
    phenotype_id: str
    capability_name: str # e.g. "Sub-400ms WebRTC Multi-Modal AI Mesh Pipeline"
    production_readiness_score: float # 0 - 100%
    verified_artifacts_count: int
    contributing_genes: List[str]


class SkillGenomeMatrix(BaseModel):
    genome_id: str
    candidate_id: str
    zkdid: str
    foundational_dna: List[FoundationalDNAGene]
    specialized_rna: List[SpecializedRNAGene]
    expressed_phenotypes: List[ExpressedPhenotype]
    total_genome_density: float # 0 - 1.0
    mapped_at: float = Field(default_factory=time.time)


class AdaptationVelocityRequest(BaseModel):
    candidate_id: str
    historical_learning_milestones: List[Dict[str, Any]] # milestone: str, hours_to_master: float, tech_family: str
    target_emerging_tech: str # e.g. "Photonic QKE Integration"


class AdaptationVelocityResult(BaseModel):
    candidate_id: str
    target_emerging_tech: str
    adaptation_velocity_index: float # 0 - 100 (e.g. 94.2)
    predicted_ramp_up_days: float
    learning_curve_gradient: float # d(Mastery)/dt
    transition_affinity_score: float
    recommended_pathway: str


class SyntheticLearningDNARequest(BaseModel):
    candidate_id: str
    target_skill_gap: str # e.g. "eBPF Kernel Tracing"
    current_foundational_dna: List[str]
    learning_style: str = "PRACTICE_DRIVEN_SANDBOX"


class SyntheticMicroLearningDNA(BaseModel):
    curriculum_id: str
    candidate_id: str
    target_skill_gap: str
    synthesized_gene_modules: List[Dict[str, Any]]
    estimated_mastery_hours: float
    flashcard_scaffolds_count: int
    sandbox_exercise_count: int
    remediation_readiness_boost_pct: float
    generated_at: float = Field(default_factory=time.time)


# ---------------------------------------------------------------------------
# Service Implementation
# ---------------------------------------------------------------------------

class SkillGenomeService:
    def __init__(self):
        self._genomes: Dict[str, SkillGenomeMatrix] = {}
        self._seed_default_genomes()

    def _seed_default_genomes(self):
        cand_id = "cand-interplanetary-101"
        g = SkillGenomeMatrix(
            genome_id=f"gen-{uuid.uuid4().hex[:8]}",
            candidate_id=cand_id,
            zkdid="zkdid:genome:plonky3:0x11aabbcc",
            foundational_dna=[
                FoundationalDNAGene(
                    gene_id="dna-algo-01",
                    gene_name="Algorithms & Advanced Data Structures",
                    mastery_percentile=98.2,
                    stability_half_life_months=120
                ),
                FoundationalDNAGene(
                    gene_id="dna-sys-02",
                    gene_name="Distributed Systems Architecture & Concurrency",
                    mastery_percentile=95.4,
                    stability_half_life_months=100
                ),
                FoundationalDNAGene(
                    gene_id="dna-math-03",
                    gene_name="Abstract Algebra & Cryptographic Primitives",
                    mastery_percentile=92.1,
                    stability_half_life_months=140
                )
            ],
            specialized_rna=[
                SpecializedRNAGene(
                    gene_id="rna-wasm-01",
                    gene_name="WebAssembly (WASM) Engine Optimization",
                    proficiency_score=94.0,
                    parent_dna_gene_ids=["dna-algo-01", "dna-sys-02"]
                ),
                SpecializedRNAGene(
                    gene_id="rna-ebpf-02",
                    gene_name="eBPF Kernel Profiling & Telemetry",
                    proficiency_score=89.5,
                    parent_dna_gene_ids=["dna-sys-02"]
                ),
                SpecializedRNAGene(
                    gene_id="rna-vllm-03",
                    gene_name="vLLM PagedAttention Distributed Model Serving",
                    proficiency_score=92.8,
                    parent_dna_gene_ids=["dna-sys-02", "dna-math-03"]
                )
            ],
            expressed_phenotypes=[
                ExpressedPhenotype(
                    phenotype_id="pheno-mesh-01",
                    capability_name="Sub-400ms WebRTC Multi-Modal AI Mesh Pipeline",
                    production_readiness_score=96.4,
                    verified_artifacts_count=8,
                    contributing_genes=["rna-wasm-01", "rna-vllm-03", "dna-sys-02"]
                ),
                ExpressedPhenotype(
                    phenotype_id="pheno-crdt-02",
                    capability_name="Zero-Contention Conflict-Free Delta-CRDT Engine",
                    production_readiness_score=94.2,
                    verified_artifacts_count=5,
                    contributing_genes=["dna-algo-01", "dna-sys-02"]
                )
            ],
            total_genome_density=0.942
        )
        self._genomes[cand_id] = g

    def map_candidate_genome(self, candidate_id: str, verified_skills: List[str]) -> SkillGenomeMatrix:
        """
        Maps raw verified skill arrays into structured Foundational DNA, Specialized RNA,
        and Expressed Phenotypes with biological hierarchy.
        """
        if candidate_id in self._genomes:
            return self._genomes[candidate_id]

        dna_genes = [
            FoundationalDNAGene(
                gene_id=f"dna-{uuid.uuid4().hex[:6]}",
                gene_name="Algorithms & Complexity Analysis",
                mastery_percentile=92.0
            ),
            FoundationalDNAGene(
                gene_id=f"dna-{uuid.uuid4().hex[:6]}",
                gene_name="Operating Systems & Concurrency",
                mastery_percentile=90.5
            )
        ]

        rna_genes = []
        for s in verified_skills[:4]:
            rna_genes.append(
                SpecializedRNAGene(
                    gene_id=f"rna-{uuid.uuid4().hex[:6]}",
                    gene_name=s,
                    proficiency_score=91.0,
                    parent_dna_gene_ids=[g.gene_id for g in dna_genes]
                )
            )

        phenotypes = [
            ExpressedPhenotype(
                phenotype_id=f"pheno-{uuid.uuid4().hex[:6]}",
                capability_name=f"High-Throughput {verified_skills[0] if verified_skills else 'Systems'} Production Engine",
                production_readiness_score=93.5,
                verified_artifacts_count=4,
                contributing_genes=[r.gene_id for r in rna_genes]
            )
        ]

        genome = SkillGenomeMatrix(
            genome_id=f"gen-{uuid.uuid4().hex[:8]}",
            candidate_id=candidate_id,
            zkdid=f"zkdid:genome:plonky3:{uuid.uuid4().hex[:8]}",
            foundational_dna=dna_genes,
            specialized_rna=rna_genes,
            expressed_phenotypes=phenotypes,
            total_genome_density=0.915
        )
        self._genomes[candidate_id] = genome
        return genome

    def calculate_adaptation_velocity(self, req: AdaptationVelocityRequest) -> AdaptationVelocityResult:
        """
        Calculates the candidate's speed of mastering novel technologies based on
        past learning curve acceleration.
        """
        milestones = req.historical_learning_milestones
        if not milestones:
            avg_hours = 24.0
        else:
            avg_hours = sum(float(m.get("hours_to_master", 20.0)) for m in milestones) / max(len(milestones), 1)

        # Baseline: 30 hours is standard; <15 is hyper-adaptive
        speed_factor = max(0.5, min(2.5, 30.0 / max(avg_hours, 1.0)))
        avi = round(min(99.4, 75.0 + speed_factor * 10.0), 1)
        gradient = round(speed_factor * 1.42, 2)
        predicted_days = round(max(3.0, 14.0 / speed_factor), 1)

        return AdaptationVelocityResult(
            candidate_id=req.candidate_id,
            target_emerging_tech=req.target_emerging_tech,
            adaptation_velocity_index=avi,
            predicted_ramp_up_days=predicted_days,
            learning_curve_gradient=gradient,
            transition_affinity_score=round(avi * 0.98, 1),
            recommended_pathway=f"Accelerated {req.target_emerging_tech} Synthesis via Foundation DNA Mapping"
        )

    def synthesize_micro_learning_dna(self, req: SyntheticLearningDNARequest) -> SyntheticMicroLearningDNA:
        """
        Creates personalized micro-learning sequences for target skill gaps.
        """
        modules = [
            {
                "module_index": 1,
                "title": f"{req.target_skill_gap}: Conceptual Core & Zero-Copy Anatomy",
                "duration_minutes": 25,
                "type": "THEORETICAL_DECOMPOSITION"
            },
            {
                "module_index": 2,
                "title": f"Kernel Scaffold Construction in Sandbox",
                "duration_minutes": 45,
                "type": "INTERACTIVE_CODE_SANDBOX"
            },
            {
                "module_index": 3,
                "title": f"Production Stress Testing & Latency Benchmarking",
                "duration_minutes": 40,
                "type": "BENCHMARK_PROVING"
            }
        ]

        return SyntheticMicroLearningDNA(
            curriculum_id=f"curr-{uuid.uuid4().hex[:8]}",
            candidate_id=req.candidate_id,
            target_skill_gap=req.target_skill_gap,
            synthesized_gene_modules=modules,
            estimated_mastery_hours=1.85,
            flashcard_scaffolds_count=18,
            sandbox_exercise_count=3,
            remediation_readiness_boost_pct=14.5
        )

    def get_genome_hierarchy(self, candidate_id: str) -> Optional[SkillGenomeMatrix]:
        return self._genomes.get(candidate_id)


# Global singleton
skill_genome_service = SkillGenomeService()
