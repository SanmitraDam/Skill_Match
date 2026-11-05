/**
 * SkillGenomeEngine — SkillMatch DNA v22.0
 * Pillar 2: Bio-Digital Skill Genome Mapping, Adaptation Velocity Index (AVI) & Micro-Learning DNA
 */

export interface FoundationalDNA {
  geneId: string;
  name: string;
  masteryPercentile: number;
  halfLifeYears: number;
}

export interface SpecializedRNA {
  geneId: string;
  name: string;
  proficiencyScore: number;
  mutationSpeed: 'RAPID_EVOLUTION' | 'STABLE_STANDARD';
  parentDnaIds: string[];
}

export interface ExpressedPhenotype {
  phenotypeId: string;
  capabilityName: string;
  productionReadinessScore: number;
  verifiedArtifactsCount: number;
  contributingGenes: string[];
}

export interface SkillGenomeMatrix {
  candidateId: string;
  zkdid: string;
  foundationalDNA: FoundationalDNA[];
  specializedRNA: SpecializedRNA[];
  expressedPhenotypes: ExpressedPhenotype[];
  totalGenomeDensity: number;
}

export interface AdaptationVelocityMetrics {
  adaptationVelocityIndex: number; // 0 - 100
  predictedRampUpDays: number;
  learningCurveGradient: number;
  transitionAffinityScore: number;
}

export interface MicroLearningDNA {
  curriculumId: string;
  targetSkillGap: string;
  modules: Array<{
    title: string;
    durationMinutes: number;
    type: string;
  }>;
  estimatedHours: number;
  flashcardScaffoldsCount: number;
  readinessBoostPct: number;
}

export class SkillGenomeEngine {
  /**
   * Deconstructs a candidate's verified skill vector into the biological genome hierarchy.
   */
  public static mapGenome(candidateId: string, verifiedSkills: string[]): SkillGenomeMatrix {
    const foundational: FoundationalDNA[] = [
      {
        geneId: 'dna-algo-01',
        name: 'Algorithmic Complexity Theory & Graph Topologies',
        masteryPercentile: 98.4,
        halfLifeYears: 10,
      },
      {
        geneId: 'dna-sys-02',
        name: 'Distributed Systems & Memory Concurrency Models',
        masteryPercentile: 96.1,
        halfLifeYears: 8,
      },
      {
        geneId: 'dna-math-03',
        name: 'Abstract Algebraic Primitives & Cryptographic Proofs',
        masteryPercentile: 93.8,
        halfLifeYears: 12,
      },
    ];

    const rna: SpecializedRNA[] = verifiedSkills.map((s, idx) => ({
      geneId: `rna-${idx}-${s.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      name: s,
      proficiencyScore: Number((88.0 + (idx * 3.5) % 11.5).toFixed(1)),
      mutationSpeed: idx % 2 === 0 ? 'RAPID_EVOLUTION' : 'STABLE_STANDARD',
      parentDnaIds: ['dna-algo-01', 'dna-sys-02'],
    }));

    const phenotypes: ExpressedPhenotype[] = [
      {
        phenotypeId: 'pheno-webrtc-01',
        capabilityName: 'Sub-400ms WebRTC Multi-Modal AI Mesh Pipeline',
        productionReadinessScore: 96.2,
        verifiedArtifactsCount: 6,
        contributingGenes: rna.map((r) => r.geneId),
      },
      {
        phenotypeId: 'pheno-crdt-02',
        capabilityName: 'Zero-Contention Conflict-Free Delta-CRDT Engine',
        productionReadinessScore: 94.8,
        verifiedArtifactsCount: 4,
        contributingGenes: ['dna-algo-01', 'dna-sys-02'],
      },
    ];

    return {
      candidateId,
      zkdid: `zkdid:genome:plonky3:${candidateId.slice(0, 8)}`,
      foundationalDNA: foundational,
      specializedRNA: rna,
      expressedPhenotypes: phenotypes,
      totalGenomeDensity: 0.945,
    };
  }

  /**
   * Evaluates the candidate's speed of mastering novel technologies based on past learning curves.
   */
  public static calculateAVI(avgHoursToMaster: number = 18.0): AdaptationVelocityMetrics {
    const speedMultiplier = Math.max(0.6, Math.min(2.5, 30.0 / Math.max(avgHoursToMaster, 1.0)));
    const avi = Number(Math.min(99.5, 74.0 + speedMultiplier * 10.5).toFixed(1));
    const days = Number(Math.max(3.0, 14.0 / speedMultiplier).toFixed(1));
    const gradient = Number((speedMultiplier * 1.45).toFixed(2));

    return {
      adaptationVelocityIndex: avi,
      predictedRampUpDays: days,
      learningCurveGradient: gradient,
      transitionAffinityScore: Number((avi * 0.98).toFixed(1)),
    };
  }

  /**
   * Synthesizes personalized learning DNA modules for targeted gene remediation.
   */
  public static synthesizeRemediationDNA(targetSkillGap: string): MicroLearningDNA {
    return {
      curriculumId: `curr-${Math.random().toString(36).substring(2, 8)}`,
      targetSkillGap,
      modules: [
        { title: `${targetSkillGap}: Architecture & Memory Mechanics`, durationMinutes: 25, type: 'DECONSTRUCTION' },
        { title: 'Interactive Sandbox Implementation', durationMinutes: 45, type: 'SANDBOX_LAB' },
        { title: 'Production Stress Testing & Benchmark Verification', durationMinutes: 35, type: 'VERIFICATION' },
      ],
      estimatedHours: 1.75,
      flashcardScaffoldsCount: 16,
      readinessBoostPct: 15.2,
    };
  }
}
