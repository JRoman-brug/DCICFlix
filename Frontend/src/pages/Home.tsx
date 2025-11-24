import { useEffect, useState, useRef, useCallback } from "react";
import { Navbar } from "../components/Navbar";
import { MovieGrid } from "../components/MovieGrid";
import type { Movie } from "../types/movie";

export const Home = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const loadMovies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3002/random?count=36`);
      const data = await res.json();
      setMovies((prev) => [...prev, ...data.results]);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  // Infinite scroll
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMovies();
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, loadMovies]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <MovieGrid movies={movies} isLoading={loading} />

      <div ref={observerRef} className="h-10"></div>

      {loading && movies.length > 0 && (
        <p className="text-center py-4 text-zinc-400">Loading more...</p>
      )}
    </div>
  );
};

export default Home;
