import { useEffect, useState } from "react";
import type { Movie } from "../types/movie";
import { MovieCard } from "./MovieCard";
import { getRecomendations } from "../services/recomender/axios.recomender";

interface Props {
  userId?: string | null;
}

function RecomendationsGrid({ userId }: Props) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!userId) return;
      console.debug("Loading recommendations for userId:", userId);
      setLoading(true);
      setError(null);
      try {
        const res = await getRecomendations(userId, 24);
        console.debug("Frontend received recommendations:", res);
        if (!mounted) return;
        setMovies(res);
      } catch (err: any) {
        console.error(err);
        if (!mounted) return;
        setError("Error fetching recommendations");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  if (!userId)
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center text-zinc-400">
        No user id provided.
      </div>
    );

  if (loading)
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center text-zinc-400">
        Loading recommendations...
      </div>
    );

  if (error)
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center text-red-400">
        {error}
      </div>
    );

  if (movies.length === 0)
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center text-zinc-400">
        No recommendations available.
      </div>
    );

  return (
    <div
      className="
            h-screen
            px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12
            grid gap-6 mt-6
            grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6
        "
    >
      {movies.map((elem) => (
        <MovieCard key={String(elem._id)} movie={elem} />
      ))}
    </div>
  );
}

export default RecomendationsGrid;
