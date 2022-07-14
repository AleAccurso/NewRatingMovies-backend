"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountMovies = exports.GetMoviesMinimum = exports.GetMoviesAdmin = exports.GetMoviesFull = void 0;
const responseMessages_1 = require("../contants/responseMessages");
const movie_1 = require("../schema/movie");
const mongodb_1 = require("mongodb");
const GetMoviesFull = async (page, size) => {
    try {
        let response = await movie_1.Movie.find()
            .skip(page * size)
            .limit(size)
            .exec();
        if (response) {
            return response;
        }
        else {
            throw new Error(responseMessages_1.msg.RESOURCE_NOT_FOUND + "movies");
        }
    }
    catch (err) {
        if (err instanceof mongodb_1.MongoError) {
            // A MongoError
            throw new Error(responseMessages_1.msg.SERVER_ERROR);
        }
    }
};
exports.GetMoviesFull = GetMoviesFull;
const GetMoviesAdmin = async (page, size) => {
    try {
        const response = await movie_1.Movie.find()
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
        return { movies: response };
    }
    catch (err) {
        return { error: err };
    }
};
exports.GetMoviesAdmin = GetMoviesAdmin;
const GetMoviesMinimum = async (page, size) => {
    try {
        const response = await movie_1.Movie.find()
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
        return { movies: response };
    }
    catch (err) {
        return { error: err };
    }
};
exports.GetMoviesMinimum = GetMoviesMinimum;
const CountMovies = async () => {
    try {
        const totalNbMovies = await movie_1.Movie.countDocuments({});
        return { count: totalNbMovies };
    }
    catch (err) {
        return { error: err };
    }
};
exports.CountMovies = CountMovies;
