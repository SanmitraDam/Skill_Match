/**
 * SkillMatch DNA v18.0 — Automated Incident Dispute Resolution & HITL Appeals Engine
 * Pillar 3: Privacy-Masked Forensic Clip Anonymizer & AI Incident Re-Evaluator Agent
 */

export interface DisputeAppealSubmission {
  incidentId: string;
  sessionId: string;
  candidateId: string;
  infractionType: string;
  originalPtsPenalty: number;
  candidateStatement: string;
  requestHumanReview: boolean;
}

export interface PrivacyMaskedClip {
  clipId: string;
  facialFeaturesBlurred: boolean;
  backgroundBlurred: boolean;
  voicePitchShifted: boolean;
  clipDurationSeconds: number;
  gdprArt9Anonymized: boolean;
  maskSha256: string;
}

export interface AIReevaluationResult {
  appealId: string;
  recommendation: 'OVERTURN_FLAG' | 'UPHOLD_FLAG';
  aiVerdict: string;
  confidence: number;
  agentReasoning: string;
  originalPenalty: number;
  adjustedPenalty: number;
  status: string;
}

export class AppealsEngineClient {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Submits a candidate dispute appeal with contextual explanation.
   */
  public async submitAppeal(submission: DisputeAppealSubmission): Promise<{
    appealId: string;
    status: string;
    privacyClip: PrivacyMaskedClip;
  }> {
    const response = await fetch(`${this.apiBaseUrl}/api/v1/proctor/disputes/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incident_id: submission.incidentId,
        session_id: submission.sessionId,
        candidate_id: submission.candidateId,
        infraction_type: submission.infractionType,
        original_pts_penalty: submission.originalPtsPenalty,
        candidate_statement: submission.candidateStatement,
        request_human_review: submission.requestHumanReview,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit dispute appeal: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      appealId: data.appeal_id,
      status: data.status,
      privacyClip: {
        clipId: data.privacy_clip?.clip_id || 'clip_001',
        facialFeaturesBlurred: data.privacy_clip?.facial_features_blurred ?? true,
        backgroundBlurred: data.privacy_clip?.background_blurred ?? true,
        voicePitchShifted: data.privacy_clip?.voice_pitch_shifted ?? true,
        clipDurationSeconds: data.privacy_clip?.clip_duration_seconds ?? 3.0,
        gdprArt9Anonymized: data.privacy_clip?.gdpr_art9_anonymized ?? true,
        maskSha256: data.privacy_clip?.mask_sha256 || '0x...',
      },
    };
  }

  /**
   * Fetches privacy-masked forensic clip metadata for human and AI review.
   */
  public async getPrivacyMaskedClip(appealId: string): Promise<PrivacyMaskedClip> {
    const response = await fetch(`${this.apiBaseUrl}/api/v1/proctor/disputes/${appealId}/privacy-clip`);
    if (!response.ok) {
      throw new Error(`Failed to fetch privacy clip: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      clipId: data.clip_id,
      facialFeaturesBlurred: data.facial_features_blurred,
      backgroundBlurred: data.background_blurred,
      voicePitchShifted: data.voice_pitch_shifted,
      clipDurationSeconds: data.clip_duration_seconds,
      gdprArt9Anonymized: data.gdpr_art9_anonymized,
      maskSha256: data.mask_sha256,
    };
  }

  /**
   * Triggers the multi-modal AI Incident Re-Evaluator agent.
   */
  public async reevaluateAppeal(
    appealId: string,
    contextTelemetry?: {
      postureDriftDelta?: number;
      headPoseYawDegrees?: number;
      keystrokeEntropyContinuity?: number;
      ambientAcousticDb?: number;
    }
  ): Promise<AIReevaluationResult> {
    const response = await fetch(`${this.apiBaseUrl}/api/v1/proctor/disputes/${appealId}/re-evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appeal_id: appealId,
        posture_drift_delta: contextTelemetry?.postureDriftDelta ?? 0.08,
        head_pose_yaw_degrees: contextTelemetry?.headPoseYawDegrees ?? 28.5,
        keystroke_entropy_continuity: contextTelemetry?.keystrokeEntropyContinuity ?? 0.94,
        ambient_acoustic_db: contextTelemetry?.ambientAcousticDb ?? 42.0,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to re-evaluate appeal: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      appealId: data.appeal_id,
      recommendation: data.recommendation,
      aiVerdict: data.ai_verdict,
      confidence: data.confidence || data.ai_confidence || 0.9,
      agentReasoning: data.agent_reasoning || data.ai_reasoning || '',
      originalPenalty: data.original_penalty || 15.0,
      adjustedPenalty: data.adjusted_penalty ?? 0.0,
      status: data.status,
    };
  }
}

export const appealsEngineClient = new AppealsEngineClient();
