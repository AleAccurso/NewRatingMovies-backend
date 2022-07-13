import { ObjectId } from "mongodb"
import { Document, Model } from "mongoose"

export interface rate {
    title:string,
    key: string
}

export interface localMovieInfo {
    title: string,
    overview: string,
    poster_path: string,
    trailers?: rate[]
}

export default interface IMovie extends Document {
    _id?: ObjectId,
    movieDbId: number,
    release_date: string,
    director: string,
    casting: string,
    vote_average: number,
    vote_count: number,
    genre: string[],
    en?: localMovieInfo,
    fr?: localMovieInfo,
    nl?: localMovieInfo,
    it?: localMovieInfo
}

export interface Movie extends Model<IMovie> {}