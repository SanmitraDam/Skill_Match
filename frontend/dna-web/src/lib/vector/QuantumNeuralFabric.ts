/**
 * QuantumNeuralFabric.ts — SkillMatch DNA v21.0
 * Quantum-Neural Knowledge Fabric & Photonic QKE Client
 * Maps candidate skills into 1,024-qubit Hilbert space manifolds, computes
 * sub-nanosecond Photonic QKE similarity scores, and transduces bio-neural intent.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface QuantumStateProjection {
  projection_id: string;
  candidate_id: string;
  qubits_allocated: number;
  state_vector_norm: number;
  quantum_entropy: number;
  superposition_density: number;
  emergent_synergy_multiplier: number;
  quantum_state_hash: string;
  projected_at: number;
}

export interface PhotonicQKEMatchResult {
  match_id: string;
  photonic_affinity_score: number;
  quantum_kernel_overlap: number;
  synergy_boost_pct: number;
  computation_latency_ns: number;
  optical_teraops_utilized: number;
  synergy_breakdown: Array<{ synergy_pair: string; boost_pct: number; domain: string }>;
  computed_at: number;
}

export interface BioNeuralSyncResult {
  sync_id: string;
  candidate_id: string;
  cognitive_load_index: number;
  pre_verbal_clarity_score: number;
  synthesized_architecture_spec: string;
  transduced_code_scaffold: string;
  thought_speed_latency_ms: number;
}

export class QuantumNeuralFabricClient {
  /**
   * Projects skills into 1,024-qubit non-Euclidean quantum Hilbert state.
   */
  static async projectToHilbertSpace(payload: {
    candidate_id: string;
    skills: string[];
    proficiency_ratings?: number[];
    hilbert_qubit_dimensions?: number;
  }): Promise<QuantumStateProjection> {
    const res = await fetch(`${BASE}/api/v1/quantum/hilbert/project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        proficiency_ratings: payload.proficiency_ratings || payload.skills.map(() => 0.85),
        hilbert_qubit_dimensions: payload.hilbert_qubit_dimensions || 1024,
      }),
    });
    if (!res.ok) throw new Error(`Quantum projection failed: ${res.statusText}`);
    return await res.json();
  }

  /**
   * Computes sub-nanosecond Photonic QKE affinity score.
   */
  static async computePhotonicQKE(payload: {
    candidate_state_hash: string;
    job_target_skills: string[];
    candidate_skills: string[];
  }): Promise<PhotonicQKEMatchResult> {
    const res = await fetch(`${BASE}/api/v1/quantum/photonic/qke-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Photonic QKE failed: ${res.statusText}`);
    return await res.json();
  }

  /**
   * Synchronizes non-invasive brainwave telemetry into architecture spec.
   */
  static async syncBioNeuralIntent(payload: {
    candidate_id: string;
    problem_domain?: string;
  }): Promise<BioNeuralSyncResult> {
    const res = await fetch(`${BASE}/api/v1/quantum/bio-neural/sync-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Bio-neural sync failed: ${res.statusText}`);
    return await res.json();
  }
}
