# SkillMatch

SkillMatch contains a FastAPI backend and a Next.js web client. Application code is grouped under `backend/` and `frontend/`; shared configuration, local development launchers, and project documentation stay at the repository root.

## Project layout

| Path | Purpose |
| --- | --- |
| `backend/app/` | FastAPI API routers, services, models, schemas, configuration, and static assets |
| `backend/ai_services/` | Supporting AI service entry point |
| `backend/alembic/`, `backend/alembic.ini` | Backend database migration environment |
| `backend/data/` | Question bank data and generated datasets |
| `backend/scripts/`, `backend/tests/` | Backend maintenance tools and test suite |
| `backend/contracts/`, `backend/edge/`, `backend/infra/` | Backend-related contracts and deployment infrastructure |
| `frontend/dna-web/` | Next.js application and its Node dependencies |
| `.env`, `.env.example` | Shared local configuration; `.env` stays at the repository root |
| `skillmatch.db` | Existing local SQLite database; stays at the repository root |

The Next.js app keeps its own `package.json` and lockfile in `frontend/dna-web`. The root `package.json` provides convenience commands for that app.

## Run locally

Create the Python environment from the repository root:

```bash
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux:        source .venv/bin/activate
pip install -r backend/requirements.txt
```

Copy `.env.example` to `.env` if needed, then set the values for the services you use. The API and frontend load this root-level file.

### Backend

From the repository root:

```bash
./run_backend.sh
```

The API is at `http://127.0.0.1:8000`, with interactive documentation at `http://127.0.0.1:8000/docs`.

### Next.js frontend

```bash
cd frontend/dna-web
npm install
npm run dev
```

The web client is at `http://localhost:3000`. From the root, `./run_frontend.sh` starts it and installs dependencies if needed.

### Backend migrations

Run Alembic from the repository root with the backend configuration:

```bash
alembic -c backend/alembic.ini upgrade head
```

### Backend tests

From the repository root:

```bash
pytest backend/tests/
```

### Both main applications

On systems with Bash, Python, and Node.js installed, run `./run.sh` to start the FastAPI API and Next.js client together.
