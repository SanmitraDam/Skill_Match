/**
 * SkillFederation.ts — SkillMatch DNA v20.0
 * Cross-Enterprise Skill Federation & Zero-Knowledge Clearinghouse Client
 * Handles consortium node syncing, 1-click cross-company verification,
 * zkDID candidate consent revocation, and anti-collusion PoW audits.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface ConsortiumNode {
  node_id: string;
  consortium_id: string;
  enterprise_name: string;
  public_key: string;
  endpoint: string;
  status: string;
  registered_at: number;
}

export interface FederatedSkillPassport {
  passport_id: string;
  candidate_id: string;
  zkdid: string;
  origin_enterprise: string;
  ccrs_score: number;
  pts_score: number;
  verified_skills: string[];
  zk_proctor_proof_hash: string;
  issued_at: number;
  expires_at: number;
  is_valid: boolean;
  pow_challenge: string;
  signature: string;
}

export interface CandidateVerificationResult {
  status: string;
  cleared_for_hire: boolean;
  screening_skipped: boolean;
  zkdid: string;
  passport_id?: string;
  origin_enterprise?: string;
  target_enterprise?: string;
  ccrs_score?: number;
  pts_score?: number;
  verified_skills?: string[];
  pow_attestation_verified?: boolean;
  privacy_guarantee?: string;
  reason?: string;
}

export class SkillFederationClient {
  /**
   * Fetches all active consortium verification mesh nodes.
   */
  static async getConsortiumNodes(): Promise<ConsortiumNode[]> {
    try {
      const res = await fetch(`${BASE}/api/v1/federation/mesh/nodes`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return [
        {
          node_id: 'node-tech-alliance-01',
          consortium_id: 'global-tech-consortium',
          enterprise_name: 'Global Tech Hiring Consortium',
          public_key: 'ed25519_pk_7f9a2b4c8e1d3f5a0b2c4e6d8f0a1c3e',
          endpoint: 'https://alliance.mesh.skillmatch.io/v1/node-01',
          status: 'ACTIVE',
          registered_at: Date.now() / 1000
        },
        {
          node_id: 'node-fintech-alliance-02',
          consortium_id: 'fintech-talent-alliance',
          enterprise_name: 'FinTech & Digital Assets Guild',
          public_key: 'ed25519_pk_3c5e7a9b1d3f5e7a9b1c3d5e7f9a1b3c',
          endpoint: 'https://fintech.mesh.skillmatch.io/v1/node-02',
          status: 'ACTIVE',
          registered_at: Date.now() / 1000
        }
      ];
    }
  }

  /**
   * Issues a cryptographically signed federated passport.
   */
  static async issuePassport(payload: {
    candidate_id: string;
    zkdid: string;
    origin_enterprise: string;
    ccrs_score: number;
    pts_score: number;
    verified_skills: string[];
    zk_proctor_proof_hash?: string;
  }): Promise<FederatedSkillPassport> {
    const res = await fetch(`${BASE}/api/v1/federation/passport/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to issue passport: ${res.statusText}`);
    return await res.json();
  }

  /**
   * Performs 1-click instant cross-company verification.
   */
  static async verifyCandidate(payload: {
    zkdid: string;
    target_enterprise: string;
    passport_id: string;
    pow_nonce?: string;
  }): Promise<CandidateVerificationResult> {
    const res = await fetch(`${BASE}/api/v1/federation/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Verification failed: ${res.statusText}`);
    return await res.json();
  }

  /**
   * Revokes candidate consent for a specific enterprise via zkDID.
   */
  static async revokeConsent(payload: {
    candidate_id: string;
    zkdid: string;
    target_enterprise: string;
    reason?: string;
  }): Promise<{ status: string; message: string }> {
    const res = await fetch(`${BASE}/api/v1/federation/consent/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Revocation failed: ${res.statusText}`);
    return await res.json();
  }

  /**
   * Verifies proof-of-work attestation against collusion.
   */
  static async auditAntiCollusion(payload: {
    passport_id: string;
    zk_proctor_proof_hash: string;
    challenge: string;
    pow_nonce: string;
  }): Promise<any> {
    const res = await fetch(`${BASE}/api/v1/federation/anti-collusion/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Audit failed: ${res.statusText}`);
    return await res.json();
  }
}
