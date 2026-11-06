'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Sparkles, CheckCircle2, AlertTriangle, Download, Copy,
  Check, RefreshCw, ShieldCheck, Zap, Target, Briefcase, GraduationCap,
  Code2, Plus, Printer, ExternalLink, Github, Linkedin, Globe,
  Mail, Phone, MapPin, X, ChevronDown, ChevronUp, Edit3, Upload,
  Trash2, FileUp, Sparkle, ArrowUpRight
} from 'lucide-react';
import {
  useGenerateTailoredCV,
  useATSCheck,
  useExportCVPDF,
  useCandidateProfile,
  useParseResumeFile,
  useParseResumeText
} from '@/hooks/useFastAPI';
import { TailoredCVResponse, ATSEvaluation } from '@/types/api';
import { useSpatialStore } from '@/lib/store';

const PRESET_JDS: { label: string; role: string; jd: string }[] = [
  {
    label: 'Senior Full-Stack Cloud Engineer',
    role: 'Senior Full-Stack Cloud Engineer',
    jd: `We are seeking a Senior Full-Stack Cloud Engineer with deep expertise in Python, FastAPI, React, Next.js, and TypeScript.
Required Skills:
- Architecting resilient REST and gRPC microservices with PostgreSQL and Redis caching.
- Designing high-throughput event-driven architectures using Kafka or RabbitMQ.
- Deploying containerized workloads using Docker, Kubernetes, and CI/CD pipelines on AWS.
- Writing comprehensive unit and integration tests with Pytest and Jest.
- Familiarity with WebAudio DSP, active noise cancellation, or WebRTC is a strong plus.`
  },
  {
    label: 'Autonomous AI & ML Systems Lead',
    role: 'Autonomous AI & ML Systems Lead',
    jd: `Apex AI is looking for an AI/ML Platform Lead to build distributed inference engines and vector retrieval architectures.
Required Skills:
- Production deployment of Large Language Models (LLMs) with vLLM, TensorRT-LLM, and HuggingFace.
- 384-dimensional dense vector embeddings using Sentence-Transformers and Pinecone/pgvector.
- Natural Language Processing (NLP) pipelines with spaCy, PyMuPDF, and faster-whisper.
- Computerized Adaptive Testing (CAT) and Item Response Theory (IRT) modeling.
- Strong Python, PyTorch, FastAPI, and asynchronous concurrency fundamentals.`
  },
  {
    label: 'Staff Distributed Systems Architect',
    role: 'Staff Distributed Systems Architect',
    jd: `Looking for a Staff Distributed Systems Architect to lead high-concurrency cloud infrastructure.
Required Skills:
- Distributed consensus, CAP theorem trade-offs, and database replication in PostgreSQL and CockroachDB.
- High-performance caching layers with Redis, memcached, and cache-aside patterns.
- Asynchronous task processing with Celery, Redis queue, and exponential backoff retries.
- Zero-Knowledge proofs, security compliance, and microservices observability.`
  }
];

const STAR_SUGGESTIONS = [
  {
    label: '+ Latency Reduction',
    text: 'Engineered low-latency caching and data pipeline utilizing Redis and PostgreSQL, slashing query latency by 42%.'
  },
  {
    label: '+ Microservices Scale',
    text: 'Architected resilient microservices in FastAPI handling 2.5M+ daily requests with 99.99% uptime and sub-60ms p99 latency.'
  },
  {
    label: '+ CI/CD Velocity',
    text: 'Automated end-to-end CI/CD delivery pipelines with Docker and Kubernetes on AWS, cutting release cycle time by 45%.'
  },
  {
    label: '+ WebAudio DSP',
    text: 'Spearheaded active noise cancellation (ANC) audio pipeline in WebAudio DSP reducing background clatter by 18.4 dB.'
  }
];

interface ExperienceEntry {
  title: string;
  company: string;
  duration: string;
  bullets: string[];
}

interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
  details?: string;
}

export function CVBuilder() {
  const { user, socialProfileId, candidateProfiles } = useSpatialStore();

  // Active identifier for profile lookups
  const activeProfileId = user?.email || user?.username || String(user?.id || '') || socialProfileId;
  const { data: remoteProfile } = useCandidateProfile(activeProfileId);

  // Generate clean handle based on user name/username
  const cleanHandle = useMemo(() => {
    return (user?.username || user?.name || 'candidate')
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
  }, [user]);

  // Section 1: Target Role & JD
  const [targetRole, setTargetRole] = useState('Senior Full-Stack Cloud Engineer');
  const [jobDescription, setJobDescription] = useState(PRESET_JDS[0].jd);

  // Section 2: Social & Online Presence Links
  const [socialLinks, setSocialLinks] = useState({
    github: `https://github.com/${cleanHandle}`,
    linkedin: `https://linkedin.com/in/${cleanHandle}`,
    portfolio: `https://${cleanHandle}.dev`,
    public_proof_url: `skillmatch.id/verify/${cleanHandle}`,
  });

  // Section 3: Baseline Resume & Live Modification Space
  const [resumeMode, setResumeMode] = useState<'form' | 'markdown'>('form');
  const [candidateProfile, setCandidateProfile] = useState({
    name: user?.name || "SkillMatch Candidate",
    role: user?.headline || "Senior Full-Stack Engineer",
    email: user?.email || "candidate@skillmatch.io",
    phone: "+1 (555) 438-9120",
    location: user?.location || "San Francisco, CA (Open to Remote)",
    summary: "Results-driven senior engineer with deep expertise in scalable cloud architectures, high-throughput microservices, and distributed systems.",
    skills: ["Python", "FastAPI", "React", "Next.js", "TypeScript", "PostgreSQL", "Docker", "Git", "Redis"] as string[],
    experience: [
      {
        title: "Lead Cloud Architect",
        company: "Apex Cloud Systems",
        duration: "2023 - Present",
        bullets: [
          "Architected resilient microservices handling 2.5M+ daily requests with 99.99% uptime.",
          "Engineered low-latency caching pipeline reducing p95 query latency by 42%.",
          "Automated end-to-end CI/CD deployments cutting release cycle time by 45%."
        ]
      },
      {
        title: "Senior Full-Stack Engineer",
        company: "Nexus Distributed Labs",
        duration: "2021 - 2023",
        bullets: [
          "Developed high-performance RESTful APIs servicing 500k+ active enterprise users.",
          "Implemented automated unit and integration tests with 92% coverage in Pytest/Jest."
        ]
      }
    ] as ExperienceEntry[],
    education: [
      {
        degree: "B.S. in Computer Science & Engineering",
        institution: "Technical Institute of Technology",
        year: "2017 - 2021",
        details: "Specialization in Distributed Systems & Cloud Infrastructure (Honors)"
      }
    ] as EducationEntry[],
    ccrs_score: 94.5,
    verification_badge: "Verified Candidate",
  });

  // Section 4: Role-Specific Custom Highlights
  const [customDetails, setCustomDetails] = useState(
    "Spearheaded active noise cancellation (ANC) audio pipeline in WebAudio DSP reducing background clatter by 18.4 dB.\n" +
    "Scaled real-time FastAPI ingestion services from 500k to 2.5M daily active requests with sub-50ms p99 latency.\n" +
    "Automated end-to-end CI/CD deployments in Docker & Kubernetes, cutting release cycle time by 45%."
  );

  // Raw Markdown Editor in Resume Workspace
  const [resumeRawMarkdown, setResumeRawMarkdown] = useState('');

  // UI state for skill input, file upload
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parseStatusMsg, setParseStatusMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Output & UI tab states
  const [activeViewTab, setActiveViewTab] = useState<'preview' | 'markdown' | 'ats_report'>('preview');
  const [generatedCV, setGeneratedCV] = useState<TailoredCVResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [editableMarkdown, setEditableMarkdown] = useState('');

  // API mutations
  const generateMut = useGenerateTailoredCV();
  const atsCheckMut = useATSCheck();
  const exportPdfMut = useExportCVPDF();
  const parseFileMut = useParseResumeFile();
  const parseTextMut = useParseResumeText();
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Sync candidate baseline details whenever authenticated user or remote profile loads
  useEffect(() => {
    const cached = candidateProfiles[activeProfileId];
    const src = remoteProfile || cached;

    const resolvedName = src?.candidate_name || user?.name || (user?.username ? user.username : undefined);
    const resolvedEmail = user?.email;
    const resolvedRole = src?.candidate_role || src?.headline || user?.headline;
    const resolvedLocation = src?.location || user?.location;

    const resolvedGh = src?.social_profiles?.github || (cleanHandle ? `https://github.com/${cleanHandle}` : undefined);
    const resolvedLi = src?.social_profiles?.linkedin || (cleanHandle ? `https://linkedin.com/in/${cleanHandle}` : undefined);
    const resolvedPort = src?.social_profiles?.portfolio || (cleanHandle ? `https://${cleanHandle}.dev` : undefined);
    const resolvedProof = src?.public_proof_url || (cleanHandle ? `skillmatch.id/verify/${cleanHandle}` : undefined);

    const ccrs = src?.ccrs_score || 94.5;
    const badge = src?.verification_badge || "Verified Candidate";

    if (resolvedGh || resolvedLi || resolvedPort || resolvedProof) {
      setSocialLinks(prev => ({
        github: resolvedGh || prev.github,
        linkedin: resolvedLi || prev.linkedin,
        portfolio: resolvedPort || prev.portfolio,
        public_proof_url: resolvedProof || prev.public_proof_url,
      }));
    }

    let rawSkills: string[] = [];
    if (src?.skills && Array.isArray(src.skills) && src.skills.length > 0) {
      rawSkills = src.skills.map((s: any) => typeof s === 'string' ? s : s.name);
    } else if (user?.skills && Array.isArray(user.skills) && user.skills.length > 0) {
      rawSkills = user.skills.map((s: any) => typeof s === 'string' ? s : s.name);
    }

    setCandidateProfile(prev => {
      let mappedExp: ExperienceEntry[] = prev.experience;
      if (src?.experience && Array.isArray(src.experience) && src.experience.length > 0) {
        mappedExp = src.experience.map((e: any) => ({
          title: e.title || e.role || "Software Engineer",
          company: e.company || "Enterprise Tech",
          duration: e.duration || (e.start_date ? `${e.start_date} - ${e.end_date || 'Present'}` : "2022 - Present"),
          bullets: Array.isArray(e.bullets) && e.bullets.length > 0
            ? e.bullets
            : (e.description ? [e.description] : ["Architected key systems initiatives."])
        }));
      }

      let mappedEdu: EducationEntry[] = prev.education;
      if (src?.education && Array.isArray(src.education) && src.education.length > 0) {
        mappedEdu = src.education.map((ed: any) => ({
          degree: ed.degree || "Degree",
          institution: ed.institution || "University",
          year: ed.year || (ed.start_year ? `${ed.start_year} - ${ed.end_year || 'Present'}` : "2022"),
          details: ed.details || ed.field_of_study || ""
        }));
      }

      return {
        ...prev,
        name: resolvedName || prev.name,
        email: resolvedEmail || prev.email,
        role: resolvedRole || prev.role,
        location: resolvedLocation || prev.location,
        skills: rawSkills.length > 0 ? rawSkills : prev.skills,
        experience: mappedExp,
        education: mappedEdu,
        ccrs_score: ccrs,
        verification_badge: String(badge),
      };
    });
  }, [user, remoteProfile, candidateProfiles, activeProfileId, cleanHandle]);

  // Synchronize Markdown state when candidateProfile changes
  useEffect(() => {
    const lines = [
      `# ${candidateProfile.name}`,
      `**${candidateProfile.role}** | ${candidateProfile.location} | ${candidateProfile.email} | ${candidateProfile.phone}`,
      `[GitHub](${socialLinks.github}) • [LinkedIn](${socialLinks.linkedin}) • [Portfolio](${socialLinks.portfolio}) • [Proof](${socialLinks.public_proof_url})`,
      '',
      '## Professional Summary',
      candidateProfile.summary,
      '',
      '## Technical Competencies',
      `* **Skills:** ${candidateProfile.skills.join(', ')}`,
      '',
      '## Professional Experience'
    ];

    candidateProfile.experience.forEach(exp => {
      lines.push(`### ${exp.title} — ${exp.company}`);
      lines.push(`*${exp.duration}*`);
      exp.bullets.forEach(b => lines.push(`- ${b}`));
      lines.push('');
    });

    lines.push('## Education & Credentials');
    candidateProfile.education.forEach(edu => {
      lines.push(`### ${edu.degree} — ${edu.institution}`);
      lines.push(`*${edu.year}* ${edu.details ? `| ${edu.details}` : ''}`);
      lines.push('');
    });

    setResumeRawMarkdown(lines.join('\n'));
  }, [candidateProfile, socialLinks]);

  // Synchronize generated CV markdown into editable tab
  useEffect(() => {
    if (generatedCV?.cv_markdown) {
      setEditableMarkdown(generatedCV.cv_markdown);
    }
  }, [generatedCV]);

  // Handlers for Target Role & Presets
  const handleApplyPreset = (preset: typeof PRESET_JDS[0]) => {
    setTargetRole(preset.role);
    setJobDescription(preset.jd);
  };

  // Handlers for File Upload & Resume Parsing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    setParseStatusMsg(`Parsing ${file.name}...`);
    try {
      const parsed = await parseFileMut.mutateAsync(file);
      applyParsedData(parsed);
      setParseStatusMsg(`✓ Successfully parsed ${file.name}`);
      setTimeout(() => setParseStatusMsg(null), 4000);
    } catch (err: any) {
      console.error("Resume file parse error:", err);
      setParseStatusMsg(`Failed to parse file: ${err.message || 'Unknown error'}`);
    } finally {
      setIsParsingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyParsedText = async () => {
    if (!resumeRawMarkdown.trim()) return;
    setIsParsingFile(true);
    setParseStatusMsg('Syncing markdown changes...');
    try {
      const parsed = await parseTextMut.mutateAsync(resumeRawMarkdown);
      applyParsedData(parsed);
      setParseStatusMsg('✓ Markdown changes applied to form and preview!');
      setTimeout(() => setParseStatusMsg(null), 3000);
    } catch (err: any) {
      console.error("Parse text error:", err);
      setParseStatusMsg(`Failed to sync: ${err.message}`);
    } finally {
      setIsParsingFile(false);
    }
  };

  const applyParsedData = (parsed: Record<string, any>) => {
    if (parsed.name && parsed.name !== 'Candidate Name') {
      setCandidateProfile(p => ({ ...p, name: parsed.name }));
    }
    if (parsed.email) setCandidateProfile(p => ({ ...p, email: parsed.email }));
    if (parsed.phone) setCandidateProfile(p => ({ ...p, phone: parsed.phone }));
    if (parsed.location) setCandidateProfile(p => ({ ...p, location: parsed.location }));
    if (parsed.role && parsed.role !== 'Software Engineer') {
      setCandidateProfile(p => ({ ...p, role: parsed.role }));
    }
    if (parsed.summary) setCandidateProfile(p => ({ ...p, summary: parsed.summary }));

    if (parsed.social_profiles) {
      setSocialLinks(prev => ({
        github: parsed.social_profiles.github || prev.github,
        linkedin: parsed.social_profiles.linkedin || prev.linkedin,
        portfolio: parsed.social_profiles.portfolio || prev.portfolio,
        public_proof_url: prev.public_proof_url,
      }));
    }

    if (Array.isArray(parsed.skills) && parsed.skills.length > 0) {
      setCandidateProfile(p => ({
        ...p,
        skills: Array.from(new Set([...p.skills, ...parsed.skills]))
      }));
    }

    if (Array.isArray(parsed.experience) && parsed.experience.length > 0) {
      setCandidateProfile(p => ({ ...p, experience: parsed.experience }));
    }

    if (Array.isArray(parsed.education) && parsed.education.length > 0) {
      setCandidateProfile(p => ({ ...p, education: parsed.education }));
    }
  };

  // Handlers for Experience modification
  const handleAddExperience = () => {
    setCandidateProfile(prev => ({
      ...prev,
      experience: [
        {
          title: "Senior Systems Engineer",
          company: "Enterprise Cloud Lab",
          duration: "2023 - Present",
          bullets: ["Engineered scalable production services with high availability and automated tests."]
        },
        ...prev.experience
      ]
    }));
  };

  const handleUpdateExperience = (idx: number, field: keyof ExperienceEntry, val: any) => {
    setCandidateProfile(prev => {
      const copy = [...prev.experience];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, experience: copy };
    });
  };

  const handleDeleteExperience = (idx: number) => {
    setCandidateProfile(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== idx)
    }));
  };

  const handleAddBullet = (expIdx: number) => {
    setCandidateProfile(prev => {
      const copy = [...prev.experience];
      copy[expIdx] = {
        ...copy[expIdx],
        bullets: [...copy[expIdx].bullets, "Delivered high-impact architectural improvements driving SLA metrics."]
      };
      return { ...prev, experience: copy };
    });
  };

  const handleUpdateBullet = (expIdx: number, bulletIdx: number, text: string) => {
    setCandidateProfile(prev => {
      const copy = [...prev.experience];
      const newBullets = [...copy[expIdx].bullets];
      newBullets[bulletIdx] = text;
      copy[expIdx] = { ...copy[expIdx], bullets: newBullets };
      return { ...prev, experience: copy };
    });
  };

  const handleDeleteBullet = (expIdx: number, bulletIdx: number) => {
    setCandidateProfile(prev => {
      const copy = [...prev.experience];
      copy[expIdx] = {
        ...copy[expIdx],
        bullets: copy[expIdx].bullets.filter((_, i) => i !== bulletIdx)
      };
      return { ...prev, experience: copy };
    });
  };

  // Handlers for Skills
  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (!candidateProfile.skills.includes(trimmed)) {
      setCandidateProfile(prev => ({
        ...prev,
        skills: [...prev.skills, trimmed]
      }));
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setCandidateProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  // Handlers for Education
  const handleAddEducation = () => {
    setCandidateProfile(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: "B.S. in Computer Science",
          institution: "University Institute",
          year: "2018 - 2022",
          details: "Coursework in Algorithms, Operating Systems & Cloud Databases"
        }
      ]
    }));
  };

  const handleUpdateEducation = (idx: number, field: keyof EducationEntry, val: string) => {
    setCandidateProfile(prev => {
      const copy = [...prev.education];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, education: copy };
    });
  };

  const handleDeleteEducation = (idx: number) => {
    setCandidateProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx)
    }));
  };

  // Supplementary highlights suggestion
  const handleAddSuggestion = (suggestionText: string) => {
    if (customDetails.includes(suggestionText)) return;
    setCustomDetails(prev => prev ? `${prev.trim()}\n${suggestionText}` : suggestionText);
  };

  // Core Tailored CV Generation
  const handleGenerate = async () => {
    setGenError(null);
    try {
      const res = await generateMut.mutateAsync({
        profile_data: {
          ...candidateProfile,
          social_profiles: socialLinks,
        },
        custom_details: customDetails,
        job_description: jobDescription,
        target_role: targetRole
      });
      setGeneratedCV(res);
      setEditableMarkdown(res.cv_markdown);

      // Proactive ATS Verification if not provided in response
      if (!res.ats_evaluation) {
        try {
          const atsRes = await atsCheckMut.mutateAsync({
            cv_text: res.cv_markdown,
            job_description: jobDescription
          });
          setGeneratedCV(prev => prev ? { ...prev, ats_evaluation: atsRes } : null);
        } catch (atsErr) {
          console.warn("Proactive ATS check failed:", atsErr);
        }
      }
    } catch (err: any) {
      console.error("CV generation failed:", err);
      setGenError(err?.message || "Failed to generate tailored CV. Please retry.");
    }
  };

  // Incorporate missing ATS keywords as STAR bullets
  const handleAddMissingKeyword = async (kw: string) => {
    const starBullet = `Architected and deployed production-grade services utilizing ${kw}, driving system throughput and SLA compliance.`;
    const updatedDetails = `${customDetails.trim()}\n${starBullet}`;
    setCustomDetails(updatedDetails);

    if (generatedCV) {
      try {
        const res = await generateMut.mutateAsync({
          profile_data: {
            ...candidateProfile,
            social_profiles: socialLinks,
          },
          custom_details: updatedDetails,
          job_description: jobDescription,
          target_role: targetRole
        });
        setGeneratedCV(res);
        setEditableMarkdown(res.cv_markdown);
      } catch {
        const updatedMd = `${generatedCV.cv_markdown}\n- ${starBullet}`;
        try {
          const atsRes = await atsCheckMut.mutateAsync({
            cv_text: updatedMd,
            job_description: jobDescription
          });
          setGeneratedCV(prev => prev ? { ...prev, cv_markdown: updatedMd, ats_evaluation: atsRes } : null);
        } catch (err) {
          console.warn("Instant ATS re-check failed:", err);
        }
      }
    }
  };

  // Apply edits made directly in the Markdown tab on the right
  const handleApplyMarkdownEdits = async () => {
    if (!editableMarkdown.trim()) return;
    try {
      const atsRes = await atsCheckMut.mutateAsync({
        cv_text: editableMarkdown,
        job_description: jobDescription
      });
      setGeneratedCV(prev => prev ? { ...prev, cv_markdown: editableMarkdown, ats_evaluation: atsRes } : null);
      setParseStatusMsg("✓ Markdown edits applied & ATS re-evaluated!");
      setTimeout(() => setParseStatusMsg(null), 3000);
    } catch (err: any) {
      console.warn("Markdown apply failed:", err);
    }
  };

  const handleCopyMarkdown = () => {
    const textToCopy = generatedCV ? generatedCV.cv_markdown : resumeRawMarkdown;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    const sourceCV = generatedCV?.structured_cv || {
      header: {
        name: candidateProfile.name,
        role: targetRole,
        email: candidateProfile.email,
        phone: candidateProfile.phone,
        location: candidateProfile.location,
        social_links: socialLinks,
        links: Object.values(socialLinks).filter(Boolean)
      },
      summary: candidateProfile.summary,
      skills: {
        core: candidateProfile.skills.slice(0, 10),
        tools: candidateProfile.skills.slice(10)
      },
      experience: candidateProfile.experience,
      education: candidateProfile.education,
      certifications: [
        {
          name: `SkillMatch Verified Attestation (${candidateProfile.verification_badge})`,
          issuer: "SkillMatch DNA Engine",
          score: `${candidateProfile.ccrs_score}% CCRS`,
          credential_url: socialLinks.public_proof_url
        }
      ]
    };

    setIsExportingPdf(true);
    try {
      const blob = await exportPdfMut.mutateAsync({
        structured_cv: sourceCV,
        cv_markdown: generatedCV?.cv_markdown || resumeRawMarkdown,
        candidate_name: candidateProfile.name,
        target_role: targetRole,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = candidateProfile.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Tailored_CV';
      a.download = `${safeName}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Direct PDF export fallback to isolated print:", err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const atsEval: ATSEvaluation | undefined = generatedCV?.ats_evaluation;
  const activeHeader = generatedCV?.structured_cv?.header || {
    name: candidateProfile.name,
    role: targetRole,
    email: candidateProfile.email,
    phone: candidateProfile.phone,
    location: candidateProfile.location,
    social_links: socialLinks,
    links: Object.values(socialLinks).filter(Boolean)
  };

  const activeExp = generatedCV?.structured_cv?.experience || candidateProfile.experience;
  const activeEdu = generatedCV?.structured_cv?.education || candidateProfile.education;
  const activeSummary = generatedCV?.structured_cv?.summary || candidateProfile.summary;
  const activeSkillsCore = generatedCV?.structured_cv?.skills?.core || candidateProfile.skills.slice(0, 10);
  const activeSkillsTools = generatedCV?.structured_cv?.skills?.tools || candidateProfile.skills.slice(10);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ── Top Header Banner ── */}
      <div className="rounded-2xl theme-card p-6 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)]">
                <Sparkles size={11} className="text-[var(--accent-primary)] animate-pulse" /> ATS Optimization Active
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck size={11} /> ATS Target: 90%+
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
                <CheckCircle2 size={11} /> {candidateProfile.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--fg-color)]">
              JD-Tailored CV Builder &amp; ATS Checker
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--fg-muted)] max-w-2xl leading-relaxed">
              Synthesizes high-impact executive CVs aligned with your target Job Description. Ingest your existing resume, modify any section, embed verified social proof links, and achieve instant ATS compatibility.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generateMut.isPending}
            className="theme-primary-btn px-6 py-3 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[var(--accent-glow)] cursor-pointer disabled:opacity-50"
          >
            {generateMut.isPending ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                Synthesizing Tailored CV...
              </>
            ) : (
              <>
                <Zap size={15} />
                Generate Tailored CV &amp; Check ATS
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Status / Parse Alerts ── */}
      {parseStatusMsg && (
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between gap-3 shadow-sm font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-cyan-400 shrink-0" />
            <span>{parseStatusMsg}</span>
          </div>
          <button onClick={() => setParseStatusMsg(null)} className="text-cyan-400/60 hover:text-cyan-400 cursor-pointer">✕</button>
        </div>
      )}

      {/* ── Error Banner ── */}
      {genError && (
        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400 shrink-0" />
            <span className="font-mono">{genError}</span>
          </div>
          <button onClick={() => setGenError(null)} className="text-amber-300/60 hover:text-amber-300 font-mono text-xs cursor-pointer">✕</button>
        </div>
      )}

      {/* ── 2-Column Grid: Inputs & Modification Space (Left) vs ATS Gauge & Preview (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT COLUMN: Configuration, Socials & Resume Workspace (5 Cols) ── */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Target Role & Preset Selector */}
          <div className="rounded-2xl theme-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent-primary)] flex items-center gap-1.5">
                <Target size={13} /> 1. Target Role &amp; JD Preset
              </label>
              <span className="text-[10px] font-mono text-[var(--fg-subtle)]">Auto-fill JD</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PRESET_JDS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleApplyPreset(p)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                    targetRole === p.role
                      ? 'border-[var(--accent-primary)] bg-[var(--pill-bg)] text-[var(--accent-primary)] font-semibold'
                      : 'border-[var(--glass-border-subtle)] bg-[var(--glass-bg)] text-[var(--fg-muted)] hover:border-[var(--glass-border)]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-[11px] font-medium text-[var(--fg-muted)] mb-1 block">
                Target Role Title:
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                placeholder="e.g. Senior Full-Stack Cloud Architect"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[var(--fg-muted)] mb-1 block">
                Target Job Description (JD):
              </label>
              <textarea
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs font-mono text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)] leading-relaxed"
                placeholder="Paste the target job description here..."
              />
            </div>
          </div>

          {/* 2. DEDICATED SOCIAL & ONLINE PROOF LINKS SECTION */}
          <div className="rounded-2xl theme-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent-primary)] flex items-center gap-1.5">
                <Globe size={13} /> 2. Social &amp; Online Proof Links
              </label>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Clickable in PDF</span>
            </div>
            <p className="text-[11px] text-[var(--fg-subtle)]">
              Embedded directly into your resume header and single-column PDF export as verified hyperlinks.
            </p>

            <div className="space-y-2.5 text-xs">
              {/* GitHub */}
              <div className="flex items-center gap-2">
                <span className="w-6 flex items-center justify-center text-[var(--fg-subtle)] shrink-0">
                  <Github size={15} />
                </span>
                <input
                  type="text"
                  value={socialLinks.github}
                  onChange={(e) => setSocialLinks(s => ({ ...s, github: e.target.value }))}
                  placeholder="https://github.com/username"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] font-mono focus:outline-none focus:border-[var(--accent-primary)]"
                />
                {socialLinks.github && (
                  <a
                    href={socialLinks.github.startsWith('http') ? socialLinks.github : `https://${socialLinks.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 rounded-lg bg-[var(--glass-bg)] hover:bg-[var(--pill-bg)] text-[var(--fg-muted)] hover:text-[var(--accent-primary)] border border-[var(--glass-border-subtle)] text-[10px] font-mono flex items-center gap-0.5 shrink-0"
                    title="Open link"
                  >
                    Open <ArrowUpRight size={10} />
                  </a>
                )}
              </div>

              {/* LinkedIn */}
              <div className="flex items-center gap-2">
                <span className="w-6 flex items-center justify-center text-sky-500 shrink-0">
                  <Linkedin size={15} />
                </span>
                <input
                  type="text"
                  value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks(s => ({ ...s, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/username"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] font-mono focus:outline-none focus:border-[var(--accent-primary)]"
                />
                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin.startsWith('http') ? socialLinks.linkedin : `https://${socialLinks.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 rounded-lg bg-[var(--glass-bg)] hover:bg-[var(--pill-bg)] text-[var(--fg-muted)] hover:text-[var(--accent-primary)] border border-[var(--glass-border-subtle)] text-[10px] font-mono flex items-center gap-0.5 shrink-0"
                    title="Open link"
                  >
                    Open <ArrowUpRight size={10} />
                  </a>
                )}
              </div>

              {/* Portfolio */}
              <div className="flex items-center gap-2">
                <span className="w-6 flex items-center justify-center text-emerald-500 shrink-0">
                  <Globe size={15} />
                </span>
                <input
                  type="text"
                  value={socialLinks.portfolio}
                  onChange={(e) => setSocialLinks(s => ({ ...s, portfolio: e.target.value }))}
                  placeholder="https://portfolio.dev"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] font-mono focus:outline-none focus:border-[var(--accent-primary)]"
                />
                {socialLinks.portfolio && (
                  <a
                    href={socialLinks.portfolio.startsWith('http') ? socialLinks.portfolio : `https://${socialLinks.portfolio}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 rounded-lg bg-[var(--glass-bg)] hover:bg-[var(--pill-bg)] text-[var(--fg-muted)] hover:text-[var(--accent-primary)] border border-[var(--glass-border-subtle)] text-[10px] font-mono flex items-center gap-0.5 shrink-0"
                    title="Open link"
                  >
                    Open <ArrowUpRight size={10} />
                  </a>
                )}
              </div>

              {/* Verified Public Proof URL */}
              <div className="flex items-center gap-2">
                <span className="w-6 flex items-center justify-center text-teal-500 shrink-0">
                  <ShieldCheck size={15} />
                </span>
                <input
                  type="text"
                  value={socialLinks.public_proof_url}
                  onChange={(e) => setSocialLinks(s => ({ ...s, public_proof_url: e.target.value }))}
                  placeholder="skillmatch.id/verify/username"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] font-mono focus:outline-none focus:border-[var(--accent-primary)]"
                />
                <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold shrink-0">
                  VERIFIED
                </span>
              </div>
            </div>
          </div>

          {/* 3. RESUME WORKSPACE & LIVE MODIFICATION STUDIO */}
          <div className="rounded-2xl theme-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent-primary)] flex items-center gap-1.5">
                <FileText size={13} /> 3. Resume Workspace &amp; Live Modification Space
              </label>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-0.5 rounded-lg border border-[var(--glass-border-subtle)]">
                <button
                  type="button"
                  onClick={() => setResumeMode('form')}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${
                    resumeMode === 'form' ? 'bg-[var(--pill-bg)] text-[var(--accent-primary)] font-bold shadow-sm' : 'text-[var(--fg-muted)]'
                  }`}
                >
                  Structured Form
                </button>
                <button
                  type="button"
                  onClick={() => setResumeMode('markdown')}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${
                    resumeMode === 'markdown' ? 'bg-[var(--pill-bg)] text-[var(--accent-primary)] font-bold shadow-sm' : 'text-[var(--fg-muted)]'
                  }`}
                >
                  Raw Markdown
                </button>
              </div>
            </div>

            {/* Ingestion Dropzone & Actions Bar */}
            <div className="p-3.5 rounded-xl bg-[var(--glass-bg)] border border-dashed border-[var(--glass-border)] space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileUp size={16} className="text-[var(--accent-primary)]" />
                  <span className="text-xs font-semibold text-[var(--fg-color)]">Add Your Existing Resume:</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.txt,.md"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isParsingFile}
                    className="px-3 py-1 rounded-lg bg-[var(--pill-bg)] hover:bg-[var(--glass-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)] text-xs font-mono flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-sm"
                  >
                    {isParsingFile ? <RefreshCw size={11} className="animate-spin" /> : <Upload size={11} />}
                    Upload Resume File
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-[var(--fg-subtle)]">
                Supports PDF, DOCX, TXT, or MD. Instantly extracts personal details, skills, experience bullets, and education into this space for in-place modification.
              </p>
            </div>

            {/* FORM MODE: VISUAL STRUCTURED RESUME MODIFIER */}
            {resumeMode === 'form' && (
              <div className="space-y-4 pt-1">
                {/* Personal & Contact Details */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--fg-muted)] block">
                    Contact &amp; Personal Info
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-[var(--fg-subtle)] block mb-0.5">Full Name</label>
                      <input
                        type="text"
                        value={candidateProfile.name}
                        onChange={(e) => setCandidateProfile(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--fg-subtle)] block mb-0.5">Professional Role</label>
                      <input
                        type="text"
                        value={candidateProfile.role}
                        onChange={(e) => setCandidateProfile(p => ({ ...p, role: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--fg-subtle)] block mb-0.5">Email</label>
                      <input
                        type="email"
                        value={candidateProfile.email}
                        onChange={(e) => setCandidateProfile(p => ({ ...p, email: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--fg-subtle)] block mb-0.5">Phone</label>
                      <input
                        type="text"
                        value={candidateProfile.phone}
                        onChange={(e) => setCandidateProfile(p => ({ ...p, phone: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--fg-subtle)] block mb-0.5">Location</label>
                    <input
                      type="text"
                      value={candidateProfile.location}
                      onChange={(e) => setCandidateProfile(p => ({ ...p, location: e.target.value }))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                  </div>
                </div>

                {/* Professional Summary Modifier */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                      Professional Summary
                    </span>
                    <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                      {candidateProfile.summary.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={candidateProfile.summary}
                    onChange={(e) => setCandidateProfile(p => ({ ...p, summary: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)] leading-relaxed"
                    placeholder="Brief 2-3 sentence executive summary..."
                  />
                </div>

                {/* Technical Skills Modifier */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                      Technical Skills ({candidateProfile.skills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)]">
                    {candidateProfile.skills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--glass-border-subtle)]"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s)}
                          className="text-[var(--fg-subtle)] hover:text-red-400 cursor-pointer ml-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      placeholder="Add skill (press Enter)..."
                      className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)] flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3 py-1.5 rounded-lg bg-[var(--glass-bg)] hover:bg-[var(--pill-bg)] text-[var(--accent-primary)] border border-[var(--glass-border-subtle)] text-xs font-mono cursor-pointer"
                    >
                      <Plus size={12} className="inline mr-1" /> Add
                    </button>
                  </div>
                </div>

                {/* Work Experience Builder */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                      Work Experience Roles ({candidateProfile.experience.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="text-[10px] font-mono text-[var(--accent-primary)] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus size={11} /> Add Role
                    </button>
                  </div>

                  <div className="space-y-3">
                    {candidateProfile.experience.map((exp, expIdx) => (
                      <div
                        key={expIdx}
                        className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => handleUpdateExperience(expIdx, 'title', e.target.value)}
                            placeholder="Job Title"
                            className="font-bold text-xs bg-transparent border-b border-[var(--glass-border-subtle)] focus:border-[var(--accent-primary)] text-[var(--fg-color)] outline-none flex-1 pb-0.5"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteExperience(expIdx)}
                            className="text-[var(--fg-subtle)] hover:text-red-400 cursor-pointer p-1"
                            title="Delete role"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleUpdateExperience(expIdx, 'company', e.target.value)}
                            placeholder="Company Name"
                            className="px-2 py-1 rounded bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-[11px] text-[var(--fg-color)] outline-none focus:border-[var(--accent-primary)]"
                          />
                          <input
                            type="text"
                            value={exp.duration}
                            onChange={(e) => handleUpdateExperience(expIdx, 'duration', e.target.value)}
                            placeholder="2022 - Present"
                            className="px-2 py-1 rounded bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-[11px] text-[var(--fg-color)] font-mono outline-none focus:border-[var(--accent-primary)]"
                          />
                        </div>

                        {/* Bullets for this role */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-mono text-[var(--fg-subtle)] block">
                            Key Achievements (STAR Bullets):
                          </span>
                          {exp.bullets.map((b, bIdx) => (
                            <div key={bIdx} className="flex items-start gap-1.5">
                              <span className="text-slate-400 text-xs mt-1">•</span>
                              <textarea
                                rows={2}
                                value={b}
                                onChange={(e) => handleUpdateBullet(expIdx, bIdx, e.target.value)}
                                className="flex-1 px-2 py-1 rounded bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] leading-snug outline-none focus:border-[var(--accent-primary)]"
                              />
                              <button
                                type="button"
                                onClick={() => handleDeleteBullet(expIdx, bIdx)}
                                className="text-[var(--fg-subtle)] hover:text-red-400 cursor-pointer p-0.5 mt-1"
                                title="Remove bullet"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleAddBullet(expIdx)}
                            className="text-[10px] font-mono text-[var(--accent-primary)] hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                          >
                            <Plus size={10} /> Add Bullet
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education & Credentials */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                      Education &amp; Credentials ({candidateProfile.education.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddEducation}
                      className="text-[10px] font-mono text-[var(--accent-primary)] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus size={11} /> Add Degree
                    </button>
                  </div>

                  <div className="space-y-2">
                    {candidateProfile.education.map((edu, eduIdx) => (
                      <div
                        key={eduIdx}
                        className="p-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleUpdateEducation(eduIdx, 'degree', e.target.value)}
                            placeholder="Degree"
                            className="font-semibold text-xs bg-transparent border-b border-[var(--glass-border-subtle)] text-[var(--fg-color)] outline-none flex-1 pb-0.5"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteEducation(eduIdx)}
                            className="text-[var(--fg-subtle)] hover:text-red-400 cursor-pointer p-0.5"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => handleUpdateEducation(eduIdx, 'institution', e.target.value)}
                            placeholder="Institution"
                            className="px-2 py-1 rounded bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-[11px] text-[var(--fg-color)] outline-none"
                          />
                          <input
                            type="text"
                            value={edu.year}
                            onChange={(e) => handleUpdateEducation(eduIdx, 'year', e.target.value)}
                            placeholder="Year"
                            className="px-2 py-1 rounded bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-[11px] text-[var(--fg-color)] font-mono outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MARKDOWN MODE: DIRECT FULL-TEXT RESUME EDITOR */}
            {resumeMode === 'markdown' && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                    Direct Markdown Resume Editor:
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyParsedText}
                    disabled={isParsingFile}
                    className="px-2.5 py-1 rounded-lg bg-[var(--pill-bg)] hover:bg-[var(--glass-bg)] text-[var(--accent-primary)] border border-[var(--glass-border-subtle)] text-[10px] font-mono font-bold cursor-pointer disabled:opacity-50"
                  >
                    Sync to Form &amp; Preview
                  </button>
                </div>
                <textarea
                  rows={14}
                  value={resumeRawMarkdown}
                  onChange={(e) => setResumeRawMarkdown(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs font-mono text-[var(--fg-color)] leading-relaxed focus:outline-none focus:border-[var(--accent-primary)]"
                  placeholder="# Full Name&#10;Role | Location&#10;&#10;## Professional Summary..."
                />
              </div>
            )}
          </div>

          {/* 4. Role-Specific Custom Highlights Input Area */}
          <div className="rounded-2xl theme-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent-primary)] flex items-center gap-1.5">
                <Briefcase size={13} /> 4. Role-Specific Custom Highlights
              </label>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">STAR Format</span>
            </div>
            <p className="text-[11px] text-[var(--fg-subtle)]">
              Supplementary achievements to automatically weave into the top experience section during JD tailoring:
            </p>
            <textarea
              rows={4}
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] focus:outline-none focus:border-[var(--accent-primary)] leading-relaxed font-mono"
              placeholder="e.g. Engineered active noise cancellation in WebAudio DSP reducing background clatter by 18.4 dB..."
            />

            {/* Quick STAR Suggestion Chips */}
            <div className="pt-1">
              <span className="text-[10px] font-mono text-[var(--fg-subtle)] block mb-1.5">Quick STAR Suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                {STAR_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.label}
                    onClick={() => handleAddSuggestion(sug.text)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-[var(--glass-bg)] hover:bg-[var(--pill-bg)] text-[var(--fg-muted)] hover:text-[var(--accent-primary)] border border-[var(--glass-border-subtle)] transition-colors cursor-pointer"
                  >
                    {sug.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: ATS Checker HUD & CV Preview (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-5">
          {/* ATS Compatibility HUD Card */}
          {atsEval && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl theme-card p-5 border-2 border-[var(--glass-border)] space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Radial score gauge indicator */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex flex-col items-center justify-center text-white shadow-md shadow-[var(--accent-glow)]">
                    <span className="text-xl font-black leading-none">{atsEval.ats_score}%</span>
                    <span className="text-[8px] font-mono uppercase tracking-widest mt-0.5">ATS Score</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[var(--fg-color)]">
                        ATS Compatibility: {atsEval.score_grade}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        VERIFIED
                      </span>
                    </div>
                    <p className="text-xs text-[var(--fg-muted)]">
                      Scored against {atsEval.matched_keywords.length + atsEval.missing_keywords.length} technical JD keywords
                    </p>
                  </div>
                </div>

                {/* Dimension scoring pills */}
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <div className="px-2.5 py-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)]">
                    Keywords: <span className="font-bold text-[var(--accent-primary)]">{atsEval.dimension_scores.keyword_matching}/40</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)]">
                    Sections: <span className="font-bold text-emerald-600 dark:text-emerald-400">{atsEval.dimension_scores.section_compliance}/20</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-[var(--fg-color)]">
                    Metrics: <span className="font-bold text-cyan-600 dark:text-cyan-400">{atsEval.dimension_scores.action_verbs_metrics}/20</span>
                  </div>
                </div>
              </div>

              {/* Matched Keywords vs Missing Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                    <CheckCircle2 size={13} /> Matched ATS Keywords ({atsEval.matched_keywords.length})
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                    {atsEval.matched_keywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                      >
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-700 dark:text-amber-400 mb-2">
                    <AlertTriangle size={13} /> Recommended Missing Terms ({atsEval.missing_keywords.length})
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                    {atsEval.missing_keywords.length > 0 ? (
                      atsEval.missing_keywords.map((kw) => (
                        <button
                          key={kw}
                          onClick={() => handleAddMissingKeyword(kw)}
                          title="Click to integrate STAR achievement with this keyword"
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer flex items-center gap-1 transition-all"
                        >
                          <Plus size={9} /> {kw}
                        </button>
                      ))
                    ) : (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                        100% JD Keyword Alignment Achieved!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CV Workspace & Actions Bar */}
          <div className="rounded-2xl theme-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between border-b border-[var(--glass-border-subtle)] p-3 px-5 gap-2 bg-[var(--glass-bg)]">
              {/* Tab selector */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveViewTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeViewTab === 'preview'
                      ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                      : 'text-[var(--fg-muted)] hover:text-[var(--fg-color)]'
                  }`}
                >
                  <FileText size={13} className="inline mr-1.5" />
                  Executive Preview
                </button>
                <button
                  onClick={() => setActiveViewTab('markdown')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeViewTab === 'markdown'
                      ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                      : 'text-[var(--fg-muted)] hover:text-[var(--fg-color)]'
                  }`}
                >
                  <Code2 size={13} className="inline mr-1.5" />
                  Markdown Code
                </button>
                <button
                  onClick={() => setActiveViewTab('ats_report')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeViewTab === 'ats_report'
                      ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                      : 'text-[var(--fg-muted)] hover:text-[var(--fg-color)]'
                  }`}
                >
                  <ShieldCheck size={13} className="inline mr-1.5" />
                  ATS Audit Report
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyMarkdown}
                  className="px-3 py-1.5 rounded-lg border border-[var(--glass-border-subtle)] bg-[var(--bg-subtle)] text-[var(--fg-color)] hover:border-[var(--glass-border)] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={isExportingPdf}
                  title="Directly download clean ATS-compliant PDF document"
                  className="theme-primary-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-40"
                >
                  {isExportingPdf ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download size={13} />
                      Export PDF
                    </>
                  )}
                </button>
                <button
                  onClick={handlePrint}
                  title="Print or Save via Browser"
                  className="px-3 py-1.5 rounded-lg border border-[var(--glass-border-subtle)] bg-[var(--bg-subtle)] text-[var(--fg-color)] hover:border-[var(--glass-border)] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer size={13} />
                  Print
                </button>
              </div>
            </div>

            {/* Content Container */}
            <div className="p-6 min-h-[480px]">
              {/* Executive Preview (Always rendered with printable ID; visible in preview tab or isolated during print) */}
              <div
                id="cv-printable-document"
                className={`space-y-6 max-w-3xl mx-auto bg-white text-slate-900 p-8 rounded-xl shadow-md font-sans print:shadow-none print:p-0 ${
                  activeViewTab === 'preview' ? 'block' : 'hidden print:block'
                }`}
              >
                {/* Executive Header with Verified Identity & Clickable Social Links */}
                <div className="border-b-2 border-emerald-600 pb-4 text-center cv-entry-block">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
                    {activeHeader.name}
                  </h2>
                  <div className="text-xs sm:text-sm font-semibold text-emerald-700 mt-1">
                    {activeHeader.role} • {activeHeader.location}
                  </div>

                  {/* Contact items */}
                  <div className="text-xs text-slate-600 mt-1.5 flex flex-wrap items-center justify-center gap-2">
                    <span>{activeHeader.email}</span>
                    <span>•</span>
                    <span>{activeHeader.phone}</span>
                  </div>

                  {/* Clickable Social Links & Verification Proof */}
                  <div className="text-xs mt-2 flex flex-wrap items-center justify-center gap-3 pt-1 border-t border-slate-100">
                    {socialLinks.github && (
                      <a
                        href={socialLinks.github.startsWith('http') ? socialLinks.github : `https://${socialLinks.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 font-medium hover:underline"
                      >
                        <Github size={12} />
                        <span>{socialLinks.github.replace('https://', '').replace('http://', '')}</span>
                      </a>
                    )}
                    {socialLinks.linkedin && (
                      <a
                        href={socialLinks.linkedin.startsWith('http') ? socialLinks.linkedin : `https://${socialLinks.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 font-medium hover:underline"
                      >
                        <Linkedin size={12} />
                        <span>{socialLinks.linkedin.replace('https://', '').replace('http://', '')}</span>
                      </a>
                    )}
                    {socialLinks.portfolio && (
                      <a
                        href={socialLinks.portfolio.startsWith('http') ? socialLinks.portfolio : `https://${socialLinks.portfolio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 font-medium hover:underline"
                      >
                        <Globe size={12} />
                        <span>{socialLinks.portfolio.replace('https://', '').replace('http://', '')}</span>
                      </a>
                    )}
                    {socialLinks.public_proof_url && (
                      <a
                        href={socialLinks.public_proof_url.startsWith('http') ? socialLinks.public_proof_url : `https://${socialLinks.public_proof_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:underline"
                      >
                        <ShieldCheck size={12} className="text-emerald-600" />
                        <span>Verified SkillMatch DNA</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="cv-entry-block">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                    Professional Summary
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    {activeSummary}
                  </p>
                </div>

                {/* Technical Competencies */}
                <div className="cv-entry-block">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                    Technical Competencies
                  </h3>
                  <div className="text-xs text-slate-800 space-y-1.5">
                    <div>
                      <span className="font-bold text-slate-950">Core Technical Skills:</span>{" "}
                      <span className="text-slate-700">{activeSkillsCore.join(", ")}</span>
                    </div>
                    {activeSkillsTools.length > 0 && (
                      <div>
                        <span className="font-bold text-slate-950">Tools, Cloud &amp; DevOps:</span>{" "}
                        <span className="text-slate-700">{activeSkillsTools.join(", ")}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-slate-950">Architectural Methodologies:</span>{" "}
                      <span className="text-slate-700">Microservices, Event-Driven Systems, REST/gRPC, Distributed Caching, CI/CD, STAR Methodology</span>
                    </div>
                  </div>
                </div>

                {/* Professional Experience */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
                    Professional Experience
                  </h3>
                  <div className="space-y-4">
                    {activeExp.map((exp, idx) => (
                      <div key={idx} className="space-y-1 cv-entry-block">
                        <div className="flex justify-between items-baseline text-xs">
                          <span className="font-bold text-slate-950">
                            {exp.title} — <span className="font-semibold text-slate-700">{exp.company}</span>
                          </span>
                          <span className="font-mono text-[11px] text-slate-500 font-medium">{exp.duration}</span>
                        </div>
                        <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-slate-700 leading-relaxed">
                          {exp.bullets.map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="cv-entry-block">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                    Education &amp; Academic Credentials
                  </h3>
                  <div className="space-y-2">
                    {activeEdu.map((edu, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex justify-between font-semibold text-slate-900">
                          <span>{edu.degree} — {edu.institution}</span>
                          <span className="font-mono text-[11px] text-slate-500">{edu.year}</span>
                        </div>
                        {edu.details && (
                          <p className="text-[11px] text-slate-600 mt-0.5">{edu.details}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verified System Attestations */}
                <div className="cv-entry-block border-t border-slate-200 pt-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2 flex items-center justify-between">
                    <span>Verified System Attestations &amp; Credentials</span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold lowercase">skillmatch-verified</span>
                  </h3>
                  <div className="text-xs space-y-1.5 text-slate-700">
                    <div className="flex items-center justify-between text-[11px]">
                      <span>
                        • <strong>SkillMatch Verified Candidate ({candidateProfile.verification_badge})</strong> ({candidateProfile.ccrs_score}% CCRS Composite) — SkillMatch DNA Engine
                      </span>
                      {socialLinks.public_proof_url && (
                        <a
                          href={socialLinks.public_proof_url.startsWith('http') ? socialLinks.public_proof_url : `https://${socialLinks.public_proof_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-700 hover:underline font-mono"
                        >
                          [Verify Proof]
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab: Editable Markdown Code */}
              {activeViewTab === 'markdown' && (
                <div className="space-y-3 print:hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--fg-muted)]">
                      Edit Markdown directly to fine-tune copy or inject custom sections:
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyMarkdownEdits}
                      className="px-3 py-1 rounded-lg bg-[var(--pill-bg)] hover:bg-[var(--glass-bg)] text-[var(--accent-primary)] border border-[var(--glass-border-subtle)] text-xs font-mono font-bold cursor-pointer"
                    >
                      Apply Markdown Edits &amp; Check ATS
                    </button>
                  </div>
                  <textarea
                    rows={22}
                    value={editableMarkdown || resumeRawMarkdown}
                    onChange={(e) => setEditableMarkdown(e.target.value)}
                    className="w-full p-4 rounded-xl bg-[var(--glass-bg)] text-[var(--fg-color)] font-mono text-xs leading-relaxed border border-[var(--glass-border-subtle)] focus:outline-none"
                  />
                </div>
              )}

              {/* Tab: ATS Audit Report */}
              {activeViewTab === 'ats_report' && (
                <div className="space-y-4 print:hidden">
                  {atsEval ? (
                    <>
                      <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-3">
                        <h4 className="text-sm font-bold text-[var(--fg-color)] flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          ATS Keyword &amp; Formatting Compliance Checklist
                        </h4>
                        <div className="space-y-2 text-xs">
                          {atsEval.formatting_alerts.length === 0 ? (
                            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                              ✓ Perfect ATS formatting: Standard headings detected, clean single-column structure, verified contact links, and no parsing obstructions.
                            </div>
                          ) : (
                            atsEval.formatting_alerts.map((alert, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-amber-700 dark:text-amber-400">
                                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                <span>{alert}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-3">
                        <h4 className="text-sm font-bold text-[var(--fg-color)] flex items-center gap-2">
                          <Sparkles size={16} className="text-[var(--accent-primary)]" />
                          Recommended Optimization Strategy
                        </h4>
                        <ul className="space-y-2 text-xs text-[var(--fg-muted)] list-disc pl-5">
                          {atsEval.recommendations.map((rec, idx) => (
                            <li key={idx} className="leading-relaxed">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center text-xs text-[var(--fg-muted)]">
                      Click &quot;Generate Tailored CV &amp; Check ATS&quot; to produce an audit report.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CVBuilder;
