import { RequestHandler } from 'express';
import dotenv from 'dotenv';

import { Movie } from '../models/movieModel';
import { User } from '../models/userModel';

import { msg } from '../contants/responseMessages';

import console from "console"

import { exec } from 'child_process';

dotenv.config();

//get movies
export const getMovies: RequestHandler = async (req, res, next) => {

    const pageInt: number = parseInt(req.query.page as string);
    const sizeInt: number = parseInt(req.query.size as string);

    const data = req.query.data;

    const totalNbMovies:number = await Movie.countDocuments({});

    let dataToSend = {
        nbMovies: totalNbMovies,
    };

    if (!isNaN(pageInt) && !isNaN(sizeInt)) {
        if (data == 'full') {
            const movies = Movie.find()
                .skip(pageInt * sizeInt)
                .limit(sizeInt)
                .exec((err, movies: Movie[]]) => {
                    if (err) {
                        res.status(500).send({ message: msg.SERVER_ERROR });
                    } else if (movies) {
                        dataToSend['movies'] = movies;
                        res.status(200).json(dataToSend);
                    }
                });
        } else if (data == 'admin') {
            const movies: Movie[] = Movie.find()
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
                .exec((err: Error, movies: Movie[]) => {
                    if (err) {
                        res.status(500).send({ message: msg.SERVER_ERROR });
                    } else if (movies) {
                        dataToSend['movies'] = movies;
                        res.status(200).json(dataToSend);
                    }
                });
        } else if (data == 'min') {
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
                .exec((err: Error, movies: Movie[]) => {
                    if (err) {
                        res.status(500).send({ message: msg.SERVER_ERROR });
                    } else if (movies) {
                        dataToSend['movies'] = movies;
                        res.status(200).json(dataToSend);
                    }
                });
        } else {
            res.status(400).json({ message: msg.BAD_PARAMS + 'data' });
        }
    } else {
        res.status(400).json({ message: msg.BAD_PARAMS + 'page_size' });
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
    const movies = Movie.findOne({ _id: req.params.id }, (err: Error, movie: Movie) => {
        if (err) {
            res.status(404).send({ message: msg.RESOURCE_NOT_FOUND + 'movie' });
        } else if (movies) {
            res.status(200).json(movie);
        }
    });
};

//Update a movie
export const updateMovieById: RequestHandler = async (req, res, next) => {
    const movie = Movie.findOneAndUpdate(
        { _id: req.params.id },
        {
            ...req.body,
        },
        (err: Error) => {
            if (err) {
                res.status(500).send({ message: msg.SERVER_ERROR });
            } else {
                res.status(200).json(req.body);
            }
        },
    );
};

//Delete movie from DB
export const deleteMovieById: RequestHandler = async (req, res, next) => {
    idToRemove = req.params.id;
    const movies = Movie.findOne({ _id: idToRemove }, (err: Error, movie: Movie) => {
        if (err) {
            res.status(404).send({ message: msg.RESOURCE_NOT_FOUND + 'movie' });
        } else if (movie) {
            // Remove movie if movie in favorite and/or rate of a user
            User.find()
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
            Movie.deleteOne({ id: idToRemove }, (err: Error) => {
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
    });
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
            (error: Error, stdout, stderr) => {
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
        { movieDbId: req.params.movieDBId },
        (err: Error, movie: Movie) => {
            if (err) {
                res.status(404).send({
                    message: msg.RESOURCE_NOT_FOUND + 'movie',
                });
            } else if (movies) {
                res.status(200).json(movie);
            }
        },
    );
};
