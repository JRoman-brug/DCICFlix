import type { Movie } from "../../types/movie";
import api from "../axios.config";

// TODO: Change path and remove fake data
export const getRecomendations = async () => {
  try {
    // const response = await api.post("/path");
    const movies: Movie[] = [
      {
        _id: 1,
        title: "Coldplay - Buenos Aires",
        year: 2002,
        genres: ["comedy"],
        poster: "poster xd",
        plot: "plot xd",
      },
      {
        _id: 2,
        title: "Metallica - Santiago",
        year: 2002,
        genres: ["comedy"],
        poster: "poster xd",
        plot: "plot xd",
      },
      {
        _id: 3,
        title: "Dua Lipa - São Paulo",
        year: 2002,
        genres: ["comedy"],
        poster: "poster xd",
        plot: "plot xd",
      },
    ];
    // Retornamos datos falsos
    return movies;
    // return response.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};
