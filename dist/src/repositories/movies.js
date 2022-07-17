"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountMovies = exports.GetMoviesMinimum = exports.GetMoviesAdmin = exports.GetMoviesFull = void 0;
const constants_1 = require("@constants/constants");
const movie_1 = require("@schema/movie");
const mongodb_1 = require("mongodb");
const httpException_1 = __importDefault(require("@exceptions/httpException"));
const httpCode_1 = require("@enums/httpCode");
const GetMoviesFull = async (page, size) => {
    try {
        const movies = movie_1.Movie.find()
            .skip(page * size)
            .limit(size)
            .exec((err, movies) => {
            if (movies) {
                return Promise.resolve(movies);
            }
            else {
                throw err;
            }
        });
        return Promise.resolve([]);
    }
    catch (err) {
        if (err instanceof mongodb_1.MongoError) {
            Promise.reject([]);
            throw new httpException_1.default(httpCode_1.HttpCode.NO_CONTENT, constants_1.msg.RESOURCE_NOT_FOUND + 'movies');
        }
        else {
            Promise.reject([]);
            throw new httpException_1.default(httpCode_1.HttpCode.INTERNAL_SERVER_ERROR, constants_1.msg.UNABLE_TO_DO_ACTION + 'get_movies');
        }
    }
};
exports.GetMoviesFull = GetMoviesFull;
const GetMoviesAdmin = (page, size) => {
    try {
        const movies = movie_1.Movie.find()
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
                return Promise.resolve(movies);
            }
            else {
                throw err;
            }
        });
        return Promise.resolve([]);
    }
    catch (err) {
        if (err instanceof mongodb_1.MongoError) {
            Promise.reject([]);
            throw new httpException_1.default(httpCode_1.HttpCode.NO_CONTENT, constants_1.msg.RESOURCE_NOT_FOUND + 'movies');
        }
        else {
            Promise.reject([]);
            throw new httpException_1.default(httpCode_1.HttpCode.INTERNAL_SERVER_ERROR, constants_1.msg.UNABLE_TO_DO_ACTION + 'get_movies');
        }
    }
};
exports.GetMoviesAdmin = GetMoviesAdmin;
const GetMoviesMinimum = (page, size) => {
    try {
        const movies = movie_1.Movie.find()
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
                return Promise.resolve(movies);
            }
            else {
                throw err;
            }
        });
        return Promise.resolve([]);
    }
    catch (err) {
        if (err instanceof mongodb_1.MongoError) {
            Promise.reject([]);
            throw new httpException_1.default(httpCode_1.HttpCode.NO_CONTENT, constants_1.msg.RESOURCE_NOT_FOUND + 'movies');
        }
        else {
            Promise.reject([]);
            throw new httpException_1.default(httpCode_1.HttpCode.INTERNAL_SERVER_ERROR, constants_1.msg.UNABLE_TO_DO_ACTION + 'get_movies');
        }
    }
};
exports.GetMoviesMinimum = GetMoviesMinimum;
const CountMovies = () => {
    try {
        let count = movie_1.Movie.countDocuments({}).exec((err, count) => {
            if (count)
                Promise.resolve(count);
            else
                throw err;
        });
        return Promise.resolve(-1);
    }
    catch (err) {
        if (err instanceof mongodb_1.MongoError) {
            Promise.reject(-1);
            throw new httpException_1.default(httpCode_1.HttpCode.NO_CONTENT, constants_1.msg.RESOURCE_NOT_FOUND + 'movies');
        }
        else {
            Promise.reject(-1);
            throw new httpException_1.default(httpCode_1.HttpCode.INTERNAL_SERVER_ERROR, constants_1.msg.UNABLE_TO_DO_ACTION + 'get_movies');
        }
    }
};
exports.CountMovies = CountMovies;
