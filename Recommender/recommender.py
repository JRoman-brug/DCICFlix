import os
import threading
import logging
from typing import List, Dict

import pandas as pd
import numpy as np
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)


class Recommender:
    def __init__(self, mongo_url: str, db_name: str = "moviesdb"):
        self.mongo_url = mongo_url
        self.db_name = db_name
        self.client = None
        self.movies: pd.DataFrame = pd.DataFrame()
        self.sim_df = None
        self.tfidf_matrix = None
        self.vectorizer = None
        self._lock = threading.Lock()
        self._init()

    def _init(self):
        try:
            logger.info("Initializing Recommender...")
            self.client = MongoClient(self.mongo_url)
            logger.info(f"Connected to MongoDB at {self.mongo_url}")
            
            db = self.client[self.db_name]
            col = db.get_collection("movies")
            logger.info(f"Fetching movies from {self.db_name}.movies")
            
            cursor = col.find()
            movies = pd.DataFrame(list(cursor))
            logger.info(f"Loaded {len(movies)} movies from database")

            if movies.empty:
                logger.warning("Movies DataFrame is empty!")
                self.movies = pd.DataFrame()
                return

            movies["_id"] = movies["_id"].astype(str)

            # Safe conversions for the fields used in corpus
            movies["plot"] = movies.get("plot", "").fillna("")
            movies["fullplot"] = movies.get("fullplot", "").fillna("")
            movies["title"] = movies.get("title", "").fillna("")

            movies["genres"] = movies.get("genres", []).apply(lambda x: x if isinstance(x, list) else [])
            movies["cast"] = movies.get("cast", []).apply(lambda x: x if isinstance(x, list) else [])
            movies["directors"] = movies.get("directors", []).apply(lambda x: x if isinstance(x, list) else [])

            movies["genres_str"] = movies["genres"].apply(lambda x: " ".join(x) if isinstance(x, list) else "")
            movies["cast_str"] = movies["cast"].apply(lambda x: " ".join(x) if isinstance(x, list) else "")
            movies["directors_str"] = movies["directors"].apply(lambda x: " ".join(x) if isinstance(x, list) else "")

            movies["corpus"] = (
                movies["title"].fillna("") + " " +
                movies["plot"].fillna("") + " " +
                movies["fullplot"].fillna("") + " " +
                movies["genres_str"].fillna("") + " " +
                movies["cast_str"].fillna("") + " " +
                movies["directors_str"].fillna("")
            )

            self.movies = movies.set_index("_id")
            logger.info(f"Created movies index with {len(self.movies)} movies")

            # Build TF-IDF and similarity matrix
            logger.info("Building TF-IDF matrix...")
            self.vectorizer = TfidfVectorizer(stop_words="english", max_features=10000)
            tfidf_matrix = self.vectorizer.fit_transform(self.movies["corpus"].values.astype("U"))
            logger.info(f"TF-IDF matrix shape: {tfidf_matrix.shape}")
            
            logger.info("Computing cosine similarity (this may take a while)...")
            # Store TF-IDF matrix instead of full similarity matrix to save memory
            self.tfidf_matrix = tfidf_matrix
            logger.info("Recommender initialized successfully!")
            
        except Exception as e:
            logger.error(f"Error during initialization: {e}", exc_info=True)
            self.movies = pd.DataFrame()
            self.tfidf_matrix = None

    def recommend_for_user(self, liked_movie_ids: List[str], top_n: int = 10) -> List[Dict]:
        with self._lock:
            if self.tfidf_matrix is None or self.movies.empty:
                logger.error("TF-IDF matrix or movies DataFrame is empty")
                return []

            logger.info(f"Received {len(liked_movie_ids)} liked movie IDs: {liked_movie_ids}")
            logger.info(f"Available movie IDs in index (first 10): {list(self.movies.index[:10])}")
            
            # Filter liked_movie_ids that exist in movies index
            liked = [m for m in liked_movie_ids if m in self.movies.index]
            logger.info(f"Matched {len(liked)} movie IDs in movies: {liked}")
            
            if not liked:
                logger.warning(f"No liked movies found in movies index. Checking for ID mismatch...")
                logger.warning(f"Sample of available IDs: {list(self.movies.index[:5])}")
                logger.warning(f"Sample of requested IDs: {liked_movie_ids[:5]}")
                return []

            # Get indices of liked movies
            liked_indices = [list(self.movies.index).index(m) for m in liked]
            logger.info(f"Liked movie indices: {liked_indices}")
            
            # Compute similarity on-the-fly for each liked movie
            scores = {}
            for liked_idx in liked_indices:
                # Get TF-IDF vector for this liked movie
                liked_vector = self.tfidf_matrix[liked_idx]
                # Compute cosine similarity with all other movies
                similarities = cosine_similarity(liked_vector, self.tfidf_matrix)[0]
                
                for idx, sim_score in enumerate(similarities):
                    movie_id = self.movies.index[idx]
                    # Skip if it's one of the liked movies
                    if movie_id not in liked:
                        scores[movie_id] = scores.get(movie_id, 0) + float(sim_score)

            recomendaciones = sorted(scores.items(), key=lambda x: x[1], reverse=True)
            logger.info(f"Generated {len(recomendaciones)} potential recommendations")
            
            results = []
            for movieId, score in recomendaciones[:top_n]:
                movie_row = self.movies.loc[movieId]
                results.append({
                    "movieId": movieId,
                    "title": movie_row.get("title", ""),
                    "score": score
                })

            return results
