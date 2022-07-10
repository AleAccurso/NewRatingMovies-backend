import { RequestHandler } from 'express';

import { User } from '../schema/user';
import { Movie } from '../schema/movie';

import { CallbackError, Schema } from 'mongoose';
import IMovie from '../models/movie';
import UserReqUpdateDTO from "../dto/userReqUpdateDTO"

import { authMsg, msg } from '../contants/responseMessages';
import { removeOldPic, uploadPic } from './userPicController';

import util from 'util';
import IUser from '../models/user';
import { ObjectId } from 'mongodb';
import { FileRequest } from '../interfaces/file';

//Update user - To manage formData
const Multer = require('multer');
const upload = Multer({
    storage: Multer.MemoryStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // Maximum file size is 2MB
    },
}).single('avatar');

export const getUsers: RequestHandler = async (req, res, next) => {
    const page = req?._page;
    const size = req?._size;

    if (typeof page != "undefined" && typeof size != "undefined"){
        const user = User.find()
            .skip(page * size)
            .limit(size)
            .exec((err, users) => {
                if (err) {
                    res.status(500).send({ message: msg.SERVER_ERROR });
                } else if (users) {
                    res.status(200).json(users);
                }
            });
    } else {
        res.status(400).json({ message: msg.BAD_PARAMS + 'page_size' });
    }
};

//Get a user
export const getUserById: RequestHandler = async (req, res, next) => {
    const userId = req._userId;
    let isAdmin = req._userAdmin;

    if (isAdmin || userId == req._id) {
        const user = User.findOne(
            { _id: req._id },
            (err: Error, user: IUser) => {
                if (err) {
                    res.status(404).send({
                        message: msg.RESOURCE_NOT_FOUND + 'user',
                    });
                } else if (user) {
                    res.status(200).json(user);
                }
            },
        );
    } else {
        res.status(403).send({ message: authMsg.UNAUTHORIZED });
    }
};

//update a user
export const updateUserById: RequestHandler = async (req, res, next) => {
    let fileToUpload = req.file as FileRequest;
    let body = req.body as UserReqUpdateDTO;

    let userId = req._userId;
    let isAdmin = req._userAdmin;

    if (isAdmin || userId == req._id) {
        // Manage File in the update request
        if (fileToUpload) {
            // Remove old file
            const remove = await removeOldPic(req, res, next);

            // Get a new filename for the file
            let newfilename = Math.round(new Date().getTime());
            let ext = fileToUpload.mimetype.split('/')[1];
            fileToUpload.originalname = newfilename + '.' + ext;
            body.profilePic = newfilename + '.' + ext;

            // Send file to Google Cloud Storage
            try {
                util.promisify(upload);
                uploadPic(req, res, next);
            } catch (err) {
                res.status(500).send({ message: err });
            }
        }

        // Manage text field of the update request
        User.findOneAndUpdate(
            { _id: req.params.id },
            {
                ...body,
            },
            null,
            (err:CallbackError) => {
                if (err) {
                    res.status(500).send({ message: msg.SERVER_ERROR });
                } else {
                    res.status(200).json(req.body);
                }
            },
        );
    } else {
        res.status(403).send({ message: authMsg.UNAUTHORIZED });
    }
};

//Delete a user
export const deleteUserById: RequestHandler = async (req, res, next) => {
    let userId = req._id;
    let userRole = req._userAdmin;

    if (userRole || userId == req._id) {
        const user = User.findOne(
            { _id: req._id },
            (err: Error, user: IUser) => {
                if (err) {
                    res.status(404).send({
                        message: msg.RESOURCE_NOT_FOUND + 'user',
                    });
                } else if (user) {
                    User.deleteOne({ _id: req.params.id }, (err) => {
                        if (err) {
                            res.status(500).send({ message: msg.SERVER_ERROR });
                        } else {
                            res.status(200).json({
                                message: msg.SUCCESS_ACTION + 'delete_user',
                            });
                        }
                    });
                }
            },
        );
    } else {
        res.status(403).send({ message: authMsg.UNAUTHORIZED });
    }
};

// Add, modify & remove a rate
export const updateUserRate: RequestHandler = async (req, res, next) => {
    const user = User.findOne(
        { _id: req._id },
        null,
        (err, user) => {
            if (err) {
                res.status(500).send({ message: msg.SERVER_ERROR });
            } else if (user) {
                let userChanged = false;
                let index = user.myRates.findIndex(
                    (rate) => rate.movieDbId === req._movieDbId,
                );

                if (index > -1) {
                    if (req._rate == 0) {
                        user.myRates.splice(index, 1);
                        userChanged = true;
                    } else if (req._movieDbId && req._rate) {
                        user.myRates[index] = {
                            movieDbId: req._movieDbId,
                            rate: req._rate * 2,
                        };
                        userChanged = true;
                    }
                } else if (req._movieDbId && req._rate && req._rate > 0) {
                    user.myRates.push({
                        movieDbId: req._movieDbId,
                        rate: req._rate * 2,
                    });
                    userChanged = true;
                }

                if (userChanged) {
                    user.save();
                }

                res.status(200).json({
                    movieDbId: req._movieDbId,
                    rate: (typeof req._rate != 'undefined'? req._rate : 0) * 2,
                });
            }
        },
    );
};

// Get info of favorite movies
export const getUserFavorites: RequestHandler = async (req, res, next) => {
    const page = req._page;
    const size = req._size;

    let user = await User.findOne({ _id: req._id }).exec();

    let movies = [] as IMovie[];
    
    if (user) {
        await Promise.all(
            user.myFavorites.map(async (id) => {
                const movie = await Movie.findOne({ movieDbId: id });
                if (movie) {
                    movies.push(movie);
                };
            }),
        );
    }

    let nbMovies = movies.length;

    if (page && size) {
        movies = movies.slice(page * size, size + page * size);
    }

    const toReturn = {
        nbFavorites: nbMovies,
        page: page,
        perPage: size,
        movies: movies,
    };

    res.status(200).json(toReturn);
};

//Add & remove a favorite
export const updateUserFavorite: RequestHandler = async (req, res, next) => {
    const id = req?.params?.id;

    const user = User.findOne(
        { _id: new ObjectId(id) },
        (err: Error, user: IUser) => {
            if (err) {
                res.status(500).send({ message: msg.SERVER_ERROR });
            } else if (user && req._movieDbId) {
                let index = user.myFavorites.indexOf(req._movieDbId);
                if (index >= 0) {
                    user.myFavorites.splice(index, 1);
                } else {
                    user.myFavorites.push(req._movieDbId);
                }

                user.save();
                res.status(200).json({ movieDbId: req._movieDbId });
            }
        },
    );
};
