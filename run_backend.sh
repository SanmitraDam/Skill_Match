#!/usr/bin/env bash
# ==============================================================================
# SkillMatch — FastAPI Backend Runner (Bash)
# Runs uvicorn app.main:app on http://127.0.0.1:8000
# ==============================================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Detect Python binary
PYTHON_BIN=""
if [ -f "$ROOT_DIR/.venv/Scripts/python.exe" ]; then
  PYTHON_BIN="$ROOT_DIR/.venv/Scripts/python.exe"
elif [ -f "$ROOT_DIR/.venv/bin/python" ]; then
  PYTHON_BIN="$ROOT_DIR/.venv/bin/python"
elif command -v python3 &>/dev/null; then
  PYTHON_BIN="python3"
elif command -v python &>/dev/null; then
  PYTHON_BIN="python"
else
  echo "[ERROR] Python 3 not found in PATH."
  exit 1
fi

echo "Starting FastAPI Backend on http://127.0.0.1:8000 ..."
echo "API Docs: http://127.0.0.1:8000/docs"
echo "Health:   http://127.0.0.1:8000/health"

cd "$ROOT_DIR"
exec "$PYTHON_BIN" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

