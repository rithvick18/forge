#!/bin/bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  FMCG Consumer Intelligence — Dev Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backend .env
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "✓ Created backend/.env — fill in your API keys"
fi

# Frontend .env
if [ ! -f frontend/.env ]; then
  echo "VITE_API_URL=http://localhost:8000/api/v1" > frontend/.env
  echo "✓ Created frontend/.env"
fi

# Python venv
echo ""
echo "Setting up Python virtualenv…"
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
python -m spacy download en_core_web_sm -q
echo "✓ Python environment ready"
cd ..

# Frontend
echo ""
echo "Installing frontend dependencies…"
cd frontend
npm install --silent
echo "✓ Frontend dependencies installed"
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  All done! Start the app:"
echo ""
echo "  Option A — Docker (recommended):"
echo "    docker-compose up --build"
echo ""
echo "  Option B — Manual:"
echo "    Terminal 1: cd backend && uvicorn app.main:app --reload"
echo "    Terminal 2: cd frontend && npm run dev"
echo ""
echo "  Dashboard → http://localhost:5173"
echo "  API docs  → http://localhost:8000/docs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
