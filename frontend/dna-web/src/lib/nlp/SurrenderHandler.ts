/**
 * Smart Surrender & Auto-Advancement Engine — SkillMatch DNA v2.1
 * Implements Module 3 (FR-05) from prd-v2.md
 *
 * Real-time NLP intent detection for surrender phrases ("I don't know", "idk", "pass", "skip"),
 * instantly advancing to the next question with zero delay.
 */

export interface SurrenderDetectionResult {
  isSurrender: boolean;
  detectedPhrase: string | null;
  confidence: number;
}

const SURRENDER_REGEX_PATTERNS: { pattern: RegExp; phrase: string }[] = [
  { pattern: /\b(i don'?t know|i do not know)\b/i, phrase: "I don't know" },
  { pattern: /\b(idk)\b/i, phrase: "idk" },
  { pattern: /\b(skip|skip this|skip question)\b/i, phrase: "skip" },
  { pattern: /\b(pass|pass this question|pass on this)\b/i, phrase: "pass" },
  { pattern: /\b(no idea|have no idea|have no clue|no clue)\b/i, phrase: "no idea" },
  { pattern: /\b(i'?m not sure|not sure|i am not sure)\b/i, phrase: "I'm not sure" },
  { pattern: /\b(next question|go to next|move to next)\b/i, phrase: "next question" },
  { pattern: /\b(dunno|i give up|can'?t answer)\b/i, phrase: "dunno" },
];

/**
 * Fast client-side classifier detecting surrender intent from speech or text input.
 * Latency SLA: <= 5ms execution.
 */
export function detectSurrenderIntent(text: string): SurrenderDetectionResult {
  if (!text || text.trim().length < 2) {
    return { isSurrender: false, detectedPhrase: null, confidence: 0 };
  }

  const normalized = text.trim().toLowerCase();

  for (const item of SURRENDER_REGEX_PATTERNS) {
    if (item.pattern.test(normalized)) {
      return {
        isSurrender: true,
        detectedPhrase: item.phrase,
        confidence: 0.98,
      };
    }
  }

  return {
    isSurrender: false,
    detectedPhrase: null,
    confidence: 0,
  };
}
