# Recommender microservice

This microservice provides movie recommendations for a given user. It builds a TF-IDF model from the `movies` collection in MongoDB and computes cosine similarity between movie corpora.

Environment variables
- `MONGO_URL` - MongoDB connection string (default `mongodb://localhost:27017`).
- `DB_NAME` - Database name (default `Moviesdb`).
- `OPINIONS_URL` - (optional) base URL of the Opinions microservice (e.g. `http://opinions:4100`). If provided, the recommender calls `/user/<userId>` to fetch opinions. If not, it falls back to reading `opinions` collection from MongoDB.
- `PORT` - Port for the Flask app (default `4500`).

Run locally (recommended for development)

1. Create a virtual environment and install dependencies:

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
```

2. Set env vars (example):

```powershell
$env:MONGO_URL = "mongodb://localhost:27017";
$env:OPINIONS_URL = "http://localhost:4100";
$env:PORT = "4500";
python app.py
```

Docker
Build and run with Docker (assuming Mongo and Opinions services are reachable):

```powershell
docker build -t recommender:local .
docker run -e MONGO_URL="mongodb://mongo:27017" -e OPINIONS_URL="http://opinions:4100" -p 4500:4500 recommender:local
```

API
- `GET /recommend/<userId>?top_n=10` - returns JSON with recommendations.
