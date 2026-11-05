/**
 * OnboardingTracker.ts — SkillMatch DNA v19.0
 * 30/60/90-Day Employee Onboarding Velocity Tracking & Manager Review Alignment
 * Measures employee GitHub code commits, Jira ticket completion velocity,
 * and manager ratings to correlate assessment readiness scores with real-world job performance.
 */

import { API_BASE as BASE } from '../api-config';

export interface OnboardingTelemetry {
  employee_id: string;
  candidate_id: string;
  employer_id: string;
  assessment_ccrs: number;
  assessment_quiz_score: number;
  skill_domain: string;
  day_30_prs_merged: number;
  day_30_tickets_closed: number;
  day_30_manager_rating: number; // 1.0 to 5.0
  day_60_prs_merged?: number;
  day_60_tickets_closed?: number;
  day_60_manager_rating?: number;
  day_90_prs_merged?: number;
  day_90_tickets_closed?: number;
  day_90_manager_rating?: number;
  telemetry_epoch?: number;
}

export interface IngestionResult {
  event_id: string;
  employee_id: string;
  correlation_score: number;
  onboarding_velocity_score: number;
  performance_tier: 'top_performer' | 'meets_expectations' | 'needs_support';
  ccrs_prediction_accuracy_pct: number;
  ingested_at: number;
}

export class OnboardingTrackerClient {
  /**
   * Records 30, 60, or 90-day onboarding metrics for an employee.
   */
  static async recordTelemetry(telemetry: OnboardingTelemetry): Promise<IngestionResult> {
    const res = await fetch(`${BASE}/api/v1/rlahf/performance/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telemetry),
    });
    if (!res.ok) {
      throw new Error(`Failed to ingest onboarding telemetry: ${res.statusText}`);
    }
    return await res.json();
  }

  /**
   * Computes velocity index based on PRs and ticket resolution speed.
   */
  static computeVelocityIndex(prsMerged: number, ticketsClosed: number, daysPostHire: number): number {
    if (daysPostHire <= 0) return 0;
    const weeklyRate = ((prsMerged * 2.5) + (ticketsClosed * 1.5)) / (daysPostHire / 7.0);
    return Math.min(100, Math.round(weeklyRate * 8.5));
  }

  /**
   * Evaluates performance tier based on manager score and code delivery.
   */
  static evaluatePerformanceTier(
    managerRating: number,
    velocityIndex: number
  ): 'top_performer' | 'meets_expectations' | 'needs_support' {
    if (managerRating >= 4.5 && velocityIndex >= 75) return 'top_performer';
    if (managerRating >= 3.0 && velocityIndex >= 45) return 'meets_expectations';
    return 'needs_support';
  }
}
