import { RequestHandler } from 'express';
import dotenv from 'dotenv';

import { msg } from '../contants/responseMessages';

import console from 'console';

import { exec } from 'child_process';
import IMovie from '../models/movie';
import IUser from '../models/user';
import { Movie } from '../schema/movie';
import { User } from '../schema/user';
import MoviePagingDTO from '../dto/moviePagingDTO';
import UserReqUpdateDTO from '../dto/userReqUpdateDTO';
import { parseToInt } from '../utils/parseToInt';
import { requestType } from '../types/requestType';

dotenv.config();

//get movies
export const getMovies: RequestHandler = async (req, res, next) => {
    let pageInt: number = -1;

    if (req && req.query && req.query.page) {
        const parseResult = parseToInt(req.query.page as string);

        if (parseResult.error || typeof parseResult.parsedInt == 'undefined') {
            res.status(400).json({ message: msg.BAD_PARAMS + req.query.page });
        } else {
            pageInt = parseResult.parsedInt;
        }
    }

    let sizeInt: number = -1;

    if (req && req.query && req.query.size) {
        const parseResult = parseToInt(req.query.size as string);

        if (parseResult.error || typeof parseResult.parsedInt == 'undefined') {
            res.status(400).json({ message: msg.BAD_PARAMS + req.query.size });
        } else {
            sizeInt = parseResult.parsedInt;
        }
    }

    let dataType: requestType = "unknown" as requestType;

    if (req && req.query && req.query.data) {
        if (process.env.REQUEST_TYPES.includes(req.query.data as string)) {
            dataType = req.query.data as requestType;
        } else {
            res.status(400).json({ message: msg.BAD_PARAMS + req.query.data });
        }
    }

    const totalNbMovies = await Movie.countDocuments({});

    let dataToSend: MoviePagingDTO = {
        nbMovies: totalNbMovies,
    };

    if (typeof dataType != 'undefined' && dataType == 'full') {
        const movies = Movie.find()
            .skip(pageInt * sizeInt)
            .limit(sizeInt)
            .exec((err, movies) => {
                if (movies) {
                    dataToSend.movies = movies;
                    res.status(200).json(dataToSend);
                } else {
                    res.status(500).send({ message: msg.SERVER_ERROR });
                }
            });
    } else if (dataType == 'admin') {
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
            .skip(pageInt * sizeInt)
            .limit(sizeInt)
            .exec((err, movies) => {
                if (movies) {
                    dataToSend.movies = movies;
                    res.status(200).json(dataToSend);
                } else {
                    res.status(500).send({ message: msg.SERVER_ERROR });
                }
            });
    } else if (dataType == 'min') {
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
            .skip(pageInt * sizeInt)
            .limit(sizeInt)
            .exec((err, movies) => {
                if (err) {
                    res.status(500).send({ message: msg.SERVER_ERROR });
                } else if (movies) {
                    dataToSend.movies = movies;
                    res.status(200).json(dataToSend);
                }
            });
    } else {
        res.status(400).json({ message: msg.BAD_PARAMS + 'data' });
    }
};

//Add a movie
export const addMovie: RequestHandler = async (req, res, next) => {
    let movie = new Movie({
        ...req.body,
    });

    movie
        .save()
        .then(() => {
            res.status(201).json({ message: msg.SUCCESS_ACTION + 'add_movie' });
            next();
        })
        .catch((error: Error) => res.status(400).json({ message: error }));
};

//Get movie by its id
export const getMovieById: RequestHandler = async (req, res, next) => {
    const movies = Movie.findOne(
        { _id: req._id },
        (err: Error, movie: IMovie) => {
            if (err) {
                res.status(404).send({
                    message: msg.RESOURCE_NOT_FOUND + 'movie',
                });
            } else if (movie) {
                res.status(200).json(movie);
            }
        },
    );
};

//Update a movie
export const updateMovieById: RequestHandler = async (req, res, next) => {
    const newData = req.body as UserReqUpdateDTO;
    const movie = Movie.findOneAndUpdate(
        { _id: req._id },
        {
            ...newData,
        },
        null,
        (err) => {
            if (err) {
                res.status(500).send({ message: msg.SERVER_ERROR });
            } else {
                res.status(200).json(movie);
            }
        },
    );
};

//Delete movie from DB
export const deleteMovieById: RequestHandler = async (req, res, next) => {
    const movies = Movie.findOne(
        { _id: req._id },
        (err: Error, movie: IMovie) => {
            if (err) {
                res.status(404).send({
                    message: msg.RESOURCE_NOT_FOUND + 'movie',
                });
            } else if (movie) {
                // Remove movie if movie in favorite and/or rate of a user
                User.find()
                    .cursor()
                    .eachAsync((user: IUser) => {
                        // Favorites
                        if (user.myFavorites.includes(movie.movieDbId)) {
                            const index = user.myFavorites.indexOf(
                                movie.movieDbId,
                            );
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
                Movie.deleteOne({ id: req._id }, (err) => {
                    if (err) {
                        res.status(500).send({ message: msg.SERVER_ERROR });
                    } else {
                        res.status(200).json({
                            message: msg.SUCCESS_ACTION + 'delete_movie',
                            deletedId: movie._id,
                        });
                    }
                });
            }
        },
    );
};

//Change metadata
export const updateMetaData: RequestHandler = async (req, res, next) => {
    const job = req.body;

    //Get file extension
    const format = job.format.substring(job.format.indexOf('/') + 1);

    //Change title in metadata
    if (format === 'x-matroska') {
        console.log(
            `mkvpropedit "${job.path}" -e info -s title="${job.selectedMovie.title}"`,
        );

        exec(
            `mkvpropedit "${job.path}" -e info -s title="${job.selectedMovie.title}"`,
            (error, stdout, stderr) => {
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
                    console.log(stdout);
                    res.status(200).json({
                        message: msg.SUCCESS_ACTION + 'update_metadata',
                    });
                }
            },
        );
    } else {
        res.status(400).json({ message: msg.BAD_DATA + 'mkv_required' });
    }
};

// Checks if a movie with the concerned movieDBId is in DB
export const isInDB: RequestHandler = async (req, res, next) => {
    const movies = Movie.findOne(
        { movieDbId: req._movieDbId },
        (err: Error, movie: IMovie) => {
            if (err) {
                res.status(404).send({
                    message: msg.RESOURCE_NOT_FOUND + 'movie',
                });
            } else if (movie) {
                res.status(200).json(movie);
            }
        },
    );
};
