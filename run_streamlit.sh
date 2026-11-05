#!/usr/bin/env bash
# ==============================================================================
# SkillMatch — Streamlit Portal Runner (Bash)
# Runs streamlit app on http://localhost:8501
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

echo "Starting Streamlit Portal on http://localhost:8501 ..."
cd "$ROOT_DIR"
exec "$PYTHON_BIN" -m streamlit run streamlit_app.py

