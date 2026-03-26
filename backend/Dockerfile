FROM python:3.11-slim

WORKDIR /app

# System deps for pytrends, spacy, prophet
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
COPY install_groups.py .
RUN python install_groups.py

# Download spacy model for Indian English if needed (currently disabled)
# RUN python -m spacy download en_core_web_sm

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
