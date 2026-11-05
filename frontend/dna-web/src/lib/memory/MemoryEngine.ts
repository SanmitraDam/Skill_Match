/**
 * SkillMatch DNA v27.0: Ebbinghaus Memory Retention & Decay Engine
 * Strictly implements the cognitive retention curve formula from suggestion (3).md:
 * R = e^(-t / S)
 *
 * Where:
 * - R: Current cognitive recall retention probability (0.0 - 1.0)
 * - t: Elapsed time since last successful retrieval practice (in hours)
 * - S: Memory stability parameter (in hours)
 */

import { GeneratedCard } from '../flashcards/PDFFlashcardGenerator';

export interface RetentionStatus {
  card_id: string;
  retention_score: number; // e.g. 0.65 = 65%
  retention_percent: string; // "65.2%"
  elapsed_hours: number;
  stability_hours: number;
  is_decayed: boolean; // true if R < 0.70 (70% threshold)
  urgency: 'URGENT' | 'RECOMMENDED' | 'OPTIMAL';
  recommended_review_window: string;
}

export interface MemoryCurvePoint {
  day: number;
  hour: number;
  label: string;
  retention_baseline: number; // Theoretical decay without reviews
  retention_calibrated: number; // Decay with spaced retrieval
}

export class MemoryEngine {
  /** Decay threshold trigger for urgent review (70%) */
  static readonly DECAY_THRESHOLD = 0.70;

  /**
   * Calculates retention probability R = e^(-t / S)
   */
  static calculateRetention(elapsedHours: number, stabilityHours: number): number {
    if (elapsedHours <= 0) return 1.0;
    if (stabilityHours <= 0) return 0.0;
    const r = Math.exp(-elapsedHours / stabilityHours);
    return Math.max(0.0, Math.min(1.0, Math.round(r * 1000) / 1000));
  }

  /**
   * SuperMemo-2 (SM-2) Spaced Repetition Algorithm
   */
  static calculateSM2(
    currentInterval: number,
    currentEase: number,
    grade: number
  ): { newInterval: number; newEase: number } {
    const q = Math.max(0, Math.min(5, grade));
    const deltaEase = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
    const newEase = Math.max(1.3, Math.round(((currentEase || 2.5) + deltaEase) * 100) / 100);

    let newInterval: number;
    if (q < 3) {
      newInterval = 1;
    } else if ((currentInterval || 0) <= 1) {
      newInterval = 6;
    } else {
      newInterval = Math.max(1, Math.round(currentInterval * newEase));
    }

    return { newInterval, newEase };
  }

  /**
   * Assesses a card's current memory retention state based on real elapsed time.
   */
  static assessCard(card: GeneratedCard): RetentionStatus {
    const elapsedMs = Math.max(0, Date.now() - card.last_reviewed_timestamp);
    const elapsedHours = elapsedMs / (1000 * 3600);
    const stability = card.stability_factor || 24; // default 24h stability
    const r = this.calculateRetention(elapsedHours, stability);

    let urgency: 'URGENT' | 'RECOMMENDED' | 'OPTIMAL' = 'OPTIMAL';
    let reviewWindow = 'In 2-3 days';

    if (r < this.DECAY_THRESHOLD) {
      urgency = 'URGENT';
      reviewWindow = 'Review immediately (decayed below 70%)';
    } else if (r < 0.85) {
      urgency = 'RECOMMENDED';
      reviewWindow = 'Optimal within 12 hours';
    }

    return {
      card_id: card.card_id,
      retention_score: r,
      retention_percent: `${(r * 100).toFixed(1)}%`,
      elapsed_hours: Math.round(elapsedHours * 10) / 10,
      stability_hours: stability,
      is_decayed: r < this.DECAY_THRESHOLD,
      urgency,
      recommended_review_window: reviewWindow,
    };
  }

  /**
   * Updates memory stability after candidate self-assessment (grade 0 to 5)
   */
  static recordReview(currentStability: number, grade: number): { newStability: number; newRetention: number } {
    // Grade: 0 = completely forgot, 3 = hesitant recall, 5 = instant perfect recall
    let multiplier = 1.0;
    if (grade >= 4) {
      multiplier = 1.8; // memory stabilized
    } else if (grade === 3) {
      multiplier = 1.2;
    } else {
      multiplier = 0.6; // reset stability on failure
    }

    const newStability = Math.max(12, Math.round(currentStability * multiplier));
    return {
      newStability,
      newRetention: 1.0, // reset to 100% immediate retrieval
    };
  }

  /**
   * Identifies cards that have decayed below 70% retention and need dynamic injection.
   */
  static extractDecayQueue(cards: GeneratedCard[]): GeneratedCard[] {
    return cards.filter((card) => {
      const status = this.assessCard(card);
      return status.is_decayed;
    });
  }

  /**
   * Generates a 7-day Ebbinghaus decay curve for telemetry visualization.
   */
  static generateCurveData(stabilityHours: number = 36): MemoryCurvePoint[] {
    const points: MemoryCurvePoint[] = [];
    for (let day = 0; day <= 7; day++) {
      const hour = day * 24;
      const baseline = this.calculateRetention(hour, 18); // fragile memory without retrieval
      const calibrated = this.calculateRetention(hour % 36, stabilityHours); // stabilized with review
      points.push({
        day,
        hour,
        label: day === 0 ? 'Now' : `Day ${day}`,
        retention_baseline: Math.round(baseline * 100),
        retention_calibrated: Math.round(calibrated * 100),
      });
    }
    return points;
  }
}
