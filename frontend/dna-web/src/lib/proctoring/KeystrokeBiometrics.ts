/**
 * SkillMatch DNA v17.0 — Keystroke Dynamics & Typing Biometrics
 * Pillar 3: Flight-Time, Dwell-Time & Typing Entropy Model
 */

export interface KeystrokeBiometricsResult {
  flightTimeMs: number;
  dwellTimeMs: number;
  wpm: number;
  entropyScore: number;
  isHumanRhythm: boolean;
  typingTrustScore: number;
  incidents: Array<{
    code: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    detail: string;
    timestamp: number;
  }>;
}

export function evaluateKeystrokeMetrics(
  flightTimeMs: number = 108.0,
  dwellTimeMs: number = 82.0,
  wpm: number = 66.0,
  entropyScore: number = 0.84,
  burstChars: number = 10
): KeystrokeBiometricsResult {
  const incidents: KeystrokeBiometricsResult['incidents'] = [];
  let deductions = 0;

  const isMacro = (flightTimeMs < 12.0 && wpm > 175.0) || (burstChars > 80 && flightTimeMs < 5.0);
  if (isMacro) {
    incidents.push({
      code: 'INCIDENT_MACRO_CODE_INJECTION',
      severity: 'CRITICAL',
      detail: `Automated code insertion detected (${wpm.toFixed(0)} WPM with ${flightTimeMs.toFixed(1)}ms flight time).`,
      timestamp: Date.now(),
    });
    deductions += 40;
  }

  const isUnnaturalEntropy = entropyScore < 0.28;
  if (isUnnaturalEntropy) {
    incidents.push({
      code: 'INCIDENT_UNNATURAL_TYPING_ENTROPY',
      severity: 'MEDIUM',
      detail: `Unnatural typing entropy ${entropyScore.toFixed(2)} indicates robotic pacing.`,
      timestamp: Date.now(),
    });
    deductions += 20;
  }

  const typingTrustScore = Math.max(0, Math.min(100, 100 - deductions));

  return {
    flightTimeMs,
    dwellTimeMs,
    wpm,
    entropyScore,
    isHumanRhythm: !isMacro && !isUnnaturalEntropy,
    typingTrustScore,
    incidents,
  };
}
