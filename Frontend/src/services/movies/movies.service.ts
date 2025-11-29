import api from "../axios.config";
import type { Movie } from "../../types/movie";

export const searchMovies = async (q: string): Promise<Movie[]> => {
    try {
        const response = await api.get<Movie[]>('/movies', { params: { q } });
        return response.data;
    } catch (err) {
        console.error('searchMovies error', err);
        return [];
    }
};
