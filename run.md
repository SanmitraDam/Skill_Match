# SkillMatch — Localhost Execution Guide (`run.md`)

This guide provides instructions to set up, configure, and run the SkillMatch platform locally on your machine.

---

## 1. System Architecture

| Component | Technology | Default Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Web UI** | Next.js 14, React 18, Three.js, Tailwind CSS | `http://localhost:3000` | 3D interactive career readiness UI, ATS parser, and coding studio |
| **AI Engine / Backend** | FastAPI, Uvicorn, SQLAlchemy, spaCy | `http://127.0.0.1:8000` | REST API, vector matching, prosody analytics, and scoring |
| **API Documentation** | Swagger UI / OpenAPI | `http://127.0.0.1:8000/docs` | Interactive API explorer & contract testing |
| **Streamlit Portal** *(Optional)* | Streamlit | `http://localhost:8501` | Alternative candidate & assessment interface |

---

## 2. Prerequisites

Ensure you have the following installed on your machine:

- **Python**: Version `3.10` or higher (`python --version`)
- **Node.js**: Version `18.x` or higher (`node --version`)
- **npm**: Version `9.x` or higher (`npm --version`)
- **Git** *(Optional, for repository management)*

---

## 3. Quick Start (Single Command)

If you already have your virtual environment and npm packages installed:

### Bash (Linux, macOS, WSL, or Git Bash):
```bash
chmod +x *.sh
./run.sh
```

### Windows (PowerShell / Command Prompt):
Double-click `start_local.bat` or run:
```powershell
python run_local.py
```
*(If using the project virtual environment directly: `.\.venv\Scripts\python.exe run_local.py`)*

`run_local.py` automatically:
1. Starts the FastAPI backend with hot-reloading on port `8000`.
2. Starts the Next.js dev server on port `3000`.
3. Monitors both processes and displays health confirmation.
4. Allows you to stop both servers cleanly with a single `Ctrl+C`.

---

## 4. Step-by-Step Manual Setup

If you are setting up the project for the first time, follow these steps:

### Step 1: Environment Variables Setup
Ensure a `.env` file exists in the root directory. If not, copy `.env.example`:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**
```bash
cp .env.example .env
```

Key environment configuration variables in `.env`:
```env
# Database
DATABASE_URL=sqlite:///./skillmatch.db

# Security
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# AI Provider API Keys (Optional for live LLM completions)
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-flash-latest

# Storage Mode (local / cloudinary)
STORAGE_TYPE=local
```

---

### Step 2: Python Backend Setup

1. **Create and activate a virtual environment:**

   **Windows (PowerShell):**
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
   *(If script execution is disabled: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`)*

   **macOS / Linux:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. **Install Python dependencies:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **Download spaCy language model *(Optional)*:**
   ```bash
   python -m spacy download en_core_web_sm
   ```
   *(Note: The backend has built-in fallbacks to regex taxonomy if the spaCy package is omitted).*

---

### Step 3: Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend/dna-web
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Verify the frontend build *(Optional)*:**
   ```bash
   npm run build
   ```

4. **Return to project root:**
   ```bash
   cd ../..
   ```

---

## 5. Running Services Independently

If you prefer to run the backend and frontend in separate terminals:

### Terminal 1: FastAPI Backend
Using bash script:
```bash
./run_backend.sh
```
Or directly:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Access Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- Interactive Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Terminal 2: Next.js Frontend
Using bash script:
```bash
./run_frontend.sh
```
Or directly:
```bash
cd frontend/dna-web
npm run dev
```
- Access Web App: [http://localhost:3000](http://localhost:3000)

### Terminal 3: Streamlit Interface *(Optional)*
Using bash script:
```bash
./run_streamlit.sh
```
Or directly:
```bash
python -m streamlit run streamlit_app.py
```
- Access Streamlit UI: [http://localhost:8501](http://localhost:8501)

---

## 6. Verification & Health Checks

Once the services are running, verify them with these commands:

### Backend Health Check:
**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/health"
```
**cURL:**
```bash
curl http://127.0.0.1:8000/health
```
*Expected output:* `{"status":"ok","service":"SkillMatch DNA AI Engine",...}`

### Frontend HTTP Check:
**PowerShell:**
```powershell
(Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing).StatusCode
```
*Expected output:* `200`

### Running Backend Pytest Suite:
```bash
pytest tests/
```

---

## 7. Troubleshooting

### Port 8000 or 3000 is already in use
If a process is already bound to port 8000 or 3000:

**Windows (PowerShell):**
```powershell
# Find processes using the port:
Get-NetTCPConnection -LocalPort 8000,3000 -ErrorAction SilentlyContinue | Select-Object LocalPort, OwningProcess

# Terminate process by PID:
Stop-Process -Id <PID> -Force
```

**macOS / Linux:**
```bash
# Find and terminate:
lsof -ti :8000 | xargs kill -9
lsof -ti :3000 | xargs kill -9
```

### Windows Execution Policy Error with Virtualenv
If activating `.venv` throws `File ... cannot be loaded because running scripts is disabled`:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
```

### Next.js Cache Issues
If frontend styles or pages appear stale after dependency changes:
```powershell
cd frontend/dna-web
Remove-Item -Recurse -Force .next
npm run dev
```

