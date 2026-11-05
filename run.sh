#!/usr/bin/env bash
# ==============================================================================
# SkillMatch — Master Localhost Runner (Bash)
# Launches:
#   1. FastAPI Backend (http://127.0.0.1:8000)
#   2. Next.js Web UI  (http://localhost:3000)
# ==============================================================================

set -e

# Colors for terminal output
BOLD="\033[1m"
CYAN="\033[36m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend/dna-web"

echo -e "${BOLD}${CYAN}=================================================================${RESET}"
echo -e "${BOLD}${CYAN}            SKILLMATCH — LOCALHOST RUNNER (BASH)                 ${RESET}"
echo -e "${BOLD}${CYAN}=================================================================${RESET}"
echo -e "  • Project root : $ROOT_DIR"
echo -e "  • Frontend dir : $FRONTEND_DIR"

# 1. Check or copy .env
if [ ! -f "$ROOT_DIR/.env" ]; then
  if [ -f "$ROOT_DIR/.env.example" ]; then
    echo -e "${YELLOW}[!] .env not found. Copying from .env.example...${RESET}"
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
  fi
fi

# 2. Detect Python binary & virtual environment
PYTHON_BIN=""
if [ -f "$ROOT_DIR/.venv/Scripts/python.exe" ]; then
  # Windows Git Bash / MSYS2
  PYTHON_BIN="$ROOT_DIR/.venv/Scripts/python.exe"
elif [ -f "$ROOT_DIR/.venv/bin/python" ]; then
  # Linux / macOS / WSL
  PYTHON_BIN="$ROOT_DIR/.venv/bin/python"
elif command -v python3 &>/dev/null; then
  PYTHON_BIN="python3"
elif command -v python &>/dev/null; then
  PYTHON_BIN="python"
else
  echo -e "${RED}[ERROR] Python 3 not found in PATH. Please install Python 3.10+${RESET}"
  exit 1
fi

echo -e "  • Python binary: $PYTHON_BIN"

# 3. Check Node & npm
if ! command -v npm &>/dev/null; then
  echo -e "${RED}[ERROR] npm not found in PATH. Please install Node.js 18+${RESET}"
  exit 1
fi

# 4. Check frontend dependencies
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo -e "${YELLOW}[i] Installing frontend dependencies in $FRONTEND_DIR...${RESET}"
  (cd "$FRONTEND_DIR" && npm install)
fi

# Process IDs tracking
BACKEND_PID=""
FRONTEND_PID=""

# Cleanup on exit / Ctrl+C
cleanup() {
  echo -e "\n${YELLOW}[!] Shutting down all SkillMatch services...${RESET}"
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  echo -e "${GREEN}[✓] All services stopped cleanly.${RESET}"
  exit 0
}

trap cleanup INT TERM EXIT

# 5. Start FastAPI Backend
echo -e "\n${BOLD}${GREEN}[1/2] Starting FastAPI Backend on http://127.0.0.1:8000...${RESET}"
(cd "$ROOT_DIR" && "$PYTHON_BIN" -m uvicorn --app-dir "$ROOT_DIR/backend" app.main:app --host 0.0.0.0 --port 8000 --reload) &
BACKEND_PID=$!

# 6. Start Next.js Frontend
echo -e "${BOLD}${GREEN}[2/2] Starting Next.js Web App on http://localhost:3000...${RESET}"
(cd "$FRONTEND_DIR" && npm run dev) &
FRONTEND_PID=$!

echo -e "\n${BOLD}${CYAN}=================================================================${RESET}"
echo -e "${BOLD}${GREEN}  SERVICES ARE STARTING! ACCESS YOUR APPLICATIONS AT:            ${RESET}"
echo -e "${BOLD}${CYAN}=================================================================${RESET}"
echo -e "  ${BOLD}Web Application:${RESET}        ${CYAN}http://localhost:3000${RESET}"
echo -e "  ${BOLD}FastAPI Backend:${RESET}        ${CYAN}http://127.0.0.1:8000${RESET}"
echo -e "  ${BOLD}Interactive API Docs:${RESET}   ${CYAN}http://127.0.0.1:8000/docs${RESET}"
echo -e "  ${BOLD}Health Endpoint:${RESET}        ${CYAN}http://127.0.0.1:8000/health${RESET}"
echo -e "${BOLD}${CYAN}=================================================================${RESET}"
echo -e "${YELLOW}Press Ctrl+C to stop both services.${RESET}\n"

# Wait for both processes
wait

