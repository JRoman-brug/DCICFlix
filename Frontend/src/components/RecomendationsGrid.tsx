import { use } from "react";
import type { Movie } from "../types/movie";
import { MovieCard } from "./MovieCard";
import { getRecomendations } from "../services/recomender/axios.recomender";

const moviesPromise = getRecomendations();

function RecomendationsGrid() {
  const movies: Movie[] = use(moviesPromise);

  if (movies.length == 0)
    return (
      <div className="w-full h-screen flex items-center justify-center font-bold uppercase text-dcicflix">
        Error to get recomendations
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
      {movies.map((elem, index) => (
        <MovieCard
          key={index}
          movie={{
            _id: elem._id,
            genres: elem.genres,
            poster: elem.poster,
            title: elem.title,
            year: elem.year,
            plot: elem.plot,
          }}
        />
      ))}
    </div>
  );
}

export default RecomendationsGrid;
