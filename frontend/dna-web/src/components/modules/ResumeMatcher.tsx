"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { GlassCard } from '@/components/ui/GlassCard';
import { useParseResume, useParseJD, useMatchSkills } from '@/hooks/useFastAPI';
import { VectorVisualizer } from '@/components/3d/VectorVisualizer';
import { SkillGapReport } from '@/types/api';
import { Upload, FileText, Zap, CheckCircle2, ShieldCheck, Github, Linkedin, Globe, Layers, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ResumeMatcher() {
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [jdId, setJdId] = useState<number | null>(null);
  const [jdText, setJdText] = useState('');
  const [matchReport, setMatchReport] = useState<SkillGapReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [anonymizePii, setAnonymizePii] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);

  const parseResumeMut = useParseResume();
  const parseJDMut = useParseJD();
  const matchMut = useMatchSkills();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsScanning(true);
    setUploadError(null);
    try {
      const data = await parseResumeMut.mutateAsync({ file, anonymizePii });
      setResumeId(data.resume_id);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Error parsing resume');
    } finally {
      setIsScanning(false);
    }
  };

  const handleJDAnalyze = async () => {
    if (!jdText) return;
    try {
      const data = await parseJDMut.mutateAsync(jdText);
      setJdId(data.jd_id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMatch = async () => {
    if (resumeId === null || jdId === null) return;
    try {
      const report = await matchMut.mutateAsync({ resumeId, jdId });
      setMatchReport(report);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <GlassCard title="Input Skill Matrix">
          <div className="space-y-6">
            {/* PII Anonymization Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className={anonymizePii ? "text-cyan-500" : "text-[var(--fg-muted)]"} />
                <div>
                  <div className="text-xs font-bold text-[var(--fg-color)]">Bias-Free PII Masking</div>
                  <div className="text-[10px] text-[var(--fg-muted)]">Scrub phone, email, and address before vectorization</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAnonymizePii(!anonymizePii)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative cursor-pointer",
                  anonymizePii ? "bg-cyan-500" : "bg-slate-300 dark:bg-white/20"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full bg-white transition-transform absolute top-1",
                  anonymizePii ? "right-1" : "left-1"
                )} />
              </button>
            </div>

            {/* Resume Upload container */}
            <div className={cn(
              "relative p-8 border-2 border-dashed rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center",
              isScanning ? "border-cyan-500 bg-cyan-500/10 laser-scan-effect" : "border-[var(--glass-border-subtle)] hover:border-[var(--accent-primary)] bg-[var(--glass-bg)]"
            )}>
              <Upload className={cn("w-12 h-12 transition-colors", isScanning ? "text-cyan-500" : "text-[var(--fg-muted)]")} />
              <div>
                <p className="font-bold text-[var(--fg-color)]">{fileName ? fileName : "Upload Resume (PDF, DOCX, TXT)"}</p>
                <p className="text-xs text-[var(--fg-muted)]">Multi-format ingestion • PII Masking • 384-d dense embeddings</p>
              </div>
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {resumeId && (
                <div className="absolute top-2 right-2 text-emerald-500 flex items-center gap-1 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/30">
                  <CheckCircle2 size={12} /> Parsed &amp; Indexed
                </div>
              )}
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 flex items-center gap-3 text-xs text-rose-500">
                <AlertTriangle size={16} className="text-rose-500 shrink-0" />
                <div className="flex-1">{uploadError}</div>
              </div>
            )}

            {/* JD Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[var(--fg-color)] text-sm font-medium">
                <FileText size={16} /> Target Job Description
              </div>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the target job description or requirements here..."
                className="w-full h-28 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)] focus:border-[var(--accent-primary)] transition-colors outline-none resize-none text-sm"
              />
              <button
                onClick={handleJDAnalyze}
                disabled={!jdText || parseJDMut.isPending}
                className="w-full py-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 rounded-xl font-bold transition-all disabled:opacity-50 text-sm cursor-pointer"
              >
                {parseJDMut.isPending ? 'Analyzing Requirements...' : 'Analyze Job Description'}
              </button>
              {jdId && (
                <div className="text-right text-emerald-500 flex items-center justify-end gap-1 text-xs font-bold">
                  <CheckCircle2 size={12} /> JD Analyzed
                </div>
              )}
            </div>

            <button
              onClick={handleMatch}
              disabled={resumeId === null || jdId === null || matchMut.isPending}
              className="w-full py-4 theme-primary-btn font-black rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap size={20} />
              {matchMut.isPending ? 'Calculating Semantic Vector Match...' : 'Match Skills'}
            </button>
          </div>
        </GlassCard>
      </div>

      <div className="relative h-full min-h-[500px]">
        {!matchReport ? (
          <div className="h-full glass-panel flex flex-col items-center justify-center text-slate-500 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Zap size={32} className="text-slate-600" />
            </div>
            <p className="font-medium">Awaiting DNA Match...</p>
            <p className="text-sm opacity-60">Upload resume and target JD to calculate hybrid cosine match and taxonomy.</p>
          </div>
        ) : (
          <div className="h-full flex flex-col gap-6">
            <div className="h-[480px] lg:h-[520px] glass-panel relative overflow-hidden flex flex-col">
              <div className="absolute top-4 left-4 z-10 flex items-center gap-4 pointer-events-none">
                <div className="pointer-events-auto bg-[var(--glass-bg)] backdrop-blur-md p-3 rounded-xl border border-[var(--glass-border-subtle)] shadow-md">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl lg:text-5xl font-black text-[var(--fg-color)] tracking-tight">
                      {matchReport.match_score.toFixed(1)}%
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                      matchReport.match_score >= 70 ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" :
                      matchReport.match_score >= 50 ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30" :
                      "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    )}>
                      {matchReport.match_score >= 70 ? "Strong Alignment" : matchReport.match_score >= 50 ? "Moderate Alignment" : "Skill Gap Critical"}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--accent-primary)] block uppercase tracking-widest font-mono mt-0.5 font-semibold">
                    Semantic Match Score
                  </span>
                </div>
                {matchReport.pii_anonymized && (
                  <div className="pointer-events-auto flex items-center gap-1.5 text-xs bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/40 px-3 py-1.5 rounded-xl backdrop-blur-md font-medium">
                    <ShieldCheck size={14} /> PII Scrubbed
                  </div>
                )}
              </div>

              {/* Developer profiles if detected */}
              {matchReport.social_profiles && (matchReport.social_profiles.github || matchReport.social_profiles.linkedin) && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                  {matchReport.social_profiles.github && (
                    <a
                      href={matchReport.social_profiles.github}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-[var(--glass-bg)] text-[var(--fg-color)] hover:border-[var(--accent-primary)] border border-[var(--glass-border-subtle)] transition-all flex items-center gap-2 text-xs font-semibold backdrop-blur-md"
                    >
                      <Github size={16} />
                      <span className="hidden sm:inline">GitHub</span>
                    </a>
                  )}
                  {matchReport.social_profiles.linkedin && (
                    <a
                      href={matchReport.social_profiles.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:border-cyan-500/40 border border-cyan-500/30 transition-all flex items-center gap-2 text-xs font-semibold backdrop-blur-md"
                    >
                      <Linkedin size={16} />
                      <span className="hidden sm:inline">LinkedIn</span>
                    </a>
                  )}
                </div>
              )}

              {/* Interactive Vector Space Canvas */}
              <div className="w-full h-full cursor-grab active:cursor-grabbing">
                <Canvas>
                  <PerspectiveCamera makeDefault position={[0, 0, 9.5]} fov={50} />
                  <OrbitControls
                    enableZoom={true}
                    minDistance={5}
                    maxDistance={16}
                    enableDamping={true}
                    dampingFactor={0.06}
                  />
                  <ambientLight intensity={0.7} />
                  <pointLight position={[10, 10, 10]} intensity={1.5} color="#8b5cf6" />
                  <pointLight position={[-10, -10, 5]} intensity={1.2} color="#06b6d4" />
                  <VectorVisualizer report={matchReport} />
                </Canvas>
              </div>

              {/* Bottom Interactive Badges & Legend */}
              <div className="absolute bottom-3 left-4 z-10 pointer-events-none hidden sm:flex items-center gap-2 text-[11px] text-[var(--fg-muted)] bg-[var(--glass-bg)] backdrop-blur-md px-3 py-1.5 rounded-lg border border-[var(--glass-border-subtle)] shadow-sm">
                <span className="text-cyan-500 font-semibold">✦ 3D Vector Space</span>
                <span className="opacity-40">•</span>
                <span>Drag to rotate</span>
                <span className="opacity-40">•</span>
                <span>Scroll to zoom</span>
              </div>

              <div className="absolute bottom-3 right-4 z-10 pointer-events-none flex items-center gap-3 text-[11px] bg-[var(--glass-bg)] backdrop-blur-md px-3 py-1.5 rounded-lg border border-[var(--glass-border-subtle)] shadow-sm">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Matched ({matchReport.matched_skills.length})
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Gaps ({matchReport.missing_critical_skills.length})
                </span>
              </div>
            </div>

            {/* Taxonomy Breakdown */}
            {matchReport.taxonomy && (
              <GlassCard title="Skill Taxonomy Distribution" className="p-4">
                <div className="grid grid-cols-1 phone-sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold block mb-1">Hard Technical</span>
                    <span className="text-[var(--fg-color)] font-mono">{matchReport.taxonomy.hard_technical.length} skills</span>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                    <span className="text-purple-600 dark:text-purple-400 font-bold block mb-1">Soft Skills</span>
                    <span className="text-[var(--fg-color)] font-mono">{matchReport.taxonomy.soft_skills.length} skills</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]">
                    <span className="text-[var(--fg-color)] font-bold block mb-1">Domain Tools</span>
                    <span className="text-[var(--fg-muted)] font-mono">{matchReport.taxonomy.domain_tools.length} skills</span>
                  </div>
                </div>
              </GlassCard>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard title="Matched Skills" className="p-4 max-h-48 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {matchReport.matched_skills.map(s => (
                    <span key={s} className="px-2 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-md text-xs font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </GlassCard>

              <GlassCard title="Critical Skill Gaps" className="p-4 max-h-48 overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {(matchReport.weighted_gaps || matchReport.missing_critical_skills.map(s => ({ skill: s, criticality: 'High', gap_weight: 1.2, category: 'Technical' }))).map((g: any) => (
                    <div key={g.skill} className="flex items-center justify-between p-2 rounded-md bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-xs">
                      <span className="font-bold text-[var(--fg-color)]">{g.skill}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        g.criticality === 'High' ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30" : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      )}>
                        {g.criticality || 'Critical'} Gap
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
