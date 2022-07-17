"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInDB = exports.updateMetaData = exports.deleteMovieById = exports.updateMovieById = exports.getMovieById = exports.addMovie = exports.getMovies = void 0;
const console_1 = __importDefault(require("console"));
const child_process_1 = require("child_process");
const constants_1 = require("@constants/constants");
const httpCode_1 = require("@enums/httpCode");
const requestType_1 = require("@enums/requestType");
const movie_1 = require("@schema/movie");
const user_1 = require("@schema/user");
const MovieUseCase = __importStar(require("@usecases/movie"));
const httpException_1 = __importDefault(require("@exceptions/httpException"));
const error_1 = __importDefault(require("@middelwares/error"));
const parseToRequestType_1 = require("@utils/parseToRequestType");
const parseToInt_1 = require("@utils/parseToInt");
const parseToMongoId_1 = require("@utils/parseToMongoId");
//get movies
const getMovies = async (req, res, next) => {
    try {
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
        if (pageInt < 0 || sizeInt < 1) {
            pageInt = 0;
            sizeInt = 5;
        }
        let requestType = requestType_1.RequestTypeEnum.UNKNOWN;
        if (req && req.query && req.query.data) {
            const parseData = (0, parseToRequestType_1.ToRequestType)(req.query.data);
            if (parseData === requestType_1.RequestTypeEnum.UNKNOWN) {
                res.status(400).json({ message: constants_1.msg.BAD_PARAMS + req.query.data });
            }
            else {
                requestType = parseData;
            }
        }
        const movies = await MovieUseCase.getMovies(pageInt, sizeInt, requestType);
        if (typeof movies != 'undefined') {
            res.status(httpCode_1.HttpCode.OK).json(movies);
            return Promise.resolve(movies);
        }
        else {
            return Promise.reject([]);
        }
    }
    catch (error) {
        (0, error_1.default)(error, req, res, next);
    }
};
exports.getMovies = getMovies;
//Add a movie
const addMovie = (req, res, next) => {
    let movie = new movie_1.Movie({
        ...req.body,
    });
    movie
        .save()
        .then(() => {
        res.status(201).json({ message: constants_1.msg.SUCCESS_ACTION + 'add_movie' });
        next();
    })
        .catch((error) => res.status(400).json({ message: error }));
};
exports.addMovie = addMovie;
//Get movie by its id
const getMovieById = (req, res, next) => {
    if (req && req.query && req.query.id) {
        const parseResult = (0, parseToMongoId_1.parseToMongoId)(req.query.page);
        if (!parseResult.parsedId && typeof parseResult.error != 'undefined') {
            throw new httpException_1.default(httpCode_1.HttpCode.BAD_REQUEST, parseResult.error);
        }
        else {
            const movies = movie_1.Movie.findOne({ _id: parseResult.parsedId }, (err, movie) => {
                if (err) {
                    res.status(404).send({
                        message: constants_1.msg.RESOURCE_NOT_FOUND + 'movie',
                    });
                }
                else if (movie) {
                    res.status(200).json(movie);
                }
            });
        }
    }
    else {
        throw new httpException_1.default(httpCode_1.HttpCode.BAD_REQUEST, constants_1.msg.MISSING_PARAM + "id");
    }
};
exports.getMovieById = getMovieById;
//Update a movie
const updateMovieById = (req, res, next) => {
    const newData = req.body;
    const movie = movie_1.Movie.findOneAndUpdate({ _id: req._id }, {
        ...newData,
    }, null, (err) => {
        if (err) {
            res.status(500).send({ message: constants_1.msg.SERVER_ERROR });
        }
        else {
            res.status(200).json(movie);
        }
    });
};
exports.updateMovieById = updateMovieById;
//Delete movie from DB
const deleteMovieById = (req, res, next) => {
    const movies = movie_1.Movie.findOne({ _id: req._id }, (err, movie) => {
        if (err) {
            res.status(404).send({
                message: constants_1.msg.RESOURCE_NOT_FOUND + 'movie',
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
                    res.status(500).send({ message: constants_1.msg.SERVER_ERROR });
                }
                else {
                    res.status(200).json({
                        message: constants_1.msg.SUCCESS_ACTION + 'delete_movie',
                        deletedId: movie._id,
                    });
                }
            });
        }
    });
};
exports.deleteMovieById = deleteMovieById;
//Change metadata
const updateMetaData = (req, res, next) => {
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
                    message: constants_1.msg.SUCCESS_ACTION + 'update_metadata',
                });
            }
        });
    }
    else {
        res.status(400).json({ message: constants_1.msg.BAD_DATA + 'mkv_required' });
    }
};
exports.updateMetaData = updateMetaData;
// Checks if a movie with the concerned movieDBId is in DB
const isInDB = (req, res, next) => {
    const movies = movie_1.Movie.findOne({ movieDbId: req._movieDbId }, (err, movie) => {
        if (err) {
            res.status(404).send({
                message: constants_1.msg.RESOURCE_NOT_FOUND + 'movie',
            });
        }
        else if (movie) {
            res.status(200).json(movie);
        }
    });
};
exports.isInDB = isInDB;
