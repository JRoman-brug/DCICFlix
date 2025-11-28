import { useState, useEffect } from "react";
import type { Movie } from "../types/movie";
import { Film } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
    movie: Movie;
}

export const MovieCard = ({ movie }: Props) => {
    const [posterError, setPosterError] = useState(false);
    const [showFallback, setShowFallback] = useState(false);

    const hasPoster = movie.poster && movie.poster.trim() !== "" && !posterError;

    useEffect(() => {
        if (!hasPoster) {
        const timer = setTimeout(() => {
            setShowFallback(true);
        }, 1500);

        return () => clearTimeout(timer);
        }
    }, [hasPoster]);

    return (
        <Link to={`/movie/${movie._id}`}>
        <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden 
                        hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group">

        {}
        {hasPoster && (
            <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-[260px] object-cover"
            onError={() => setPosterError(true)}
            />
        )}

        {}
        {!hasPoster && (
        <div className="w-full h-[260px] bg-zinc-900 flex items-center justify-center">

            {!showFallback ? (
            <Film
                className="
                w-10 h-10 text-zinc-500
                animate-spin
                transition-all duration-300
                drop-shadow-[0_0_6px_rgba(255,255,255,0.15)]
                motion-safe:animate-pulse
                "
            />
            ) : (
            <div className="flex flex-col items-center text-zinc-600">
                <Film
                className="
                    w-12 h-12 opacity-80
                    drop-shadow-[0_0_4px_rgba(255,255,255,0.1)]
                "
                />
                <span className="text-xs mt-1 opacity-70">No image</span>
            </div>
            )}

        </div>
        )}

        {}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                        flex flex-col justify-end p-3 transition-opacity duration-300">
            <h3 className="text-white font-semibold text-sm line-clamp-2">{movie.title}</h3>
            <span className="text-zinc-400 text-xs">{movie.year}</span>

            {movie.genres && (
            <div className="flex flex-wrap gap-1 mt-1">
                {movie.genres.slice(0, 3).map((g) => (
                <span
                    key={g}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300"
                >
                    {g}
                </span>
                ))}
            </div>
            )}
        </div>
        </div>
        </Link>
    );
};
