"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInDB = exports.updateMetaData = exports.deleteMovieById = exports.updateMovieById = exports.getMovieById = exports.addMovie = exports.getMovies = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const responseMessages_1 = require("../contants/responseMessages");
const console_1 = __importDefault(require("console"));
const child_process_1 = require("child_process");
const movie_1 = require("../schema/movie");
const user_1 = require("../schema/user");
const parseToInt_1 = require("../utils/parseToInt");
const requestType_1 = require("../enums/requestType");
const parseToRequestType_1 = require("../utils/parseToRequestType");
dotenv_1.default.config();
//get movies
const getMovies = async (req, res, next) => {
    let pageInt = -1;
    if (req && req.query && req.query.page) {
        const parseResult = (0, parseToInt_1.parseToInt)(req.query.page);
        if (parseResult.error || typeof parseResult.parsedInt == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        }
        else {
            pageInt = parseResult.parsedInt;
        }
    }
    let sizeInt = -1;
    if (req && req.query && req.query.size) {
        const parseResult = (0, parseToInt_1.parseToInt)(req.query.size);
        if (parseResult.error || typeof parseResult.parsedInt == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        }
        else {
            sizeInt = parseResult.parsedInt;
        }
    }
    let dataType = requestType_1.RequestTypeEnum.UNKNOWN;
    if (req && req.query && req.query.data) {
        const parseData = (0, parseToRequestType_1.ToRequestType)(req.query.data);
        if (parseData === requestType_1.RequestTypeEnum.UNKNOWN) {
            res.status(400).json({ message: responseMessages_1.msg.BAD_PARAMS + req.query.data });
        }
        else {
            dataType = parseData;
        }
    }
    const totalNbMovies = await movie_1.Movie.countDocuments({});
    let dataToSend = {
        nbMovies: totalNbMovies,
    };
    if (dataType == requestType_1.RequestTypeEnum.FULL) {
        const movies = movie_1.Movie.find()
            .skip(pageInt * sizeInt)
            .limit(sizeInt)
            .exec((err, movies) => {
            if (movies) {
                dataToSend.movies = movies;
                res.status(200).json(dataToSend);
            }
            else {
                res.status(500).send({ message: responseMessages_1.msg.SERVER_ERROR });
            }
        });
    }
    else if (dataType == requestType_1.RequestTypeEnum.ADMIN) {
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
            .skip(pageInt * sizeInt)
            .limit(sizeInt)
            .exec((err, movies) => {
            if (movies) {
                dataToSend.movies = movies;
                res.status(200).json(dataToSend);
            }
            else {
                res.status(500).send({ message: responseMessages_1.msg.SERVER_ERROR });
            }
        });
    }
    else if (dataType == requestType_1.RequestTypeEnum.MINIMUM) {
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
            .skip(pageInt * sizeInt)
            .limit(sizeInt)
            .exec((err, movies) => {
            if (err) {
                res.status(500).send({ message: responseMessages_1.msg.SERVER_ERROR });
            }
            else if (movies) {
                dataToSend.movies = movies;
                res.status(200).json(dataToSend);
            }
        });
    }
};
exports.getMovies = getMovies;
//Add a movie
const addMovie = async (req, res, next) => {
    let movie = new movie_1.Movie({
        ...req.body,
    });
    movie
        .save()
        .then(() => {
        res.status(201).json({ message: responseMessages_1.msg.SUCCESS_ACTION + 'add_movie' });
        next();
    })
        .catch((error) => res.status(400).json({ message: error }));
};
exports.addMovie = addMovie;
//Get movie by its id
const getMovieById = async (req, res, next) => {
    const movies = movie_1.Movie.findOne({ _id: req._id }, (err, movie) => {
        if (err) {
            res.status(404).send({
                message: responseMessages_1.msg.RESOURCE_NOT_FOUND + 'movie',
            });
        }
        else if (movie) {
            res.status(200).json(movie);
        }
    });
};
exports.getMovieById = getMovieById;
//Update a movie
const updateMovieById = async (req, res, next) => {
    const newData = req.body;
    const movie = movie_1.Movie.findOneAndUpdate({ _id: req._id }, {
        ...newData,
    }, null, (err) => {
        if (err) {
            res.status(500).send({ message: responseMessages_1.msg.SERVER_ERROR });
        }
        else {
            res.status(200).json(movie);
        }
    });
};
exports.updateMovieById = updateMovieById;
//Delete movie from DB
const deleteMovieById = async (req, res, next) => {
    const movies = movie_1.Movie.findOne({ _id: req._id }, (err, movie) => {
        if (err) {
            res.status(404).send({
                message: responseMessages_1.msg.RESOURCE_NOT_FOUND + 'movie',
            });
        }
        else if (movie) {
            // Remove movie if movie in favorite and/or rate of a user
            user_1.User.find()
                .cursor()
                .eachAsync((user) => {
                // Favorites
                if (user.myFavorites.includes(movie.movieDbId)) {
                    const index = user.myFavorites.indexOf(movie.movieDbId);
                    if (index > -1) {
                        user.myFavorites.splice(index, 1);
                    }
                }
                //Rates
                for (let i = 0; i < user.myRates.length; i++) {
                    if (user.myRates[i].movieDbId == movie.movieDbId) {
                        user.myRates.splice(i, 1);
                    }
                }
            });
            // Remove movie from DB
            movie_1.Movie.deleteOne({ id: req._id }, (err) => {
                if (err) {
                    res.status(500).send({ message: responseMessages_1.msg.SERVER_ERROR });
                }
                else {
                    res.status(200).json({
                        message: responseMessages_1.msg.SUCCESS_ACTION + 'delete_movie',
                        deletedId: movie._id,
                    });
                }
            });
        }
    });
};
exports.deleteMovieById = deleteMovieById;
//Change metadata
const updateMetaData = async (req, res, next) => {
    const job = req.body;
    //Get file extension
    const format = job.format.substring(job.format.indexOf('/') + 1);
    //Change title in metadata
    if (format === 'x-matroska') {
        console_1.default.log(`mkvpropedit "${job.path}" -e info -s title="${job.selectedMovie.title}"`);
        (0, child_process_1.exec)(`mkvpropedit "${job.path}" -e info -s title="${job.selectedMovie.title}"`, (error, stdout, stderr) => {
            if (error) {
                // console.log(`error: ${error.message}`);
                // return;
                res.status(500).json({ message: error.message });
            }
            if (stderr) {
                // console.log(`stderr: ${stderr}`);
                // return;
                res.status(400).json({ message: stderr });
            }
            if (stdout) {
                console_1.default.log(stdout);
                res.status(200).json({
                    message: responseMessages_1.msg.SUCCESS_ACTION + 'update_metadata',
                });
            }
        });
    }
    else {
        res.status(400).json({ message: responseMessages_1.msg.BAD_DATA + 'mkv_required' });
    }
};
exports.updateMetaData = updateMetaData;
// Checks if a movie with the concerned movieDBId is in DB
const isInDB = async (req, res, next) => {
    const movies = movie_1.Movie.findOne({ movieDbId: req._movieDbId }, (err, movie) => {
        if (err) {
            res.status(404).send({
                message: responseMessages_1.msg.RESOURCE_NOT_FOUND + 'movie',
            });
        }
        else if (movie) {
            res.status(200).json(movie);
        }
    });
};
exports.isInDB = isInDB;
