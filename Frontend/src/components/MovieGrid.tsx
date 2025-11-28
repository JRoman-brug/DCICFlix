import { MovieCard } from "./MovieCard";
import type { Movie } from "../types/movie";

interface Props {
    movies: Movie[];
    isLoading?: boolean;
}

export const MovieGrid = ({ movies, isLoading }: Props) => {
    return (
        <div
        className="
            px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12
            grid gap-6 mt-6
            grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6
        "
        >
        {isLoading && movies.length === 0
            ? Array.from({ length: 12 }).map((_, i) => (
                <div
                key={i}
                className="w-full h-[260px] bg-zinc-800 animate-pulse rounded-xl"
                />
            ))
            : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
        </div>
    );
};
