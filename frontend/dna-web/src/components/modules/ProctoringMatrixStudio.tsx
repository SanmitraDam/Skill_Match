'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Eye,
  Mic,
  Lock,
  Keyboard,
  Cpu,
  Zap,
  Activity,
  UserCheck,
  UserX,
  FileCheck,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  Sliders,
  Volume2
} from 'lucide-react';
import {
  useEvaluateVisionFrame,
  useDiarizeAudio,
  useEvaluateBrowserTelemetry,
  useEvaluateKeystrokes,
  useCalculatePTS,
  useGenerateProctoringAuditLog
} from '@/hooks/useFastAPI';

export const ProctoringMatrixStudio: React.FC = () => {
  // Sensor State
  const [facesDetected, setFacesDetected] = useState<number>(1);
  const [gazeX, setGazeX] = useState<number>(0.02);
  const [gazeY, setGazeY] = useState<number>(-0.01);
  const [headYaw, setHeadYaw] = useState<number>(1.5);
  const [livenessScore, setLivenessScore] = useState<number>(0.98);

  const [speakersCount, setSpeakersCount] = useState<number>(1);
  const [cosineDistance, setCosineDistance] = useState<number>(0.14);
  const [isWhisper, setIsWhisper] = useState<boolean>(false);
  const [isUltrasonic, setIsUltrasonic] = useState<boolean>(false);

  const [tabSwitches, setTabSwitches] = useState<number>(0);
  const [copyPasteAttempted, setCopyPasteAttempted] = useState<boolean>(false);
  const [devtoolsOpen, setDevtoolsOpen] = useState<boolean>(false);

  const [flightTimeMs, setFlightTimeMs] = useState<number>(108.0);
  const [typingWpm, setTypingWpm] = useState<number>(66.0);
  const [entropyScore, setEntropyScore] = useState<number>(0.84);

  // Sub-scores (0 - 100)
  const [subScores, setSubScores] = useState({
    gaze: 96.0,
    face: 98.0,
    audio: 94.0,
    browser: 95.0,
    typing: 94.0,
  });

  const [activeIncidents, setActiveIncidents] = useState<Array<{
    code: string;
    severity: string;
    detail: string;
    timestamp: number;
  }>>([]);

  const [ptsData, setPtsData] = useState<any>({
    proctoring_trust_score: 95.5,
    verdict: 'VERIFIED_AUTHENTIC',
    status_color: 'EMERALD',
    ui_message: 'Session integrity verified authentic. All biometric and environmental sensors nominal.',
  });

  const [auditLogResult, setAuditLogResult] = useState<any>(null);

  const evaluateVisionMutation = useEvaluateVisionFrame();
  const diarizeAudioMutation = useDiarizeAudio();
  const evaluateBrowserMutation = useEvaluateBrowserTelemetry();
  const evaluateKeystrokesMutation = useEvaluateKeystrokes();
  const calculatePTSMutation = useCalculatePTS();
  const generateAuditLogMutation = useGenerateProctoringAuditLog();

  // Helper: re-run multi-modal PTS calculation
  const triggerRecalculatePTS = (
    newSubScores = subScores,
    incidents = activeIncidents
  ) => {
    calculatePTSMutation.mutate(
      {
        session_id: 'sess_proctor_matrix_001',
        candidate_id: 'cand_sovereign_001',
        gaze_trust_score: newSubScores.gaze,
        face_trust_score: newSubScores.face,
        audio_trust_score: newSubScores.audio,
        browser_trust_score: newSubScores.browser,
        typing_trust_score: newSubScores.typing,
        incident_logs: incidents,
      },
      {
        onSuccess: (data) => {
          setPtsData(data);
        },
      }
    );
  };

  // Interactive Cheating Vector Simulations
  const handleSimulateSecondaryGaze = () => {
    setGazeX(0.65);
    setGazeY(0.05);
    const newInc = [
      ...activeIncidents,
      {
        code: 'INCIDENT_OFFSCREEN_GAZE',
        severity: 'MEDIUM',
        detail: 'Sustained gaze direction straying to secondary right monitor (X=0.65).',
        timestamp: Date.now(),
      },
    ];
    setActiveIncidents(newInc);
    const updated = { ...subScores, gaze: 65.0 };
    setSubScores(updated);
    triggerRecalculatePTS(updated, newInc);
  };

  const handleSimulateMultipleFaces = () => {
    setFacesDetected(2);
    const newInc = [
      ...activeIncidents,
      {
        code: 'INCIDENT_MULTIPLE_FACES',
        severity: 'HIGH',
        detail: 'Secondary person entered webcam field of view (2 faces detected).',
        timestamp: Date.now(),
      },
    ];
    setActiveIncidents(newInc);
    const updated = { ...subScores, face: 50.0 };
    setSubScores(updated);
    triggerRecalculatePTS(updated, newInc);
  };

  const handleSimulateSecondarySpeaker = () => {
    setSpeakersCount(2);
    setCosineDistance(0.58);
    const newInc = [
      ...activeIncidents,
      {
        code: 'INCIDENT_SECONDARY_SPEAKER',
        severity: 'HIGH',
        detail: 'Acoustic voice diarization distance 0.58 exceeds baseline threshold (0.38).',
        timestamp: Date.now(),
      },
    ];
    setActiveIncidents(newInc);
    const updated = { ...subScores, audio: 55.0 };
    setSubScores(updated);
    triggerRecalculatePTS(updated, newInc);
  };

  const handleSimulateTabSwitch = () => {
    setTabSwitches((prev) => prev + 1);
    const newInc = [
      ...activeIncidents,
      {
        code: 'INCIDENT_TAB_SWITCH',
        severity: 'HIGH',
        detail: 'Browser blur event intercepted. Window focus moved to external application.',
        timestamp: Date.now(),
      },
    ];
    setActiveIncidents(newInc);
    const updated = { ...subScores, browser: Math.max(20, subScores.browser - 25) };
    setSubScores(updated);
    triggerRecalculatePTS(updated, newInc);
  };

  const handleSimulateMacroInjection = () => {
    setFlightTimeMs(2.5);
    setTypingWpm(215.0);
    setEntropyScore(0.18);
    const newInc = [
      ...activeIncidents,
      {
        code: 'INCIDENT_MACRO_CODE_INJECTION',
        severity: 'CRITICAL',
        detail: 'Automated script code injection intercepted: 215 WPM with 2.5ms flight time.',
        timestamp: Date.now(),
      },
    ];
    setActiveIncidents(newInc);
    const updated = { ...subScores, typing: 40.0 };
    setSubScores(updated);
    triggerRecalculatePTS(updated, newInc);
  };

  const handleResetPristine = () => {
    setFacesDetected(1);
    setGazeX(0.02);
    setGazeY(-0.01);
    setHeadYaw(1.5);
    setLivenessScore(0.98);
    setSpeakersCount(1);
    setCosineDistance(0.14);
    setIsWhisper(false);
    setIsUltrasonic(false);
    setTabSwitches(0);
    setCopyPasteAttempted(false);
    setDevtoolsOpen(false);
    setFlightTimeMs(108.0);
    setTypingWpm(66.0);
    setEntropyScore(0.84);
    const pristineScores = { gaze: 96.0, face: 98.0, audio: 94.0, browser: 95.0, typing: 94.0 };
    setSubScores(pristineScores);
    setActiveIncidents([]);
    setAuditLogResult(null);
    triggerRecalculatePTS(pristineScores, []);
  };

  const handleGenerateAuditPackage = () => {
    generateAuditLogMutation.mutate(
      {
        session_id: 'sess_proctor_matrix_001',
        candidate_id: 'cand_sovereign_001',
        role_target: 'Staff Systems Architect',
        pts_score: ptsData.proctoring_trust_score,
        incidents: activeIncidents,
      },
      {
        onSuccess: (data) => {
          setAuditLogResult(data);
        },
      }
    );
  };

  const ptsScore = ptsData.proctoring_trust_score || 95.0;
  const statusColor = ptsScore >= 85 ? 'emerald' : (ptsScore >= 60 ? 'amber' : 'rose');

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Executive Header Banner */}
      <div className="rounded-2xl theme-card p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                Multi-Modal Proctoring & Integrity Telemetry
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                MediaPipe WASM + WebGPU Depth
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--fg-color)] tracking-tight">
              Assessment Integrity & Verification Guard
            </h1>
            <p className="text-sm text-[var(--fg-muted)] max-w-2xl mt-1">
              Client-side monitoring of gaze direction, acoustic diarization, browser focus, and typing rhythm with verifiable cryptographic logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetPristine}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[var(--fg-muted)] bg-[var(--glass-bg)] hover:bg-[var(--glass-border-subtle)] border border-[var(--glass-border-subtle)] transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Baseline
            </button>
            <button
              onClick={handleGenerateAuditPackage}
              disabled={generateAuditLogMutation.isPending}
              className="theme-primary-btn px-5 py-2.5 text-sm flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              {generateAuditLogMutation.isPending ? 'Signing Log...' : 'Export Audit Log'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Top 5 Sensor Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Sensor 1: 3D Gaze Vector */}
        <div className="p-4 rounded-2xl theme-card space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--fg-muted)] uppercase font-mono font-medium">3D Gaze (15%)</span>
            <Eye className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--fg-color)]">
            {subScores.gaze.toFixed(1)}%
          </div>
          <div className="text-[10px] text-[var(--fg-muted)] truncate">
            Offset: X={gazeX.toFixed(2)}, Y={gazeY.toFixed(2)}
          </div>
          <div className="w-full bg-[var(--glass-border-subtle)] rounded-full h-1.5 overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${subScores.gaze}%` }} />
          </div>
        </div>

        {/* Sensor 2: Face & Liveness */}
        <div className="p-4 rounded-2xl theme-card space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--fg-muted)] uppercase font-mono font-medium">Face / Liveness (25%)</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--fg-color)]">
            {subScores.face.toFixed(1)}%
          </div>
          <div className="text-[10px] text-[var(--fg-muted)] truncate">
            {facesDetected === 1 ? '1 Candidate Verified' : `${facesDetected} Faces Detected`}
          </div>
          <div className="w-full bg-[var(--glass-border-subtle)] rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${subScores.face}%` }} />
          </div>
        </div>

        {/* Sensor 3: Voice Diarization */}
        <div className="p-4 rounded-2xl theme-card space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--fg-muted)] uppercase font-mono font-medium">Acoustic (25%)</span>
            <Mic className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--fg-color)]">
            {subScores.audio.toFixed(1)}%
          </div>
          <div className="text-[10px] text-[var(--fg-muted)] truncate">
            {speakersCount === 1 ? 'Candidate Matched' : 'Secondary Voice Active'}
          </div>
          <div className="w-full bg-[var(--glass-border-subtle)] rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${subScores.audio}%` }} />
          </div>
        </div>

        {/* Sensor 4: Browser Guard */}
        <div className="p-4 rounded-2xl theme-card space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--fg-muted)] uppercase font-mono font-medium">Browser Guard (20%)</span>
            <Lock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--fg-color)]">
            {subScores.browser.toFixed(1)}%
          </div>
          <div className="text-[10px] text-[var(--fg-muted)] truncate">
            {tabSwitches === 0 ? 'Window Focused' : `${tabSwitches} Tab Switches`}
          </div>
          <div className="w-full bg-[var(--glass-border-subtle)] rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${subScores.browser}%` }} />
          </div>
        </div>

        {/* Sensor 5: Typing Entropy */}
        <div className="p-4 rounded-2xl theme-card space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--fg-muted)] uppercase font-mono font-medium">Typing Rhythm (15%)</span>
            <Keyboard className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--fg-color)]">
            {subScores.typing.toFixed(1)}%
          </div>
          <div className="text-[10px] text-[var(--fg-muted)] truncate">
            Flight: {flightTimeMs.toFixed(1)}ms • {typingWpm.toFixed(0)} WPM
          </div>
          <div className="w-full bg-[var(--glass-border-subtle)] rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${subScores.typing}%` }} />
          </div>
        </div>
      </div>

      {/* Main Grid: Left Simulation Controls, Right PTS Trust Radar & Forensic Proof */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cheating Vector Simulation Studio (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="rounded-2xl theme-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--fg-color)] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-500" />
                Live Anomaly Vector Simulation Suite
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)]">
                Interactive Testbench
              </span>
            </div>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
              Test-drive the real-time proctoring engine response by injecting simulated integrity events across vision, audio, browser runtime, and keystroke injection.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleSimulateSecondaryGaze}
                className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] hover:border-cyan-500/40 text-left transition-all group"
              >
                <div className="text-xs font-semibold text-[var(--fg-color)] group-hover:text-cyan-500 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-500" />
                  Secondary Monitor Gaze
                </div>
                <div className="text-[10px] text-[var(--fg-muted)] mt-1">
                  Injects sustained X=0.65 offset gaze outside window bounds.
                </div>
              </button>

              <button
                onClick={handleSimulateMultipleFaces}
                className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] hover:border-emerald-500/40 text-left transition-all group"
              >
                <div className="text-xs font-semibold text-[var(--fg-color)] group-hover:text-emerald-500 flex items-center gap-1.5">
                  <UserX className="w-3.5 h-3.5 text-emerald-500" />
                  Secondary Person Presence
                </div>
                <div className="text-[10px] text-[var(--fg-muted)] mt-1">
                  Injects 2nd detected face into webcam field of view.
                </div>
              </button>

              <button
                onClick={handleSimulateSecondarySpeaker}
                className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] hover:border-indigo-500/40 text-left transition-all group"
              >
                <div className="text-xs font-semibold text-[var(--fg-color)] group-hover:text-indigo-500 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                  Secondary Voice Dictation
                </div>
                <div className="text-[10px] text-[var(--fg-muted)] mt-1">
                  Shifts acoustic embedding distance to 0.58 vs baseline.
                </div>
              </button>

              <button
                onClick={handleSimulateTabSwitch}
                className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] hover:border-amber-500/40 text-left transition-all group"
              >
                <div className="text-xs font-semibold text-[var(--fg-color)] group-hover:text-amber-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Browser Tab Switch
                </div>
                <div className="text-[10px] text-[var(--fg-muted)] mt-1">
                  Triggers window blur and visibility change telemetry.
                </div>
              </button>

              <button
                onClick={handleSimulateMacroInjection}
                className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] hover:border-rose-500/40 text-left transition-all group col-span-2"
              >
                <div className="text-xs font-semibold text-[var(--fg-color)] group-hover:text-rose-500 flex items-center gap-1.5">
                  <Keyboard className="w-3.5 h-3.5 text-rose-500" />
                  Macro Code Injection (215 WPM / 2.5ms Flight Time)
                </div>
                <div className="text-[10px] text-[var(--fg-muted)] mt-1">
                  Simulates programmatic virtual typing paste with zero natural human flight variance.
                </div>
              </button>
            </div>

            {/* Active Incident Stream */}
            <div className="pt-3 border-t border-[var(--glass-border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--fg-muted)] font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-500" />
                  Active Incident Timeline ({activeIncidents.length})
                </span>
                {activeIncidents.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveIncidents([]);
                      triggerRecalculatePTS(subScores, []);
                    }}
                    className="text-[10px] text-[var(--accent-primary)] hover:underline"
                  >
                    Clear Incidents
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {activeIncidents.length === 0 ? (
                  <div className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-muted)] text-center">
                    No integrity anomalies detected. Baseline running at 100% authenticity.
                  </div>
                ) : (
                  activeIncidents.map((inc, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] flex items-start justify-between text-xs gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="font-mono font-bold text-rose-500">{inc.code}</div>
                        <div className="text-[11px] text-[var(--fg-muted)]">{inc.detail}</div>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-mono rounded shrink-0 ${
                        inc.severity === 'CRITICAL' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      }`}>
                        {inc.severity}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic PTS Score & Forensic Audit Certificate (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* PTS Dynamic Trust Card */}
          <div className="rounded-2xl theme-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--fg-color)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-500" />
                Real-Time Proctoring Trust Score (PTS)
              </h2>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold font-mono rounded-full ${
                statusColor === 'emerald'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                  : (statusColor === 'amber'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30 animate-pulse')
              }`}>
                {ptsData.verdict}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[var(--fg-muted)]">PTS Aggregate Score:</span>
                <span className="text-3xl font-extrabold font-mono text-[var(--fg-color)]">
                  {ptsScore.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-[var(--glass-border-subtle)] rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    statusColor === 'emerald'
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                      : (statusColor === 'amber' ? 'bg-amber-400' : 'bg-rose-500')
                  }`}
                  style={{ width: `${ptsScore}%` }}
                />
              </div>
              <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                {ptsData.ui_message}
              </p>
            </div>

            {/* Threshold Legend */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300">
                <div className="font-bold">&ge; 85%</div>
                <div>Verified Pass</div>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300">
                <div className="font-bold">60% - 84%</div>
                <div>Soft Warning</div>
              </div>
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300">
                <div className="font-bold">&lt; 60%</div>
                <div>Quarantine</div>
              </div>
            </div>
          </div>

          {/* Cryptographic Audit Log Card */}
          <div className="rounded-2xl theme-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--fg-color)] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                Cryptographic Audit Log
              </h2>
            </div>

            {auditLogResult ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--fg-muted)]">Audit Package ID:</span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-300 font-semibold">{auditLogResult.audit_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--fg-muted)]">Signature Algorithm:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{auditLogResult.cryptographic_proof.signature_algorithm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--fg-muted)]">Registry Target:</span>
                    <span className="font-mono text-[var(--fg-muted)] font-semibold">{auditLogResult.cryptographic_proof.smart_contract_target}</span>
                  </div>
                  <div className="pt-1">
                    <div className="text-[10px] text-[var(--fg-muted)]">Verification Hash:</div>
                    <div className="font-mono text-[10px] text-[var(--accent-primary)] break-all">
                      {auditLogResult.cryptographic_proof.onchain_registry_hash}
                    </div>
                  </div>
                </div>

                <a
                  href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(auditLogResult, null, 2))}`}
                  download={`ProctoringAuditLog_${auditLogResult.session_id}.json`}
                  className="w-full py-2.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Signed Compliance JSON
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-muted)] text-center">
                Click "Export Audit Log" to generate an Ed25519-signed compliance audit package with verification proof.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
