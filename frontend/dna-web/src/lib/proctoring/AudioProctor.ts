/**
 * SkillMatch DNA v17.0 — Acoustic Diarization & Environmental Audio Proctoring
 * Pillar 2: Voice Enrollment, Speaker Diarization & Secondary Voice Detection
 */

export interface AudioProctorResult {
  candidateMatch: boolean;
  cosineDistance: number;
  detectedSpeakersCount: number;
  isWhisperDetected: boolean;
  ultrasonicBeaconDetected: boolean;
  audioTrustScore: number;
  verdict: 'AUTHENTIC_CANDIDATE' | 'SECONDARY_SPEAKER_ACTIVE' | 'WHISPER_FLAGGED' | 'ULTRASONIC_INTERFERENCE';
  incidents: Array<{
    code: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    detail: string;
    timestamp: number;
  }>;
}

export function evaluateAudioMetrics(
  cosineDistance: number = 0.12,
  speakersCount: number = 1,
  isWhisper: boolean = false,
  isUltrasonic: boolean = false
): AudioProctorResult {
  const incidents: AudioProctorResult['incidents'] = [];
  let deductions = 0;

  const isSecondary = speakersCount > 1 || cosineDistance > 0.38;
  if (isSecondary) {
    incidents.push({
      code: 'INCIDENT_SECONDARY_SPEAKER',
      severity: 'HIGH',
      detail: `Secondary speaker detected: distance ${cosineDistance.toFixed(2)}, speakers: ${speakersCount}.`,
      timestamp: Date.now(),
    });
    deductions += 30;
  }

  if (isWhisper) {
    incidents.push({
      code: 'INCIDENT_WHISPERED_PROMPT',
      severity: 'MEDIUM',
      detail: 'Acoustic whisper formants detected. Suspected prompt dictation.',
      timestamp: Date.now(),
    });
    deductions += 20;
  }

  if (isUltrasonic) {
    incidents.push({
      code: 'INCIDENT_ULTRASONIC_BEACON',
      severity: 'CRITICAL',
      detail: 'High-frequency ultrasonic carrier beacon (18kHz-22kHz) intercepted.',
      timestamp: Date.now(),
    });
    deductions += 40;
  }

  const audioTrustScore = Math.max(0, Math.min(100, 100 - deductions));

  let verdict: AudioProctorResult['verdict'] = 'AUTHENTIC_CANDIDATE';
  if (isUltrasonic) verdict = 'ULTRASONIC_INTERFERENCE';
  else if (isSecondary) verdict = 'SECONDARY_SPEAKER_ACTIVE';
  else if (isWhisper) verdict = 'WHISPER_FLAGGED';

  return {
    candidateMatch: !isSecondary,
    cosineDistance,
    detectedSpeakersCount: speakersCount,
    isWhisperDetected: isWhisper,
    ultrasonicBeaconDetected: isUltrasonic,
    audioTrustScore,
    verdict,
    incidents,
  };
}
