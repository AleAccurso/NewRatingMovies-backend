import { msg } from '../contants/constants';
import IMovie from '../models/movie';
import { Movie } from '../schema/movie';
import { MongoError } from 'mongodb';
import HttpException from '../exceptions/httpException';
import { HttpCode } from '../enums/httpCode';

export const GetMoviesFull = async (
    page: number,
    size: number,
): Promise<IMovie[]> => {
    try {
        return await Movie.find()
            .skip(page * size)
            .limit(size)
            .exec();
    } catch (err) {
        if (err instanceof MongoError) {
            throw new HttpException(HttpCode.NO_CONTENT,msg.RESOURCE_NOT_FOUND + 'movies');
        } else {
            throw new HttpException(HttpCode.INTERNAL_SERVER_ERROR, msg.UNABLE_TO_DO_ACTION + 'get_movies');
        }
    }
};

export const GetMoviesAdmin = async (
    page: number,
    size: number,
): Promise<IMovie[]> => {
    try {
        return await Movie.find()
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
    } catch (err) {
        if (err instanceof MongoError) {
            throw new HttpException(HttpCode.NO_CONTENT,msg.RESOURCE_NOT_FOUND + 'movies');
        } else {
            throw new HttpException(HttpCode.INTERNAL_SERVER_ERROR, msg.UNABLE_TO_DO_ACTION + 'get_movies');
        }
    }
};

export const GetMoviesMinimum = async (
    page: number,
    size: number,
): Promise<IMovie[]> => {
    try {
        return await Movie.find()
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
    } catch (err) {
        if (err instanceof MongoError) {
            throw new HttpException(HttpCode.NO_CONTENT,msg.RESOURCE_NOT_FOUND + 'movies');
        } else {
            throw new HttpException(HttpCode.INTERNAL_SERVER_ERROR, msg.UNABLE_TO_DO_ACTION + 'get_movies');
        }
    }
};

export const CountMovies = async (): Promise<number> => {
    try {
        return await Movie.countDocuments({});
    } catch (err) {
        if (err instanceof MongoError) {
            throw new HttpException(HttpCode.NO_CONTENT,msg.RESOURCE_NOT_FOUND + 'movies');
        } else {
            throw new HttpException(HttpCode.INTERNAL_SERVER_ERROR, msg.UNABLE_TO_DO_ACTION + 'count_movies');
        }
    }
};
