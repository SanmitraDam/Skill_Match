/**
 * RLAHFCalibrator.ts — SkillMatch DNA v19.0
 * Post-Hiring RLAHF Model Calibration Client
 * Connects 30/60/90-day telemetry to CAT item difficulty (b_i) and vector weight updates
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface PerformanceTelemetryEvent {
  employee_id: string;
  candidate_id: string;
  employer_id: string;
  assessment_ccrs: number;
  assessment_quiz_score: number;
  day_30_prs_merged: number;
  day_30_tickets_closed: number;
  day_30_manager_rating: number;
  day_60_prs_merged?: number;
  day_60_tickets_closed?: number;
  day_60_manager_rating?: number;
  day_90_prs_merged?: number;
  day_90_tickets_closed?: number;
  day_90_manager_rating?: number;
  skill_domain: string;
  telemetry_epoch?: number;
}

export interface TelemetryIngestionResult {
  event_id: string;
  employee_id: string;
  correlation_score: number;
  onboarding_velocity_score: number;
  performance_tier: 'top_performer' | 'meets_expectations' | 'needs_support';
  ccrs_prediction_accuracy_pct: number;
  ingested_at: number;
}

export interface CALBRequestBody {
  skill_domain: string;
  min_samples?: number;
  force_recalibrate?: boolean;
}

export interface BiAdjustment {
  item_id: string;
  old_b_i: number;
  new_b_i: number;
  delta: number;
  correlation_r: number;
  retired: boolean;
}

export interface RLAHFUpdateResponse {
  calibration_id: string;
  skill_domain: string;
  items_recalibrated: number;
  items_retired: number;
  b_i_adjustments: BiAdjustment[];
  weight_updates: Record<string, number>;
  vector_matcher_drift_pct: number;
  model_version: string;
  calibrated_at: number;
}

export interface ModelWeightsResponse {
  model_version: string;
  skill_weights: Record<string, number>;
  cat_difficulty_distribution: Record<string, number>;
  last_calibrated_at: number;
  total_telemetry_samples: number;
  global_ccrs_prediction_accuracy_pct: number;
}

export interface CalibrationHistoryEntry {
  calibration_id: string;
  skill_domain: string;
  items_recalibrated: number;
  items_retired: number;
  vector_matcher_drift_pct: number;
  calibrated_at: number;
}

export class RLAHFCalibratorClient {
  /** Ingest 30/60/90-day onboarding telemetry */
  async ingestPerformanceTelemetry(event: PerformanceTelemetryEvent): Promise<TelemetryIngestionResult> {
    const res = await fetch(`${BASE}/rlahf/performance/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!res.ok) throw new Error(`Telemetry ingestion failed: ${res.status}`);
    return res.json();
  }

  /** Trigger RLAHF model recalibration for a skill domain */
  async triggerCalibration(req: CALBRequestBody): Promise<RLAHFUpdateResponse> {
    const res = await fetch(`${BASE}/rlahf/calibrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`Calibration failed: ${res.status}`);
    return res.json();
  }

  /** Fetch current global model weights and prediction accuracy */
  async getModelWeights(): Promise<ModelWeightsResponse> {
    const res = await fetch(`${BASE}/rlahf/model-weights`);
    if (!res.ok) throw new Error(`Get model weights failed: ${res.status}`);
    return res.json();
  }

  /** Retrieve calibration history for audit and drift analysis */
  async getCalibrationHistory(): Promise<CalibrationHistoryEntry[]> {
    const res = await fetch(`${BASE}/rlahf/calibration-history`);
    if (!res.ok) throw new Error(`Get calibration history failed: ${res.status}`);
    return res.json();
  }
}
