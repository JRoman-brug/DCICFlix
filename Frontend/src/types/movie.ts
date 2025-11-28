export interface Movie {
    _id: number;
    title: string;
    poster: string;
    year: number;
    genres: string[];
    plot?: string;
}
