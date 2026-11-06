'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpatialStore } from '@/lib/store';
import {
  User,
  Briefcase,
  MapPin,
  FileText,
  Zap,
  Globe,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Plus,
  X,
  Clock,
  Layers,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CandidateProfileUpdate, SkillItem, ExperienceItem } from '@/types/api';

const POPULAR_SKILLS = [
  'Python',
  'FastAPI',
  'React',
  'Next.js',
  'TypeScript',
  'Docker',
  'Kubernetes',
  'PostgreSQL',
  'Redis',
  'PyTorch',
  'Go',
  'AWS',
  'Distributed Systems',
  'GraphQL',
];

const ROLE_PRESETS = [
  'Senior Full-Stack Cloud Engineer',
  'Autonomous AI & ML Systems Lead',
  'Staff Distributed Systems Architect',
  'Frontend & UI/UX Systems Specialist',
  'DevOps & Cloud Infrastructure Lead',
];

const LOCATION_PRESETS = [
  'Remote',
  'San Francisco, CA',
  'Bengaluru, India',
  'London, UK',
  'Berlin, DE',
  'New York, NY',
];

export default function OnboardingModal() {
  const { user, isAuthenticated, setUser, setSocialProfileId, saveCandidateProfile } = useSpatialStore();

  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Python', 'React', 'FastAPI', 'Docker']);
  const [customSkill, setCustomSkill] = useState('');
  const [yearsOfExp, setYearsOfExp] = useState(4);
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Determine if onboarding is mandatory
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsOpen(false);
      return;
    }

    const email = user.email || '';
    const localFlag = typeof window !== 'undefined' ? localStorage.getItem(`skillmatch_profile_completed_${email}`) : null;

    if (user.profile_completed || localFlag === 'true') {
      setIsOpen(false);
      return;
    }

    // Prefill available user data
    setFullName(user.name || user.username || '');
    if (user.headline) setHeadline(user.headline);
    if (user.location) setLocation(user.location);
    if (user.bio) setBio(user.bio);

    const handle = (user.username || user.name || 'candidate').replace(/\s+/g, '').replace(/_/g, '').toLowerCase();
    setGithubUrl(`https://github.com/${handle}`);
    setLinkedinUrl(`https://linkedin.com/in/${handle}`);
    setPortfolioUrl(`https://${handle}.dev`);

    setIsOpen(true);
  }, [isAuthenticated, user]);

  if (!isOpen || !user) return null;

  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      if (selectedSkills.length <= 1) return; // Keep at least one
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customSkill.trim();
    if (!clean) return;
    if (!selectedSkills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setSelectedSkills([...selectedSkills, clean]);
    }
    setCustomSkill('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!headline.trim()) {
      setErrorMsg('Please specify your target role or professional headline.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Please enter your location or select Remote.');
      return;
    }
    if (selectedSkills.length < 2) {
      setErrorMsg('Please select at least 2 primary technical skills.');
      return;
    }

    setIsSubmitting(true);

    try {
      const activeId = user.email || user.username || String(user.id);
      const cleanHandle = (user.username || fullName || 'candidate').replace(/\s+/g, '').replace(/_/g, '').toLowerCase();

      const skillItems: SkillItem[] = selectedSkills.map((name, idx) => ({
        id: `skill_${idx}_${Date.now()}`,
        name,
        level: idx < 2 ? 'Expert' : idx < 5 ? 'Advanced' : 'Intermediate',
        category: 'Core Engineering',
        years: Math.max(1, yearsOfExp - (idx > 3 ? 1 : 0)),
      }));

      const expList: ExperienceItem[] = currentRole.trim()
        ? [
            {
              id: `exp_${Date.now()}`,
              role: currentRole.trim(),
              company: currentCompany.trim() || 'Enterprise Tech',
              location: location.trim(),
              start_date: `${new Date().getFullYear() - Math.min(yearsOfExp, 3)}`,
              end_date: 'Present',
              current: true,
              description: `Leading technical initiatives across ${selectedSkills.slice(0, 3).join(', ')}.`,
            },
          ]
        : [];

      const payload: CandidateProfileUpdate = {
        candidate_name: fullName.trim(),
        headline: headline.trim(),
        location: location.trim(),
        bio: bio.trim() || `Verified SkillMatch talent: ${fullName.trim()} specializes in ${selectedSkills.slice(0, 4).join(', ')}.`,
        skills: skillItems,
        experience: expList,
        social_profiles: {
          github: githubUrl.trim() || `https://github.com/${cleanHandle}`,
          linkedin: linkedinUrl.trim() || `https://linkedin.com/in/${cleanHandle}`,
          portfolio: portfolioUrl.trim() || `https://${cleanHandle}.dev`,
        },
        profile_completed: true,
      };

      await saveCandidateProfile(activeId, payload);

      // Update state and storage
      const updatedUser = {
        ...user,
        name: fullName.trim(),
        headline: headline.trim(),
        location: location.trim(),
        bio: payload.bio,
        skills: skillItems,
        profile_completed: true,
      };

      setUser(updatedUser);
      setSocialProfileId(activeId);

      if (typeof window !== 'undefined') {
        localStorage.setItem(`skillmatch_profile_completed_${user.email}`, 'true');
        localStorage.setItem('skillmatch_user', JSON.stringify(updatedUser));
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    } catch (err: any) {
      console.error('Onboarding save error:', err);
      setErrorMsg(err?.response?.data?.detail || err?.message || 'Failed to save profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* High-blur backdrop to block platform interaction until submitted */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-[#02040a]/90 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full max-w-2xl bg-[#090d16] border border-emerald-500/30 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto z-10 text-[var(--fg-color)]"
      >
        {/* Top Status Header */}
        <div className="bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-transparent p-5 sm:p-6 border-b border-[var(--glass-border-subtle)] relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Complete Your Profile Setup
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Required Step
                </span>
              </div>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                Fill in your candidate details to calibrate your AI skill match, CAT testing, and CV generator before accessing the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-lg">
                <CheckCircle2 size={36} className="animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white">Profile Configured & Verified!</h3>
              <p className="text-xs font-mono text-emerald-400 max-w-md mx-auto">
                Welcome to SkillMatch DNA. Unlocking full platform access and synchronizing your candidate identity hub…
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--fg-subtle)] flex items-center gap-1.5">
                    <User size={12} className="text-emerald-400" /> Full Name / Identity *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Utsab Sinha"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[var(--glass-border)] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--fg-subtle)] flex items-center gap-1.5">
                    <MapPin size={12} className="text-cyan-400" /> Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA or Remote"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[var(--glass-border)] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              {/* Location Quick Picks */}
              <div className="flex flex-wrap items-center gap-1.5 -mt-2">
                <span className="text-[10px] font-mono text-[var(--fg-subtle)] mr-1">Suggestions:</span>
                {LOCATION_PRESETS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className={cn(
                      'px-2 py-0.5 rounded-md text-[10px] font-mono border transition-all cursor-pointer',
                      location === loc
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                        : 'border-[var(--glass-border-subtle)] text-[var(--fg-muted)] hover:text-white'
                    )}
                  >
                    {loc}
                  </button>
                ))}
              </div>

              {/* 2. Target Role / Headline */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--fg-subtle)] flex items-center gap-1.5">
                  <Briefcase size={12} className="text-emerald-400" /> Target Role / Professional Headline *
                </label>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Cloud Engineer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[var(--glass-border)] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono text-[var(--fg-subtle)] mr-1">Presets:</span>
                  {ROLE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setHeadline(preset)}
                      className={cn(
                        'px-2 py-0.5 rounded-md text-[10px] font-mono border transition-all cursor-pointer truncate max-w-[200px]',
                        headline === preset
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-[var(--glass-border-subtle)] text-[var(--fg-muted)] hover:text-white'
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Core Technical Skills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--fg-subtle)] flex items-center gap-1.5">
                    <Zap size={12} className="text-amber-400" /> Core Technical Skills ({selectedSkills.length} selected) *
                  </label>
                  <span className="text-[10px] font-mono text-[var(--fg-subtle)]">Click to add/remove</span>
                </div>

                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-black/30 border border-[var(--glass-border-subtle)] min-h-[46px]">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleToggleSkill(skill)}
                        className="hover:text-white cursor-pointer ml-0.5"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Popular Skill Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {POPULAR_SKILLS.filter((s) => !selectedSkills.includes(s)).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleToggleSkill(skill)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono border border-[var(--glass-border-subtle)] text-[var(--fg-muted)] hover:text-white hover:border-emerald-500/50 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={9} /> {skill}
                    </button>
                  ))}
                </div>

                {/* Add Custom Skill */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Add other skill (e.g. Terraform, Rust, Kafka)..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSkill();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-[var(--glass-border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomSkill()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* 4. Experience & Bio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-[var(--fg-subtle)]">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={yearsOfExp}
                    onChange={(e) => setYearsOfExp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[var(--glass-border)] text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-[var(--fg-subtle)]">
                    Current / Recent Role
                  </label>
                  <input
                    type="text"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    placeholder="e.g. Full-Stack Engineer"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[var(--glass-border)] text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-[var(--fg-subtle)]">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    placeholder="e.g. Acme Corp or Freelance"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[var(--glass-border)] text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--fg-subtle)] flex items-center gap-1.5">
                  <FileText size={12} className="text-cyan-400" /> Executive Bio / Summary
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell recruiters and peers about your engineering background, core specialties, and what drives you..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[var(--glass-border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors custom-scrollbar"
                />
              </div>

              {/* 5. Social Proof Links */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--fg-subtle)] flex items-center gap-1.5">
                  <Globe size={12} className="text-emerald-400" /> Social &amp; Portfolio Links
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="GitHub URL"
                    className="px-3 py-1.5 rounded-xl bg-black/40 border border-[var(--glass-border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="LinkedIn URL"
                    className="px-3 py-1.5 rounded-xl bg-black/40 border border-[var(--glass-border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="Portfolio URL"
                    className="px-3 py-1.5 rounded-xl bg-black/40 border border-[var(--glass-border)] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Saving Profile DNA…</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Profile &amp; Unlock Platform</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

