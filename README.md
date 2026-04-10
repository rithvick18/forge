# FMCG Consumer Intelligence Platform

> **🤖 AI Context & Changes:** For ongoing developmental instructions, AI tracking, and change logs, refer to [INSTRUCTIONS.md](INSTRUCTIONS.md).

AI-powered system that analyzes Indian consumer behavior via Google Trends to predict purchasing patterns, identify emerging trends, and recommend product innovations for FMCG companies.

---

## Architecture

```
fmcg-intel/
├── backend/              # FastAPI — Python 3.11
│   └── app/
│       ├── api/routes/   # trends · insights · products · health
│       ├── core/         # config · database · cache
│       ├── models/       # SQLAlchemy ORM models
│       ├── schemas/      # Pydantic request/response schemas
│       └── services/
│           ├── ingestion/   # Google Trends (pytrends)
│           ├── ml/          # Prophet forecasting
│           ├── nlp/         # sentiment · translation
│           └── llm/         # LangChain + Gemini agent
├── frontend/             # React + Vite + Tailwind
│   └── src/
│       ├── pages/        # Dashboard · Trends · Insights · Products
│       ├── components/   # charts · dashboard cards · UI primitives
│       └── lib/          # api client · constants
└── docker-compose.yml
```

## Quick Start

```bash
# 1. Clone and setup
chmod +x scripts/setup.sh && ./scripts/setup.sh

# 2. Add your API keys to backend/.env
GOOGLE_API_KEY=your-gemini-key

# 3. Run everything
docker-compose up --build
```

**Dashboard** → http://localhost:5173  
**API Docs**  → http://localhost:8000/docs

---

## Key Features

| Feature | Stack |
|---|---|
| Trend ingestion | pytrends → Google Trends API |
| Time-series forecast | Facebook Prophet |
| AI insight briefs | LangChain + Gemini 1.5 Pro |
| Product recommendations | Gemini structured output |
| Caching | Redis (1hr TTL) |
| Database | PostgreSQL via SQLAlchemy async |
| Frontend | React + Recharts + Framer Motion |

## API Endpoints

```
POST /api/v1/trends/fetch          # Fetch pytrends data
POST /api/v1/trends/forecast       # Prophet 12-week forecast
GET  /api/v1/trends/compare        # Side-by-side keyword comparison
POST /api/v1/insights/generate     # LLM insight brief
POST /api/v1/products/recommend    # AI product recommendations
GET  /api/v1/health                # Health check
```

---

Built for Indian FMCG market intelligence.
<!-- Test change - April 10 -->