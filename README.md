# 🧬 SkillMatch DNA — Unified Master Architecture Platform

## 🏛️ Technical Manifesto

SkillMatch DNA is an enterprise-grade AI ecosystem designed to bridge the gap between raw technical resumes and actual production readiness. Unlike traditional ATS systems that rely on keyword matching, SkillMatch DNA implements a **multi-modal verification pipeline** that combines Vector Similarity, Computerized Adaptive Testing (CAT), and Acoustic Prosody Analysis to determine a candidate's true "Technical DNA."

---

## 🚀 Core Architectural Pillars

### 1. Production Input DNA Matrix
- **Vector-Based Matching**: Utilizes `all-MiniLM-L6-v2` embeddings for semantic alignment between candidate resumes and job descriptions.
- **PII Anonymization**: Built-in guardrails to scrub personal identifiers, ensuring bias-free, meritocratic matching.
- **Skill Taxonomy**: Automatic categorization of skills into Hard Technical, Soft Skills, and Domain Tools.

### 2. Adaptive CAT Quiz Studio
- **IRT 2PL Model**: Implements Item Response Theory (2-Parameter Logistic model) to dynamically calibrate question difficulty based on latent ability ($\theta$).
- **Dynamic Difficulty Scaling**: Questions are selected in real-time to maintain a target probability of success, maximizing information gain per question.
- **Calibrated Scoring**: Final scores are weighted by peak difficulty reached and latent ability, providing a more accurate readiness metric than simple percentages.

### 3. Spatial Voice AI Interview Room
- **Acoustic Prosody Analysis**: Analyzes speech cadence (WPM), filler word density, and hesitation indices to evaluate communication clarity.
- **Speculative Decoding**: Employs a draft-model architecture (Llama-3.2-1B $\rightarrow$ Llama-3.3-70B) to achieve ultra-low Time-to-First-Token (TTFT < 35ms) for natural conversation.
- **Research-Grade Rubrics**: Evaluates answers against architectural ontologies, specifically detecting trade-off analysis and failure-mode resilience.

### 4. Memory Retention Studio
- **SM-2 Spaced Repetition**: Integration of the SuperMemo-2 algorithm to optimize long-term knowledge retention of identified skill gaps.
- **Ebbinghaus Decay Modeling**: Tracks memory decay curves to trigger proactive "injection" of review cards before knowledge is lost.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | FastAPI, SQLAlchemy, Pydantic | High-performance async API & Data Modeling |
| **AI/ML** | Llama-3 (Groq), Gemini, Faster-Whisper | LLM Reasoning, STT, and Semantic Analysis |
| **Frontend** | Next.js 15, React 19, Zustand | Modern, Type-safe UI Architecture |
| **3D/UX** | Three.js, R3F, Framer Motion | Immersive "Elite Morphism" Visuals |
| **Security** | Ed25519, ZK-Compliance | Cryptographic Signatures & Privacy-Preserving Proofs |

---

## 📈 Readiness Metric: The CCRS
The platform culminates in the **Composite Career Readiness Score (CCRS)**:
$$\text{CCRS} = (0.30 \times \text{Vector Match}) + (0.35 \times \text{CAT Quiz}) + (0.35 \times \text{Voice Interview})$$
A score $\ge 80\%$ triggers the issuance of a verifiable **OpenBadges 3.0** digital credential.

---

## 🏁 Getting Started

### Backend
```bash
cd app
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend/dna-web
npm install
npm run dev
```
>>>>>>> 6bd1974 (Initial commit: SkillMatch AI platform with dual-theme Next.js frontend, FastAPI backend, and execution scripts)
