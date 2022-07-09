import IMovie from "../models/movie";

export default interface MoviePagingDTO {
    nbMovies: number,
    movies?: IMovie[],
}