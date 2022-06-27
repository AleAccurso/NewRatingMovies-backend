"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInDB = exports.updateMetaData = exports.deleteMovieById = exports.updateMovieById = exports.getMovieById = exports.addMovie = exports.getMovies = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const movieModel_1 = require("../models/movieModel");
const userModel_1 = require("../models/userModel");
const responseMessages_1 = require("../contants/responseMessages");
const console_1 = __importDefault(require("console"));
const child_process_1 = require("child_process");
dotenv_1.default.config();
//get movies
const getMovies = async (req, res, next) => {
    const pageInt = parseInt(req.query.page);
    const sizeInt = parseInt(req.query.size);
    const data = req.query.data;
    const totalNbMovies = await movieModel_1.Movie.countDocuments({});
    let dataToSend = {
        nbMovies: totalNbMovies,
    };
    if (!isNaN(pageInt) && !isNaN(sizeInt)) {
        if (data == 'full') {
            const movies = movieModel_1.Movie.find()
                .skip(pageInt * sizeInt)
                .limit(sizeInt)
                .exec((err, movies) => {
                if (err) {
                    res.status(500).send({ message: responseMessages_1.msg.SERVER_ERROR });
                }
                else if (movies) {
                    dataToSend['movies'] = movies;
                    res.status(200).json(dataToSend);
                }
            });
        }
        else if (data == 'admin') {
            const movies = movieModel_1.Movie.find()
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
                if (err) {
                    res.status(500).send({ message: responseMessages_1.msg.SERVER_ERROR });
                }
                else if (movies) {
                    dataToSend['movies'] = movies;
                    res.status(200).json(dataToSend);
                }
            });
        }
        else if (data == 'min') {
            const movies = movieModel_1.Movie.find()
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
                    dataToSend['movies'] = movies;
                    res.status(200).json(dataToSend);
                }
            });
        }
        else {
            res.status(400).json({ message: responseMessages_1.msg.BAD_PARAMS + 'data' });
        }
    }
    else {
        res.status(400).json({ message: responseMessages_1.msg.BAD_PARAMS + 'page_size' });
    }
};
exports.getMovies = getMovies;
//Add a movie
const addMovie = async (req, res, next) => {
    let movie = new movieModel_1.Movie({
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
    const movies = movieModel_1.Movie.findOne({ _id: req.params.id }, (err, movie) => {
        if (err) {
            res.status(404).send({ message: responseMessages_1.msg.RESOURCE_NOT_FOUND + 'movie' });
        }
        else if (movies) {
            res.status(200).json(movie);
        }
    });
};
exports.getMovieById = getMovieById;
//Update a movie
const updateMovieById = async (req, res, next) => {
    const movie = movieModel_1.Movie.findOneAndUpdate({ _id: req.params.id }, {
        ...req.body,
    }, (err) => {
        if (err) {
            res.status(500).send({ message: responseMessages_1.msg.SERVER_ERROR });
        }
        else {
            res.status(200).json(req.body);
        }
    });
};
exports.updateMovieById = updateMovieById;
//Delete movie from DB
const deleteMovieById = async (req, res, next) => {
    idToRemove = req.params.id;
    const movies = movieModel_1.Movie.findOne({ _id: idToRemove }, (err, movie) => {
        if (err) {
            res.status(404).send({ message: responseMessages_1.msg.RESOURCE_NOT_FOUND + 'movie' });
        }
        else if (movie) {
            // Remove movie if movie in favorite and/or rate of a user
            userModel_1.User.find()
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
            movieModel_1.Movie.deleteOne({ id: idToRemove }, (err) => {
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
    const movies = movieModel_1.Movie.findOne({ movieDbId: req.params.movieDBId }, (err, movie) => {
        if (err) {
            res.status(404).send({
                message: responseMessages_1.msg.RESOURCE_NOT_FOUND + 'movie',
            });
        }
        else if (movies) {
            res.status(200).json(movie);
        }
    });
};
exports.isInDB = isInDB;
