/**
 * SkillMatch DNA v17.0 — Browser Guard & OS Environment Proctoring
 * Pillar 3: Window Visibility, Clipboard Protection & DOM Integrity
 */

export interface BrowserGuardResult {
  isDocumentHidden: boolean;
  tabSwitchCount: number;
  copyPasteAttempted: boolean;
  devtoolsActive: boolean;
  browserTrustScore: number;
  incidents: Array<{
    code: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    detail: string;
    timestamp: number;
  }>;
}

export function evaluateBrowserGuardMetrics(
  isDocumentHidden: boolean = false,
  tabSwitches: number = 0,
  copyPasteAttempted: boolean = false,
  devtoolsOpen: boolean = false
): BrowserGuardResult {
  const incidents: BrowserGuardResult['incidents'] = [];
  let deductions = 0;

  if (isDocumentHidden || tabSwitches > 0) {
    const penalty = Math.min(50, 25 * Math.max(1, tabSwitches));
    incidents.push({
      code: 'INCIDENT_TAB_SWITCH',
      severity: 'HIGH',
      detail: `Browser window blur / tab switch detected (${tabSwitches} occurrences).`,
      timestamp: Date.now(),
    });
    deductions += penalty;
  }

  if (copyPasteAttempted) {
    incidents.push({
      code: 'INCIDENT_CLIPBOARD_INJECTION',
      severity: 'MEDIUM',
      detail: 'Clipboard paste action intercepted in secure evaluation buffer.',
      timestamp: Date.now(),
    });
    deductions += 20;
  }

  if (devtoolsOpen) {
    incidents.push({
      code: 'INCIDENT_DOM_TAMPER_DEVTOOLS',
      severity: 'CRITICAL',
      detail: 'Browser Developer Tools / DOM inspector active.',
      timestamp: Date.now(),
    });
    deductions += 35;
  }

  const browserTrustScore = Math.max(0, Math.min(100, 100 - deductions));

  return {
    isDocumentHidden,
    tabSwitchCount: tabSwitches,
    copyPasteAttempted,
    devtoolsActive: devtoolsOpen,
    browserTrustScore,
    incidents,
  };
}
