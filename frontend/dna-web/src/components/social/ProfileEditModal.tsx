'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Zap,
  Briefcase,
  GraduationCap,
  Globe,
  Camera,
  Plus,
  Trash2,
  Check,
  Upload,
  Sparkles,
  MapPin,
  Calendar,
  Building,
  Award,
  Link2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  CandidateProfile,
  CandidateProfileUpdate,
  SkillItem,
  EducationItem,
  ExperienceItem,
  SkillProficiency,
} from '@/types/api';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CandidateProfile;
  onSave: (payload: CandidateProfileUpdate) => Promise<void>;
  initialTab?: 'basic' | 'skills' | 'experience' | 'education' | 'social';
}

const GRADIENT_PRESETS = [
  { label: 'Emerald Teal', class: 'from-emerald-400 to-cyan-500' },
  { label: 'Indigo Purple', class: 'from-indigo-500 to-purple-600' },
  { label: 'Amber Orange', class: 'from-amber-400 to-orange-500' },
  { label: 'Rose Pink', class: 'from-rose-500 to-pink-600' },
  { label: 'Blue Sky', class: 'from-blue-500 to-cyan-400' },
];

const POPULAR_SKILL_SUGGESTIONS = [
  'Python', 'FastAPI', 'PyTorch', 'Transformers', 'Kubernetes', 'Docker',
  'PostgreSQL', 'Redis', 'TypeScript', 'React', 'Next.js', 'Go',
  'WebRTC', 'WebAudio DSP', 'Distributed Systems', 'Kafka', 'GraphQL', 'AWS'
];

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  initialTab = 'basic',
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'skills' | 'experience' | 'education' | 'social'>(initialTab);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState(profile.candidate_name || '');
  const [headline, setHeadline] = useState(profile.headline || profile.candidate_role || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [location, setLocation] = useState(profile.location || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');

  // Skills state
  const [skills, setSkills] = useState<SkillItem[]>(profile.skills ? [...profile.skills] : []);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillProficiency>('Advanced');
  const [newSkillCategory, setNewSkillCategory] = useState('Backend');
  const [newSkillYears, setNewSkillYears] = useState(3);

  // Experience state
  const [experience, setExperience] = useState<ExperienceItem[]>(
    profile.experience ? [...profile.experience] : []
  );
  const [newExpRole, setNewExpRole] = useState('');
  const [newExpCompany, setNewExpCompany] = useState('');
  const [newExpLocation, setNewExpLocation] = useState('');
  const [newExpStart, setNewExpStart] = useState('');
  const [newExpEnd, setNewExpEnd] = useState('Present');
  const [newExpCurrent, setNewExpCurrent] = useState(true);
  const [newExpDesc, setNewExpDesc] = useState('');
  const [showAddExp, setShowAddExp] = useState(false);

  // Education state
  const [education, setEducation] = useState<EducationItem[]>(
    profile.education ? [...profile.education] : []
  );
  const [newEduDegree, setNewEduDegree] = useState('');
  const [newEduSchool, setNewEduSchool] = useState('');
  const [newEduField, setNewEduField] = useState('');
  const [newEduStart, setNewEduStart] = useState('');
  const [newEduEnd, setNewEduEnd] = useState('');
  const [newEduGrade, setNewEduGrade] = useState('');
  const [newEduDesc, setNewEduDesc] = useState('');
  const [showAddEdu, setShowAddEdu] = useState(false);

  // Social Links state
  const [github, setGithub] = useState(profile.social_profiles?.github || '');
  const [linkedin, setLinkedin] = useState(profile.social_profiles?.linkedin || '');
  const [portfolio, setPortfolio] = useState(profile.social_profiles?.portfolio || '');

  if (!isOpen) return null;

  // File Upload Handler (Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Skill Add
  const handleAddSkill = (skillName?: string) => {
    const target = (skillName || newSkillName).trim();
    if (!target) return;
    if (skills.some((s) => s.name.toLowerCase() === target.toLowerCase())) return;

    setSkills((prev) => [
      ...prev,
      {
        id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: target,
        level: newSkillLevel,
        category: newSkillCategory,
        years: newSkillYears,
      },
    ]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  // Experience Add
  const handleAddExperience = () => {
    if (!newExpRole.trim() || !newExpCompany.trim()) return;
    setExperience((prev) => [
      {
        id: `exp_${Date.now()}`,
        role: newExpRole.trim(),
        company: newExpCompany.trim(),
        location: newExpLocation.trim() || 'Remote',
        start_date: newExpStart.trim() || '2022',
        end_date: newExpCurrent ? 'Present' : newExpEnd.trim() || '2024',
        current: newExpCurrent,
        description: newExpDesc.trim(),
      },
      ...prev,
    ]);
    setNewExpRole('');
    setNewExpCompany('');
    setNewExpLocation('');
    setNewExpStart('');
    setNewExpEnd('');
    setNewExpDesc('');
    setShowAddExp(false);
  };

  const handleRemoveExperience = (index: number) => {
    setExperience((prev) => prev.filter((_, i) => i !== index));
  };

  // Education Add
  const handleAddEducation = () => {
    if (!newEduDegree.trim() || !newEduSchool.trim()) return;
    setEducation((prev) => [
      {
        id: `edu_${Date.now()}`,
        degree: newEduDegree.trim(),
        institution: newEduSchool.trim(),
        field_of_study: newEduField.trim(),
        start_year: newEduStart.trim() || '2018',
        end_year: newEduEnd.trim() || '2022',
        grade: newEduGrade.trim(),
        description: newEduDesc.trim(),
      },
      ...prev,
    ]);
    setNewEduDegree('');
    setNewEduSchool('');
    setNewEduField('');
    setNewEduStart('');
    setNewEduEnd('');
    setNewEduGrade('');
    setNewEduDesc('');
    setShowAddEdu(false);
  };

  const handleRemoveEducation = (index: number) => {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  };

  // Save All
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await onSave({
        candidate_name: name,
        headline,
        bio,
        location,
        avatar_url: avatarUrl,
        skills,
        experience,
        education,
        social_profiles: {
          github: github.trim() || null,
          linkedin: linkedin.trim() || null,
          portfolio: portfolio.trim() || null,
        },
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl theme-card border border-[var(--glass-border)] shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--glass-border-subtle)] bg-[var(--chrome-bg)]/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 flex items-center justify-center text-[var(--accent-primary)]">
              <User size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--fg-color)]">Edit Candidate Identity Hub</h2>
              <p className="text-[11px] text-[var(--fg-muted)]">Update skills, credentials, experience &amp; profile picture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-[var(--glass-border-subtle)] bg-[var(--glass-bg)]/40 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('basic')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'basic'
                ? 'bg-[var(--accent-primary)] text-slate-950 font-bold shadow-sm'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)]'
            )}
          >
            <User size={13} />
            <span>Profile &amp; Avatar</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'skills'
                ? 'bg-[var(--accent-primary)] text-slate-950 font-bold shadow-sm'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)]'
            )}
          >
            <Zap size={13} />
            <span>Skills ({skills.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('experience')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'experience'
                ? 'bg-[var(--accent-primary)] text-slate-950 font-bold shadow-sm'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)]'
            )}
          >
            <Briefcase size={13} />
            <span>Experience ({experience.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('education')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'education'
                ? 'bg-[var(--accent-primary)] text-slate-950 font-bold shadow-sm'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)]'
            )}
          >
            <GraduationCap size={13} />
            <span>Education ({education.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'social'
                ? 'bg-[var(--accent-primary)] text-slate-950 font-bold shadow-sm'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg-color)] hover:bg-[var(--glass-bg)]'
            )}
          >
            <Globe size={13} />
            <span>Social Links</span>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Basic Information & Profile Picture */}
          {activeTab === 'basic' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Profile Picture Management */}
              <div className="p-5 rounded-2xl theme-surface border border-[var(--glass-border-subtle)] space-y-4">
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-[var(--accent-primary)]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-color)]">
                    Profile Picture / Avatar
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Current Avatar Preview */}
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[var(--accent-primary)] shadow-lg bg-gradient-to-br from-[var(--accent-primary)] to-cyan-500 flex items-center justify-center text-white font-bold text-2xl">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar Preview"
                          className="w-full h-full object-cover"
                          onError={() => setAvatarUrl('')}
                        />
                      ) : (
                        <span>{name.charAt(0) || 'U'}</span>
                      )}
                    </div>
                  </div>

                  {/* Upload & Preset Options */}
                  <div className="flex-1 space-y-3 w-full">
                    <div>
                      <label className="block text-xs font-medium text-[var(--fg-color)] mb-1">
                        Image URL (Direct link to PNG/JPG/SVG)
                      </label>
                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-2 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--glass-border-subtle)] hover:border-[var(--accent-primary)] text-xs font-medium text-[var(--fg-color)] bg-[var(--glass-bg)] transition-colors">
                        <Upload size={13} className="text-[var(--accent-primary)]" />
                        <span>Upload Local Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      {avatarUrl && (
                        <button
                          onClick={() => setAvatarUrl('')}
                          className="text-xs text-rose-400 hover:underline cursor-pointer"
                        >
                          Clear Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Avatar Badge Gradient Theme */}
                <div className="space-y-2 pt-2 border-t border-[var(--glass-border-subtle)]">
                  <span className="text-[11px] font-mono text-[var(--fg-subtle)]">Avatar Accent Palette:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {GRADIENT_PRESETS.map((p) => (
                      <button
                        key={p.class}
                        type="button"
                        onClick={() => {
                          setAvatarUrl('');
                        }}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-gradient-to-r transition-all cursor-pointer shadow-sm',
                          p.class
                        )}
                        title={p.label}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name, Headline & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--fg-color)] mb-1">
                    Candidate Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-2 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--fg-color)] mb-1">
                    Location &amp; Work Model
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Berlin, Germany (Hybrid) or Remote"
                    className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-2 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--fg-color)] mb-1">
                  Professional Headline / Target Role
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Staff LLM Infrastructure & Distributed Systems Engineer"
                  className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-2 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--fg-color)] mb-1">
                  Professional Narrative (Bio)
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Summarize your engineering impact, core architectures built, and production achievements..."
                  className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-2 text-xs text-[var(--fg-color)] leading-relaxed focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Technical Skills Management */}
          {activeTab === 'skills' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Add Skill Input Form */}
              <div className="p-4 rounded-2xl theme-surface border border-[var(--glass-border-subtle)] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-color)] flex items-center gap-1.5">
                  <Plus size={14} className="text-[var(--accent-primary)]" />
                  <span>Add New Technical Skill</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      placeholder="Skill name (e.g. PyTorch, Docker, Kubernetes)"
                      className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-2 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <select
                      value={newSkillLevel}
                      onChange={(e) => setNewSkillLevel(e.target.value as SkillProficiency)}
                      className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-2 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                    >
                      <option value="Expert">Expert</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Beginner">Beginner</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <select
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value)}
                      className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-2 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                    >
                      <option value="Backend">Backend</option>
                      <option value="AI / ML">AI / ML</option>
                      <option value="Infra / DevOps">Infra / DevOps</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Databases">Databases</option>
                      <option value="Systems">Systems</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      onClick={() => handleAddSkill()}
                      disabled={!newSkillName.trim()}
                      className="w-full theme-primary-btn py-2 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <Plus size={13} /> Add
                    </button>
                  </div>
                </div>

                {/* Quick Add Suggestions */}
                <div className="pt-2 border-t border-[var(--glass-border-subtle)] space-y-1.5">
                  <span className="text-[11px] font-mono text-[var(--fg-subtle)]">Quick Add:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SKILL_SUGGESTIONS.map((skill) => {
                      const alreadyAdded = skills.some((s) => s.name.toLowerCase() === skill.toLowerCase());
                      return (
                        <button
                          key={skill}
                          type="button"
                          disabled={alreadyAdded}
                          onClick={() => handleAddSkill(skill)}
                          className={cn(
                            'px-2 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1',
                            alreadyAdded
                              ? 'bg-[var(--glass-bg)] opacity-40 text-[var(--fg-subtle)] cursor-not-allowed'
                              : 'bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] hover:border-[var(--accent-primary)] text-[var(--fg-color)]'
                          )}
                        >
                          <Plus size={10} />
                          <span>{skill}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Current Skills List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-color)]">
                    Current Skills ({skills.length})
                  </h4>
                  <span className="text-[11px] font-mono text-[var(--fg-subtle)]">Click &times; to remove</span>
                </div>

                {skills.length === 0 ? (
                  <p className="text-xs text-[var(--fg-muted)] p-4 text-center border border-dashed border-[var(--glass-border-subtle)] rounded-xl">
                    No skills added yet. Add some above or use quick-add chips.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {skills.map((s, idx) => (
                      <div
                        key={s.id || s.name + idx}
                        className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] flex items-center justify-between gap-2 group hover:border-[var(--glass-border)] transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[var(--fg-color)] truncate">{s.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={cn(
                              'text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold',
                              s.level === 'Expert' ? 'bg-emerald-500/15 text-emerald-400' :
                              s.level === 'Advanced' ? 'bg-cyan-500/15 text-cyan-400' :
                              s.level === 'Intermediate' ? 'bg-amber-500/15 text-amber-400' :
                              'bg-slate-500/15 text-slate-400'
                            )}>
                              {s.level}
                            </span>
                            {s.category && (
                              <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                                {s.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(idx)}
                          className="p-1 rounded-lg text-[var(--fg-subtle)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove skill"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Experience Details Management */}
          {activeTab === 'experience' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-color)]">
                  Work Experience History
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddExp(!showAddExp)}
                  className="theme-primary-btn px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} /> {showAddExp ? 'Cancel' : 'Add Role'}
                </button>
              </div>

              {/* Add Experience Form */}
              {showAddExp && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl theme-surface border border-[var(--accent-primary)]/40 space-y-3"
                >
                  <h4 className="text-xs font-bold text-[var(--accent-primary)]">Add New Work Experience</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[var(--fg-muted)] mb-1">Job Title / Role</label>
                      <input
                        type="text"
                        value={newExpRole}
                        onChange={(e) => setNewExpRole(e.target.value)}
                        placeholder="e.g. Staff Software Engineer"
                        className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-1.5 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[var(--fg-muted)] mb-1">Company / Organization</label>
                      <input
                        type="text"
                        value={newExpCompany}
                        onChange={(e) => setNewExpCompany(e.target.value)}
                        placeholder="e.g. Helios Labs"
                        className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-1.5 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-[var(--fg-muted)] mb-1">Location</label>
                      <input
                        type="text"
                        value={newExpLocation}
                        onChange={(e) => setNewExpLocation(e.target.value)}
                        placeholder="e.g. Berlin, Germany or Remote"
                        className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-1.5 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[var(--fg-muted)] mb-1">Start Date</label>
                      <input
                        type="text"
                        value={newExpStart}
                        onChange={(e) => setNewExpStart(e.target.value)}
                        placeholder="e.g. 2022 or Jan 2022"
                        className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-1.5 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[var(--fg-muted)] mb-1">End Date</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newExpCurrent ? 'Present' : newExpEnd}
                          disabled={newExpCurrent}
                          onChange={(e) => setNewExpEnd(e.target.value)}
                          placeholder="e.g. 2024"
                          className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-1.5 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)] disabled:opacity-50"
                        />
                        <label className="flex items-center gap-1 text-[11px] font-mono text-[var(--fg-subtle)] shrink-0 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newExpCurrent}
                            onChange={(e) => setNewExpCurrent(e.target.checked)}
                            className="rounded"
                          />
                          <span>Current</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[var(--fg-muted)] mb-1">Key Impact &amp; Architecture Description</label>
                    <textarea
                      value={newExpDesc}
                      onChange={(e) => setNewExpDesc(e.target.value)}
                      rows={3}
                      placeholder="Spearheaded distributed infrastructure, reduced p99 latency by 45%..."
                      className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-1.5 text-xs text-[var(--fg-color)] leading-relaxed focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddExp(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--glass-border-subtle)] text-[var(--fg-muted)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      disabled={!newExpRole.trim() || !newExpCompany.trim()}
                      className="theme-primary-btn px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
                    >
                      Save Role
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Experience List */}
              {experience.length === 0 ? (
                <p className="text-xs text-[var(--fg-muted)] p-6 text-center border border-dashed border-[var(--glass-border-subtle)] rounded-xl">
                  No experience entries added. Click &quot;Add Role&quot; above to list your career achievements.
                </p>
              ) : (
                <div className="space-y-3">
                  {experience.map((exp, idx) => (
                    <div
                      key={exp.id || idx}
                      className="p-4 rounded-2xl theme-surface border border-[var(--glass-border-subtle)] space-y-2 relative group hover:border-[var(--glass-border)] transition-colors"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[var(--fg-color)]">{exp.role}</h4>
                            {exp.current && (
                              <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[var(--fg-subtle)] mt-0.5">
                            <span className="text-[var(--accent-primary)] font-medium flex items-center gap-1">
                              <Building size={11} /> {exp.company}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin size={11} /> {exp.location || 'Remote'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={11} /> {exp.start_date} – {exp.end_date || (exp.current ? 'Present' : '')}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(idx)}
                          className="p-1.5 rounded-lg text-[var(--fg-subtle)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete role"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {exp.description && (
                        <p className="text-xs text-[var(--fg-muted)] leading-relaxed pt-1">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Education Details Management */}
          {activeTab === 'education' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-color)]">
                  Education &amp; Credentials
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddEdu(!showAddEdu)}
                  className="theme-primary-btn px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} /> {showAddEdu ? 'Cancel' : 'Add Degree'}
                </button>
              </div>

              {/* Add Education Form */}
              {showAddEdu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl theme-surface border border-[var(--accent-primary)]/40 space-y-3"
                >
                  <h4 className="text-xs font-bold text-[var(--accent-primary)]">Add Academic Credential</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[var(--fg-muted)] mb-1">Degree (e.g. M.S. Computer Science)</label>
                      <input
                        type="text"
                        value={newEduDegree}
                        onChange={(e) => setNewEduDegree(e.target.value)}
                        placeholder="e.g. B.S. in Software Engineering"
                        className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-1.5 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[var(--fg-muted)] mb-1">University / Institution</label>
                      <input
                        type="text"
                        value={newEduSchool}
                        onChange={(e) => setNewEduSchool(e.target.value)}
                        placeholder="e.g. Technical University of Munich"
                        className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-1.5 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-[var(--fg-muted)] mb-1">Field of Study</label>
                      <input
                        type="text"
                        value={newEduField}
                        onChange={(e) => setNewEduField(e.target.value)}
                        placeholder="e.g. Distributed Systems"
                        className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-1.5 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[var(--fg-muted)] mb-1">Start &amp; End Year</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newEduStart}
                          onChange={(e) => setNewEduStart(e.target.value)}
                          placeholder="2018"
                          className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-2 py-1.5 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                        />
                        <span className="text-[var(--fg-subtle)]">–</span>
                        <input
                          type="text"
                          value={newEduEnd}
                          onChange={(e) => setNewEduEnd(e.target.value)}
                          placeholder="2022"
                          className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-2 py-1.5 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[var(--fg-muted)] mb-1">Grade / Honors</label>
                      <input
                        type="text"
                        value={newEduGrade}
                        onChange={(e) => setNewEduGrade(e.target.value)}
                        placeholder="e.g. First Class Honours / 3.9 GPA"
                        className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-1.5 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[var(--fg-muted)] mb-1">Notable Thesis / Coursework</label>
                    <textarea
                      value={newEduDesc}
                      onChange={(e) => setNewEduDesc(e.target.value)}
                      rows={2}
                      placeholder="Thesis on consensus algorithms, cap-stone project on low-latency inference..."
                      className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-1.5 text-xs text-[var(--fg-color)] leading-relaxed focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddEdu(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--glass-border-subtle)] text-[var(--fg-muted)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddEducation}
                      disabled={!newEduDegree.trim() || !newEduSchool.trim()}
                      className="theme-primary-btn px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
                    >
                      Save Degree
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Education List */}
              {education.length === 0 ? (
                <p className="text-xs text-[var(--fg-muted)] p-6 text-center border border-dashed border-[var(--glass-border-subtle)] rounded-xl">
                  No education details added yet. Click &quot;Add Degree&quot; above.
                </p>
              ) : (
                <div className="space-y-3">
                  {education.map((edu, idx) => (
                    <div
                      key={edu.id || idx}
                      className="p-4 rounded-2xl theme-surface border border-[var(--glass-border-subtle)] space-y-2 relative group hover:border-[var(--glass-border)] transition-colors"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[var(--fg-color)]">{edu.degree}</h4>
                            {edu.grade && (
                              <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                                {edu.grade}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[var(--fg-subtle)] mt-0.5">
                            <span className="text-[var(--accent-primary)] font-medium flex items-center gap-1">
                              <GraduationCap size={12} /> {edu.institution}
                            </span>
                            {edu.field_of_study && (
                              <>
                                <span>•</span>
                                <span>{edu.field_of_study}</span>
                              </>
                            )}
                            {(edu.start_year || edu.end_year) && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar size={11} /> {edu.start_year} – {edu.end_year}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(idx)}
                          className="p-1.5 rounded-lg text-[var(--fg-subtle)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete degree"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {edu.description && (
                        <p className="text-xs text-[var(--fg-muted)] leading-relaxed pt-1">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Social Proof Profiles */}
          {activeTab === 'social' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-color)]">
                  External Social Proof &amp; Verified Links
                </h3>
                <p className="text-xs text-[var(--fg-muted)]">
                  Recruiters inspect these verified URLs during the technical evaluation workflow.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[var(--fg-color)] mb-1 flex items-center gap-1.5">
                    <Link2 size={12} className="text-emerald-500" />
                    <span>GitHub Profile URL</span>
                  </label>
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-2 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--fg-color)] mb-1 flex items-center gap-1.5">
                    <Link2 size={12} className="text-cyan-400" />
                    <span>LinkedIn Profile URL</span>
                  </label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-2 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--fg-color)] mb-1 flex items-center gap-1.5">
                    <Link2 size={12} className="text-[var(--accent-primary)]" />
                    <span>Personal Portfolio / Tech Blog URL</span>
                  </label>
                  <input
                    type="url"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="https://yourportfolio.dev"
                    className="w-full rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] px-3 py-2 text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--glass-border-subtle)] bg-[var(--chrome-bg)]/80 backdrop-blur-xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--glass-border-subtle)] text-[var(--fg-muted)] hover:text-[var(--fg-color)] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="theme-primary-btn px-6 py-2.5 text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-lg shadow-[var(--accent-glow)] disabled:opacity-60"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                <span>Syncing Identity Hub…</span>
              </>
            ) : (
              <>
                <Check size={14} strokeWidth={2.5} />
                <span>Save Identity Hub Changes</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileEditModal;
