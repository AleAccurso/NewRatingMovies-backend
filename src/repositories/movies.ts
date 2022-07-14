import { msg } from "../contants/responseMessages";
import IMovie from "../models/movie";
import { Movie } from "../schema/movie";
import { MongoError } from 'mongodb';

export type movieRes = {
    movies?: IMovie[],
    error?: Error
}

export type countMovieRes = {
    count?: number,
    error?: Error
}

export const GetMoviesFull = async(page: number, size: number): Promise<IMovie[]> => {
    try {
        let response = await Movie.find()
            .skip(page * size)
            .limit(size)
            .exec();
        if (response) {
            return response
        } else {
            throw new Error(msg.RESOURCE_NOT_FOUND + "movies")
        }
        
    } catch (err) {
        if (err instanceof MongoError) {
            // A MongoError
            throw new Error(msg.SERVER_ERROR)
        }
    }
}

export const GetMoviesAdmin = async(page: number, size: number): Promise<movieRes> => {
    try {
        const response = await Movie.find()
                .select({
                    release_date: 1,
                    vote_average: 1,
                    director: 1,
                    en: {
                        title: 1,
                        overview: 1,
                    },
                    fr: {
                        title: 1,
                        overview: 1,
                    },
                    it: {
                        title: 1,
                        overview: 1,
                    },
                    nl: {
                        title: 1,
                        overview: 1,
                    },
                })
                .skip(page * size)
                .limit(size)
                .exec();

        return { movies: response } as movieRes
    } catch (err) {
        return { error: err } as movieRes
    }
}

export const GetMoviesMinimum = async(page: number, size: number): Promise<movieRes> => {
    try {
        const response = await Movie.find()
        .select({
            _id: 1,
            movieDbId: 1,
            release_date: 1,
            en: {
                title: 1,
                poster_path: 1,
            },
            fr: {
                title: 1,
                poster_path: 1,
            },
            it: {
                title: 1,
                poster_path: 1,
            },
            nl: {
                title: 1,
                poster_path: 1,
            },
        })
        .skip(page * size)
        .limit(size)
        .exec();

        return { movies: response } as movieRes
    } catch (err) {
        return { error: err } as movieRes
    }
}

export const CountMovies = async(): Promise<countMovieRes> => {
    try {
        const totalNbMovies = await Movie.countDocuments({});
        return { count: totalNbMovies } as countMovieRes
    } catch (err) {
        return { error: err } as countMovieRes
    }
}