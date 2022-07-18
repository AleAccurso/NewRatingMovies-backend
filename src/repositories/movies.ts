import { MongoError } from 'mongodb';

import { msg } from '@constants/constants';
import IMovie from '@models/movie';
import { Movie } from '@schema/movie';
import HttpException from '@exceptions/httpException';
import { HttpCode } from '@enums/httpCode';

export const GetMoviesFull = (
    page: number,
    size: number,
): IMovie[] => {
    try {
        const movies = Movie.find()
            .skip(page * size)
            .limit(size)
            .exec((err, movies) => {
                if (movies) {
                    return Promise.resolve(movies);
                } else {
                    throw err;
                }
            });
        return [] as IMovie[];
    } catch (err) {
        if (err instanceof MongoError) {
            Promise.reject([] as IMovie[])
            throw new HttpException(HttpCode.NO_CONTENT,msg.RESOURCE_NOT_FOUND + 'movies');
        } else {
            Promise.reject([] as IMovie[])
            throw new HttpException(HttpCode.INTERNAL_SERVER_ERROR, msg.UNABLE_TO_DO_ACTION + 'get_movies');
        }
    }
};

export const GetMoviesAdmin = (
    page: number,
    size: number,
): IMovie[] => {
    try {
        const movies = Movie.find()
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
            .exec((err, movies) => {
                if (movies) {
                    return movies;
                } else {
                    throw err;
                }
            });
        return [] as IMovie[];
    } catch (err) {
        if (err instanceof MongoError) {
            Promise.reject([] as IMovie[])
            throw new HttpException(HttpCode.NO_CONTENT,msg.RESOURCE_NOT_FOUND + 'movies');
        } else {
            Promise.reject([] as IMovie[])
            throw new HttpException(HttpCode.INTERNAL_SERVER_ERROR, msg.UNABLE_TO_DO_ACTION + 'get_movies');
        }
    }
};

export const GetMoviesMinimum = (
    page: number,
    size: number,
): IMovie[] => {
    try {
        const movies = Movie.find()
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
            .exec((err, movies) => {
                if (movies) {
                    return movies;
                } else {
                    throw err;
                }
            });
        return [] as IMovie[];
    } catch (err) {
        if (err instanceof MongoError) {
            Promise.reject([] as IMovie[])
            throw new HttpException(HttpCode.NO_CONTENT,msg.RESOURCE_NOT_FOUND + 'movies');
        } else {
            Promise.reject([] as IMovie[])
            throw new HttpException(HttpCode.INTERNAL_SERVER_ERROR, msg.UNABLE_TO_DO_ACTION + 'get_movies');
        }
    }
};

export const CountMovies = (): number => {
    try {
        let count = Movie.countDocuments({}).exec((err, count) => {
            if (count) return count;
            else throw err
        })
        return -1;
    } catch (err) {
        if (err instanceof MongoError) {
            Promise.reject(-1)
            throw new HttpException(HttpCode.NO_CONTENT,msg.RESOURCE_NOT_FOUND + 'movies');
        } else {
            Promise.reject(-1)
            throw new HttpException(HttpCode.INTERNAL_SERVER_ERROR, msg.UNABLE_TO_DO_ACTION + 'get_movies');
        }
    }
};
