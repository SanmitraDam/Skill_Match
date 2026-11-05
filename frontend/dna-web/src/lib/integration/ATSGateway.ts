/**
 * ATSGateway.ts — SkillMatch DNA v19.0
 * Bi-Directional ATS/HRIS Webhook Gateway Client
 * Handles Greenhouse, Lever, Workday, BambooHR, SAP SuccessFactors integration
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface ATSIntegrationConfig {
  integration_id: string;
  ats_provider: string;
  webhook_url: string;
  status: 'active' | 'pending' | 'error';
  field_mapping: Record<string, string>;
  created_at: number;
  last_event_at: number | null;
}

export interface InboundWebhookEvent {
  ats_provider: string;
  event_type: string;
  candidate_id: string;
  candidate_email: string;
  stage_name: string;
  application_id: string;
  hmac_signature?: string;
  payload_timestamp?: number;
}

export interface ATSIntegrationRequest {
  ats_provider: string;
  webhook_url: string;
  api_key: string;
  hmac_secret: string;
  field_mapping?: Record<string, string>;
}

export interface OutboundPayloadResult {
  payload: {
    candidate_id: string;
    application_id: string;
    ats_provider: string;
    ccrs: number;
    ccrs_breakdown: { S_match: number; A_quiz: number; I_voice: number };
    pts: number;
    zk_proof_hash: string;
    forensic_report_url: string;
    recruiter_hud_url: string;
    signed_at_epoch: number;
  };
  ats_field_mapping: Record<string, unknown>;
}

export interface WebhookTestResult {
  integration_id: string;
  success: boolean;
  latency_ms: number;
  response_status: number;
  message: string;
}

export interface InboundWebhookResult {
  event_id: string;
  ats_provider: string;
  candidate_id: string;
  stage_name: string;
  signature_valid: boolean;
  should_trigger_assessment: boolean;
  invitation: {
    candidate_id: string;
    invitation_token: string;
    assessment_url: string;
    expires_at: number;
  } | null;
  processed_at: number;
}

export class ATSGatewayClient {
  /** Simulate an inbound ATS stage-change webhook */
  async simulateInboundWebhook(event: InboundWebhookEvent): Promise<InboundWebhookResult> {
    const res = await fetch(`${BASE}/ats/webhook/inbound`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!res.ok) throw new Error(`ATS inbound webhook failed: ${res.status}`);
    return res.json();
  }

  /** Build and return a mapped outbound score payload for an ATS provider */
  async sendOutboundPayload(params: {
    candidate_id: string;
    application_id: string;
    ats_provider: string;
    ccrs: number;
    s_match: number;
    a_quiz: number;
    i_voice: number;
    pts: number;
  }): Promise<OutboundPayloadResult> {
    const query = new URLSearchParams({
      candidate_id: params.candidate_id,
      application_id: params.application_id,
      ats_provider: params.ats_provider,
      ccrs: String(params.ccrs),
      s_match: String(params.s_match),
      a_quiz: String(params.a_quiz),
      i_voice: String(params.i_voice),
      pts: String(params.pts),
    });
    const res = await fetch(`${BASE}/ats/webhook/outbound?${query}`, { method: 'POST' });
    if (!res.ok) throw new Error(`ATS outbound payload failed: ${res.status}`);
    return res.json();
  }

  /** List all configured ATS integrations */
  async listIntegrations(): Promise<ATSIntegrationConfig[]> {
    const res = await fetch(`${BASE}/ats/integrations`);
    if (!res.ok) throw new Error(`List integrations failed: ${res.status}`);
    return res.json();
  }

  /** Configure a new ATS/HRIS integration */
  async configureIntegration(req: ATSIntegrationRequest): Promise<ATSIntegrationConfig> {
    const res = await fetch(`${BASE}/ats/integrations/configure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`Configure integration failed: ${res.status}`);
    return res.json();
  }

  /** Test an ATS webhook endpoint connection */
  async testConnection(integration_id: string): Promise<WebhookTestResult> {
    const res = await fetch(`${BASE}/ats/test-connection?integration_id=${encodeURIComponent(integration_id)}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Test connection failed: ${res.status}`);
    return res.json();
  }
}
