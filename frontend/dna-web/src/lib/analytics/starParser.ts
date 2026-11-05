/**
 * SkillMatch DNA v16.0 — Client-Side STAR NLP Parser & Quantified Impact Detector
 * Pillar 2: Multimodal Behavioral & STAR Method Analytics Engine
 */

export interface STARSegmentBreakdown {
  situation: string[];
  task: string[];
  action: string[];
  result: string[];
}

export interface STARAnalysisResult {
  compositeScore: number;
  weights: {
    situation: number;
    task: number;
    action: number;
    result: number;
  };
  subScores: {
    situation: number;
    task: number;
    action: number;
    result: number;
  };
  segments: STARSegmentBreakdown;
  quantifiedImpacts: string[];
  hasEmpiricalImpact: boolean;
  verdict: 'COMPLIANT' | 'NEEDS_IMPROVEMENT';
}

const SITUATION_PATTERNS = [
  /when i was/i, /at company/i, /we had a situation/i, /context was/i,
  /working at/i, /our team was/i, /the legacy system/i, /in my previous role/i,
  /the problem started/i, /initially/i
];

const TASK_PATTERNS = [
  /my responsibility was/i, /i was tasked with/i, /the goal was/i, /we needed to/i,
  /my objective/i, /we were required to/i, /the requirement was/i, /task was to/i,
  /i had to ensure/i, /my role required/i
];

const ACTION_PATTERNS = [
  /i implemented/i, /i designed/i, /i refactored/i, /i migrated/i, /i architected/i,
  /i orchestrated/i, /we deployed/i, /i configured/i, /i investigated/i, /i engineered/i,
  /i built/i, /i analyzed/i, /i resolved/i, /i wrote/i, /i introduced/i, /i optimized/i
];

const RESULT_PATTERNS = [
  /as a result/i, /consequently/i, /resulting in/i, /we achieved/i, /improved by/i,
  /reduced latency/i, /saved/i, /increased throughput/i, /delivered/i, /outcome was/i,
  /the system scaled to/i, /prevented downtime/i, /cut costs/i
];

const IMPACT_REGEXES = [
  /\d+(\.\d+)?%/g,
  /\$\d+([kKmMbB]|\s*million|\s*k)?/g,
  /\d+\s*ms\b/gi,
  /\d+x\b/gi,
  /\d+\s*(req\/s|rps|tps|qps|tb|gb)\b/gi
];

export function parseSTARMethod(text: string): STARAnalysisResult {
  if (!text || text.trim().length === 0) {
    return {
      compositeScore: 0,
      weights: { situation: 0.15, task: 0.15, action: 0.50, result: 0.20 },
      subScores: { situation: 0, task: 0, action: 0, result: 0 },
      segments: { situation: [], task: [], action: [], result: [] },
      quantifiedImpacts: [],
      hasEmpiricalImpact: false,
      verdict: 'NEEDS_IMPROVEMENT',
    };
  }

  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const segments: STARSegmentBreakdown = {
    situation: [],
    task: [],
    action: [],
    result: [],
  };

  sentences.forEach((sent) => {
    let matched = false;
    if (RESULT_PATTERNS.some((p) => p.test(sent))) {
      segments.result.push(sent);
      matched = true;
    }
    if (ACTION_PATTERNS.some((p) => p.test(sent))) {
      segments.action.push(sent);
      matched = true;
    }
    if (TASK_PATTERNS.some((p) => p.test(sent))) {
      segments.task.push(sent);
      matched = true;
    }
    if (SITUATION_PATTERNS.some((p) => p.test(sent)) || (!matched && segments.situation.length === 0)) {
      segments.situation.push(sent);
    }
  });

  // Extract quantified impacts
  const quantifiedImpacts: string[] = [];
  IMPACT_REGEXES.forEach((re) => {
    const matches = text.match(re);
    if (matches) {
      matches.forEach((m) => {
        if (!quantifiedImpacts.includes(m)) {
          quantifiedImpacts.push(m);
        }
      });
    }
  });

  const hasEmpiricalImpact = quantifiedImpacts.length > 0;

  // Sub-scores (0-100)
  const situationScore = Math.min(100, 40 + segments.situation.length * 30);
  const taskScore = Math.min(100, 40 + segments.task.length * 30);
  const actionScore = Math.min(100, 50 + segments.action.length * 25);
  const resultScore = Math.min(100, (50 + segments.result.length * 20) + (hasEmpiricalImpact ? 30 : 0));

  // Weightings: 15% Situation, 15% Task, 50% Action, 20% Result
  const compositeScore = Math.round(
    situationScore * 0.15 +
    taskScore * 0.15 +
    actionScore * 0.50 +
    resultScore * 0.20
  );

  return {
    compositeScore,
    weights: {
      situation: 0.15,
      task: 0.15,
      action: 0.50,
      result: 0.20,
    },
    subScores: {
      situation: situationScore,
      task: taskScore,
      action: actionScore,
      result: resultScore,
    },
    segments,
    quantifiedImpacts,
    hasEmpiricalImpact,
    verdict: compositeScore >= 75 ? 'COMPLIANT' : 'NEEDS_IMPROVEMENT',
  };
}
