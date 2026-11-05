/**
 * OfferClearance.ts — SkillMatch DNA v19.0
 * Smart Contract Offer Clearance & Salary Benchmarking Client
 * Interfaces with HiringClearance.sol and the compensation oracle (Lightcast, Radford, Levels.fyi)
 */

import { API_BASE as BASE } from '../api-config';

export interface MarketValueEstimateRequest {
  candidate_id: string;
  ccrs: number;
  skill_vector: Record<string, number>;
  role_title: string;
  years_of_experience: number;
  location?: string;
}

export interface MarketValueEstimateResult {
  candidate_id: string;
  role_title: string;
  salary_range_inr: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  equity_range_inr: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  ccrs_premium_pct: number;
  data_sources: string[];
  computed_at: number;
}

export interface GenerateOfferRequestPayload {
  candidate_id: string;
  application_id: string;
  employer_id: string;
  role_title: string;
  ccrs: number;
  pts: number;
  skill_vector: Record<string, number>;
  years_of_experience?: number;
  location?: string;
  equity_cliff_months?: number;
  vesting_months?: number;
}

export interface OfferPackageResult {
  offer_id: string;
  candidate_id: string;
  application_id: string;
  employer_id: string;
  role_title: string;
  base_salary_inr: number;
  signing_bonus_inr: number;
  annual_bonus_pct: number;
  equity_shares: number;
  equity_valuation_inr: number;
  pre_onboarding_goals: string[];
  docusign_envelope_id: string;
  on_chain_commitment: string;
  valid_until_epoch: number;
  status: string;
  issued_at: number;
}

export interface AcceptOfferPayload {
  offer_id: string;
  candidate_wallet_address?: string;
  e_signature_payload: string;
  ip_address?: string;
}

export interface OfferAcceptanceResult {
  offer_id: string;
  status: string;
  accepted_at_epoch: number;
  smart_contract_tx_hash: string;
  on_chain_settled: boolean;
  provisioning_status: {
    okta_sso_created: boolean;
    github_org_invite_sent: boolean;
    slack_workspace_invited: boolean;
    hardware_order_id: string;
  };
}

export class OfferClearanceClient {
  /**
   * Calculates skill-weighted market salary range based on verified CCRS and skills.
   */
  static async estimateMarketValue(req: MarketValueEstimateRequest): Promise<MarketValueEstimateResult> {
    const res = await fetch(`${BASE}/api/v1/hiring/clearance/market-value`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`Market value calculation failed: ${res.statusText}`);
    return await res.json();
  }

  /**
   * Generates a digital offer package with on-chain commitment hash.
   */
  static async generateOffer(payload: GenerateOfferRequestPayload): Promise<OfferPackageResult> {
    const res = await fetch(`${BASE}/api/v1/hiring/offer/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Offer generation failed: ${res.statusText}`);
    return await res.json();
  }

  /**
   * Accepts offer, records commitment on-chain, and triggers automated IT provisioning.
   */
  static async acceptOffer(payload: AcceptOfferPayload): Promise<OfferAcceptanceResult> {
    const res = await fetch(`${BASE}/api/v1/hiring/offer/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Offer acceptance failed: ${res.statusText}`);
    return await res.json();
  }

  /**
   * Retrieves offer details and status by offer ID.
   */
  static async getOffer(offerId: string): Promise<OfferPackageResult> {
    const res = await fetch(`${BASE}/api/v1/hiring/offer/${offerId}`);
    if (!res.ok) throw new Error(`Failed to fetch offer: ${res.statusText}`);
    return await res.json();
  }
}
