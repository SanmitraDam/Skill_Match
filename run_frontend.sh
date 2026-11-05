#!/usr/bin/env bash
# ==============================================================================
# SkillMatch — Next.js Frontend Runner (Bash)
# Runs Next.js development server on http://localhost:3000
# ==============================================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend/dna-web"

if ! command -v npm &>/dev/null; then
  echo "[ERROR] npm not found in PATH. Please install Node.js 18+."
  exit 1
fi

cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies in $FRONTEND_DIR ..."
  npm install
fi

echo "Starting Next.js Web App on http://localhost:3000 ..."
exec npm run dev

