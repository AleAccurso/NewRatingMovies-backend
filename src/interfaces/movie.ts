import { Document } from "mongoose"

type localMovieInfo = {
    title: string,
    overview: string,
    poster_path: string,
    trailers: [string]
}

export default interface IMovie extends Document {
    movieDbId: number,
    release_date: string,
    director: string,
    casting: string,
    vote_average: number,
    vote_count: number,
    genre: [string],
    en: localMovieInfo,
    fr: localMovieInfo,
    nl: localMovieInfo,
    it: localMovieInfo
}