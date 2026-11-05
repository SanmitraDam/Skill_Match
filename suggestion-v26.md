# SkillMatch DNA — Professional Social Readiness Network, PDF Sectional Flashcards, ANC Recording Demo & Dual-Theme Architecture (`suggestion-v26.md`)

**Document Version:** 27.0.0-POST-SIGNIN-LINKEDIN-NETWORK-ANC-DEMO-DUAL-THEME  
**Author:** Chief AI Architect & Lead Systems Engineer  
**Target Platform:** SkillMatch DNA Autonomous AI Career Readiness & Social Readiness Network  
**Grounding Baseline:** `prd-v2.md`, `prd.md`, `suggestion.md`, `skillmatch_prd_ui_agent_spec.pdf`

---

## Executive Summary

**SkillMatch DNA Version 27.0** extends the platform from an autonomous career readiness engine into a **Verified Professional Social Readiness Network**. Grounded in mentor feedback and empirical R&D specifications, this document defines the full architectural blueprint for:

1. **Post-Sign-In LinkedIn-Style Readiness Network**: Replacing unverified resumes and click-endorsements with verified Composite Career Readiness Scores (CCRS), WebAssembly code benchmarks, and zero-knowledge proctoring proofs.
2. **Post-Interview Audio Recording & Active Noise Cancellation (ANC) Demo Studio**: Providing a playable audio comparison player (Raw vs. Filtered ANC Audio) along with a real-time WebAudio DSP noise-dampening status badge.
3. **Section-Wise PDF Flashcard & Ebbinghaus Memory Retention Engine**: Parsing multi-page technical PDFs into heading sections (H1/H2/H3) and generating memory decay cards based on $R = e^{-t/S}$.
4. **Smart Surrender & Auto-Advancement**: Detecting surrender intent ("I don't know", "idk", "pass") in text/speech and auto-advancing to the next question with zero delay.
5. **JD-Tailored CV Builder & Integrated ATS Checker**: Generating customized CVs from profile data + extra achievements box, accompanied by a 0–100% ATS score.
6. **Universal Skip-TOC Navigation Module**: Keyboard shortcuts and section jump headers across all views.
7. **Dribbble/Awwwards Dual-Theme UI/UX System**: Instant toggle between Warm Orange Gold Glass (Light) and Cyber Obsidian Emerald (Dark) with Framer Motion spring physics.

---

## 1. Post-Sign-In LinkedIn-Style Professional Social Readiness Network

### 1.1 Empirical Readiness & Social Feed (`ReadinessFeed.tsx`)
Traditional social networks rely on self-reported resume claims. SkillMatch DNA transforms candidate activity into an empirical, system-verified feed:
* **Verified Milestone Posts**: Automatically published when a candidate clears a skill gap, passes a CAT quiz with >90% accuracy, or merges an AST-optimized code benchmark.
* **Peer Verification & Skill Duels**: Peers inspect verified code solutions or challenge each other to 5-minute flashcard duels.
* **Trending Technical Skill Topics**: Tracks real-time industry demand topics (`#WebAssembly`, `#vLLM`, `#pgvector`, `#PyTorch`).

```typescript
// Readiness Feed Item Interface
export interface ReadinessFeedPost {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateAvatarUrl: string;
  verificationBadge: "Verified Candidate" | "Top 5% CCRS" | "System Architect";
  ccrsScore: number;
  postType: "SKILL_GAP_CLEARED" | "QUIZ_MASTERY" | "MOCK_INTERVIEW_PASSED" | "PROJECT_BENCHMARK";
  title: string;
  skillTags: string[];
  proofHash?: string;
  likesCount: number;
  peerVerificationsCount: number;
  createdAt: string;
}
```

### 1.2 Candidate Identity & "Face" Hub (`CandidateProfile.tsx`)
* **Liveness Verification Badge**: Displays an active status pill (`[ Verified Candidate ]`) backed by MediaPipe liveness detection.
* **Interactive CCRS Radar Chart**: Displays $S_{\text{match}}$ (Resume Match), $A_{\text{quiz}}$ (Adaptive Test), and $I_{\text{voice}}$ (Voice AI).
* **15-Second Voice Snippet Player**: Showcases candidate speech clarity with the active noise cancellation (ANC) status badge.

### 1.3 "Who Viewed Your Profile" & Cumulative Reach Analytics (`ProfileAnalytics.tsx`)
* **Recruiter Viewer Log**: Displays company names, recruiter titles, and timestamps when technical recruiters inspect the profile.
* **Cumulative Reach Accuracy Index**:
  $$\text{Reach Accuracy Score} = \left(\frac{\sum (\text{Recruiter Search Vector} \cdot \text{Candidate CCRS Vector})}{\text{Total Profile Impressions}}\right) \times 100$$

### 1.4 Database Schema Blueprint (`models.py`)

```python
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from datetime import datetime
from database import Base

class ProfileView(Base):
    __tablename__ = "profile_views"
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    viewer_name = Column(String(100), nullable=False)
    viewer_company = Column(String(100), nullable=False)
    viewer_role = Column(String(100), nullable=False)
    is_recruiter = Column(Boolean, default=True)
    viewed_at = Column(DateTime, default=datetime.utcnow)

class ReadinessPost(Base):
    __tablename__ = "readiness_posts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    skill_tags = Column(String(255), nullable=False)
    proof_hash = Column(String(128), nullable=True)
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

## 2. Voice AI Interview Studio & Active Noise Cancellation (ANC) Demo

### 2.1 Post-Interview Playable Audio Player (`AudioPlayerTile.tsx`)
Addresses mentor feedback by providing definitive visual and auditory proof that ANC is working:
* **Dual Audio Stream Capture**: Records both raw microphone input (with background noise/clatter) and WebAudio DSP-filtered speech.
* **Playable Audio Comparison Toggle**: Includes an interactive player tile allowing candidates and evaluators to switch between `Raw Audio` and `Filtered ANC Audio` to hear noise suppression in action.
* **Real-Time ANC Visualizer**: Live green status pill (`[ ANC Active • Background Noise Dampened ]`) with decibel reduction wave during interviews.

### 2.2 Smart Surrender & Auto-Advancement (`SurrenderHandler.ts`)
* **NLP Intent Classifier**: Listens for surrender phrases ("I don't know", "idk", "skip", "pass", "no idea").
* **Zero-Delay Transition**: Automatically logs 0 score for the question and triggers `nextQuestion()` instantly without forcing idle waiting.

---

## 3. PDF Section-Wise Flashcard & Ebbinghaus Memory Retention Engine

### 3.1 Section-Wise PDF Parsing (`PDFFlashcardGenerator.ts`)
* **Structural Hierarchy Extraction**: Uses PyMuPDF (`fitz`) to detect document headings (H1/H2/H3) and partition multi-page textbooks into distinct topics.
* **QA Flashcard Generation**: Generates targeted flashcards per section.
* **Scrollable Section Container (`FlashcardScrollContainer.tsx`)**: Smooth vertical scrolling through sections and horizontal card swiping.

### 3.2 Ebbinghaus Memory Curve Decay Engine (`MemoryEngine.ts`)
Tracks memory retention $R$ over elapsed time $t$:
$$R = e^{-\frac{t}{S}}$$
Automatically queues review cards when retention drops below 70%.

---

## 4. JD-Tailored CV Builder & Integrated ATS Checker (`CVBuilder.tsx` / `ats_checker.py`)

* **Profile Auto-Fill + Custom Input Box**: Pulls profile data and provides a text area for additional role achievements.
* **JD Alignment Engine**: Formats bullet points with action verbs and embedded keywords extracted from target job descriptions.
* **ATS Compatibility Score (0–100%)**: Evaluates keyword density, standard headings, and formatting compliance with 1-click PDF/DOCX export.

---

## 5. Universal Skip-TOC Navigation Module (`SkipTOCNav.tsx`)

* **Universal TOC Header**: Quick jump tabs embedded at the top of every page view.
* **Keyboard Shortcuts**: `Alt + 1` (Overview), `Alt + 2` (Flashcards), `Alt + 3` (CV Builder), `Alt + 4` (Social Feed), `Alt + T` (Skip-TOC).

---

## 6. Premium Dribbble/Awwwards Dual-Theme System

* **Light Theme (Vibrant Warm Gold Glass)**:
  * Background: Pure Crisp White (`#FFFFFF` / `#FAFAFA`)
  * Primary Gradient: Vivid Orange to Sunburst Gold (`#FF6B00` $\rightarrow$ `#FFB800`)
  * Glass Surface: Frosted Warm Glass (`rgba(255, 255, 255, 0.8)`)
* **Dark Theme (Cyber Obsidian & Emerald)**:
  * Background: Deep Obsidian Void (`#030712` / `#0B0F19`)
  * Accents: Cyber Yellow (`#FACC15`) & Bioluminescent Emerald (`#10B981`)
  * Glass Surface: Obsidian Glass (`rgba(17, 24, 39, 0.75)`)
* **Framer Motion Micro-Interactions**: Spring physics (`stiffness: 300, damping: 30`), 3D tilt cards, and morphing sun/moon theme toggle button (`ThemeToggle.tsx`).
