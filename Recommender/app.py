import os
import logging
import requests
from flask import Flask, jsonify, request

from recommender import Recommender

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

OPINIONS_URL = os.environ.get("OPINIONS_URL")  # e.g. http://opinions:4100
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "moviesdb")

app = Flask(__name__)

# Initialize recommender on startup
recommender = Recommender(MONGO_URL, DB_NAME)


def get_user_liked_from_opinions(user_id):
    if not OPINIONS_URL:
        logger.info(f"OPINIONS_URL not set, will use DB fallback")
        return None
    try:
        url = f"{OPINIONS_URL}/api/opinions/user/{user_id}"
        logger.info(f"Fetching opinions from {url}")
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        body = resp.json()
        opinions = body.get("opinions", [])
        logger.info(f"Got {len(opinions)} opinions for user {user_id}")
        liked = [op.get("movieId") for op in opinions if op.get("score", 0) >= 4]
        liked_list = list(dict.fromkeys([str(m) for m in liked if m]))
        logger.info(f"Found {len(liked_list)} liked movies (score >= 4) for user {user_id}")
        return liked_list
    except Exception as e:
        logger.error(f"Error fetching from opinions service: {e}")
        return None


def get_user_liked_from_db(user_id):
    # fallback: read from local MongoDB opinions collection
    try:
        logger.info(f"Falling back to DB query for user {user_id} in DB {DB_NAME}")
        client = recommender.client
        db = client[DB_NAME]
        col = db.get_collection("opinions")
        docs = list(col.find({"userId": user_id}))
        logger.info(f"Found {len(docs)} opinion documents for user {user_id}")
        liked = [str(d.get("movieId")) for d in docs if d.get("score", 0) >= 4]
        logger.info(f"Found {len(liked)} liked movies (score >= 4) from DB for user {user_id}")
        return list(dict.fromkeys(liked))
    except Exception as e:
        logger.error(f"Error querying DB for opinions: {e}")
        return []


@app.get("/recommend/<user_id>")
def recommend(user_id):
    logger.info(f"=== Recommendation request for user {user_id} ===")
    top_n = int(request.args.get("top_n", 10))

    liked = get_user_liked_from_opinions(user_id)
    if liked is None:
        logger.info("Opinions service unavailable or returned None, using DB fallback")
        liked = get_user_liked_from_db(user_id)

    if not liked:
        logger.warning(f"No liked movies found for user {user_id}")
        return jsonify({"recommendations": [], "message": "No liked movies found for user"}), 200

    logger.info(f"Computing recommendations from {len(liked)} liked movies")
    recs = recommender.recommend_for_user(liked, top_n=top_n)
    logger.info(f"Returning {len(recs)} recommendations for user {user_id}")
    return jsonify({"recommendations": recs}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 4500))
    app.run(host="0.0.0.0", port=port)
