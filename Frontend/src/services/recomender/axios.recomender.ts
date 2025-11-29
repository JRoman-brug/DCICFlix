import type { Movie } from "../../types/movie";
import api from "../axios.config";
import axios from "axios";

const RECOMMENDER_URL =
  (import.meta.env.VITE_RECOMMENDER_URL as string) || "http://localhost:4500";

/**
 * Get recommendations for a user by calling the Recommender microservice
 * and then fetching movie details from the movies service (via ApiGateway).
 * Returns an array of Movie objects (may be empty on error).
 */
export const getRecomendations = async (userId?: string, top_n = 12): Promise<Movie[]> => {
  if (!userId) return [];
  try {
    const recResp = await axios.get(`${RECOMMENDER_URL}/recommend/${encodeURIComponent(userId)}`, {
      params: { top_n },
      timeout: 5000,
    });

    console.debug("recommender response:", recResp.status, recResp.data);

    const recs = recResp.data && recResp.data.recommendations ? recResp.data.recommendations : [];

    // For each recommendation we fetch movie details from ApiGateway (/movies/:id)
    const moviePromises = recs.map(async (r: any) => {
      const id = r.movieId ?? r.movie_id ?? r.movieId;
      if (!id) {
        // no id, maybe recommender returned full movie object
        if (r.title) {
          return {
            _id: r._id || r.id || "",
            title: r.title,
            year: r.year || 0,
            genres: r.genres || [],
            poster: r.poster || "",
            plot: r.plot || "",
          } as Movie;
        }
        return null;
      }
      try {
        const movieResp = await api.get(`/movies/${encodeURIComponent(String(id))}`);
        return movieResp.data as Movie;
      } catch (err) {
        console.warn("Failed to fetch movie details for", id, err);
        // fallback: try to map minimal fields from recommender response
        return {
          _id: id,
          title: r.title || "",
          year: (r.year as number) || 0,
          genres: r.genres || [],
          poster: r.poster || "",
          plot: r.plot || "",
        } as Movie;
      }
    });

    const movies = await Promise.all(moviePromises);
    return movies.filter(Boolean);
  } catch (err) {
    console.error("getRecomendations error:", err);
    return [];
  }
};
