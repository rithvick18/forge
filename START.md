# 🚀 Getting Started with Forge

Forge is an AI-powered FMCG Consumer Intelligence Platform. Here's how to get the application up and running.

## 📋 Prerequisites
- **Docker & Docker Compose**: Ensure you have Docker installed on your machine.
- **API Keys**: You will need a Mistral AI API key for the Copilot and a Google AI key for Gemini insights.

## ⚙️ Configuration
1. Navigate to the `backend/` directory.
2. Open the `.env` file.
3. Add your API keys:
   ```dotenv
   GOOGLE_API_KEY=your-gemini-key
   MISTRAL_API_KEY=your-mistral-key
   ```

## 🏃‍♂️ Starting the App
Run the following command in the root directory to start everything:

```bash
docker compose up --build
```

### Starting Only the Backend
If you want to run only the backend services:
```bash
docker compose up --build backend db redis
```

### Running Backend without Docker (Advanced)
> [!WARNING]
> This is not recommended due to complex ML dependencies (Torch, Prophet, etc.).
1. Install Python 3.11.
2. Install dependencies: `pip install -r backend/requirements.txt`.
3. Start a local Redis and PostgreSQL instance.
4. Run: `cd backend && uvicorn app.main:app --reload`.

## 🌐 URLs
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

## 🤖 Using the Copilot
Once the app is running, click the **bolt icon** in the bottom-right corner to open the AI Copilot. It can help you search trends, generate insights, and navigate the platform.

---
*Note: The first build might take a few minutes as it installs all AI and data science dependencies.*
