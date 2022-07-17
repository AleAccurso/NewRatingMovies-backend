import { RequestHandler } from 'express';

import console from 'console';
import { exec } from 'child_process';

import { msg } from 'constants/constants';
import { HttpCode } from 'enums/httpCode';

import IMovie from 'models/movie';
import IUser from 'models/user';

import { RequestTypeEnum } from 'enums/requestType';

import UserReqUpdateDTO from 'dto/userReqUpdateDTO';
import MoviePagingDTO from 'dto/moviePagingDTO';

import { Movie } from 'schema/movie';
import { User } from 'schema/user';

import * as MovieUseCase from 'usecases/movie'
import HttpException from 'exceptions/httpException';
import sendError from 'middelwares/error';

import { ToRequestType } from 'utils/parseToRequestType';
import { parseToInt } from 'utils/parseToInt';
import { parseToMongoId } from 'utils/parseToMongoId';

//get movies
export const getMovies: RequestHandler = async(req, res, next): Promise<MoviePagingDTO> => {
    try {
        let pageInt: number = -1;
    
        if (req && req.query && req.query.page) {
            const parseResult = parseToInt(req.query.page as string);
    
            if (parseResult.error || typeof parseResult.parsedInt == 'undefined') {
                res.status(400).json({ message: parseResult.error });
            } else {
                pageInt = parseResult.parsedInt;
            }
        }
    
        let sizeInt: number = -1;
    
        if (req && req.query && req.query.size) {
            const parseResult = parseToInt(req.query.size as string);
    
            if (parseResult.error || typeof parseResult.parsedInt == 'undefined') {
                res.status(400).json({ message: parseResult.error });
            } else {
                sizeInt = parseResult.parsedInt;
            }
        }
    
        if (pageInt < 0 || sizeInt < 1 ) {
            pageInt = 0;
            sizeInt = 5;
        }
    
        let requestType = RequestTypeEnum.UNKNOWN;
    
        if (req && req.query && req.query.data) {
            const parseData = ToRequestType(req.query.data as string)
    
            if (parseData === RequestTypeEnum.UNKNOWN) {
                res.status(400).json({ message: msg.BAD_PARAMS + req.query.data });
            } else {
                requestType = parseData;
            }
        }
        
        const movies = await MovieUseCase.getMovies(pageInt, sizeInt, requestType);
        
        if (typeof movies != 'undefined') {
            res.status(HttpCode.OK).json(movies);
            return Promise.resolve(movies);
        } else {
            return Promise.reject([] as IMovie[]);
        }
    } catch (error) {
        sendError(error as HttpException, req, res, next)
    }
};

//Add a movie
export const addMovie: RequestHandler = (req, res, next) => {
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
export const getMovieById: RequestHandler = (req, res, next) => {

    if (req && req.query && req.query.id) {

        const parseResult = parseToMongoId(req.query.page as string);

        if (!parseResult.parsedId && typeof parseResult.error != 'undefined') {
            throw new HttpException(HttpCode.BAD_REQUEST, parseResult.error)
        } else {
            const movies = Movie.findOne(
                { _id: parseResult.parsedId },
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
        }
    } else {
        throw new HttpException(HttpCode.BAD_REQUEST, msg.MISSING_PARAM+"id")
    }
};

//Update a movie
export const updateMovieById: RequestHandler = (req, res, next) => {
    
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
export const deleteMovieById: RequestHandler = (req, res, next) => {
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
export const updateMetaData: RequestHandler = (req, res, next) => {
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
export const isInDB: RequestHandler = (req, res, next) => {
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
