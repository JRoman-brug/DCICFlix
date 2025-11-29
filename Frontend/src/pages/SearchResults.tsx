import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MovieGrid } from "../components/MovieGrid";
import type { Movie } from "../types/movie";
import { searchMovies } from "../services/movies/movies.service";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const q = searchParams.get("q") || "";
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const doSearch = async () => {
        if (!q || q.trim() === "") {
            setMovies([]);
            return;
        }
        setLoading(true);
        const res = await searchMovies(q);
        setMovies(res);
        setLoading(false);
        };
        doSearch();
    }, [q]);

    return (
        <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mt-6">
        <h2 className="text-white text-xl font-semibold">Search results for "{q}"</h2>
        <MovieGrid movies={movies} isLoading={loading} />
        </div>
    );
};

export default SearchResults;
