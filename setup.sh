#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Backend: venv + requirements"
cd "$ROOT/Backend"
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "==> Frontend: install deps deterministically"
cd "$ROOT/Frontend"
if [ -f "package-lock.json" ]; then
  npm ci
else
  npm install
fi

echo "==> Starting backend and frontend concurrently"
npx concurrently -k -n BACKEND,FRONTEND -c green,cyan \
  "bash -lc 'cd \"$ROOT/Backend\" && source .venv/bin/activate && uvicorn main:app --reload'" \
  "bash -lc 'cd \"$ROOT/Frontend\" && npm start'"
