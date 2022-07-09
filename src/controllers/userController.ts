import { RequestHandler } from 'express';

import { User } from '../schema/user';
import { Movie } from '../schema/movie';

import { Schema } from 'mongoose';
import IMovie from '../models/movie';
import UserReqUpdateDTO from "../dto/userReqUpdateDTO"

import { authMsg, msg } from '../contants/responseMessages';
import { removeOldPic, uploadPic } from './userPicController';

import util from 'util';
import IUser from '../models/user';
import { ObjectId } from 'mongodb';

//Update user - To manage formData
const Multer = require('multer');
const upload = Multer({
    storage: Multer.MemoryStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // Maximum file size is 2MB
    },
}).single('avatar');

export const getUsers: RequestHandler = async (req, res, next) => {
    const pageInt = req._page;
    const sizeInt = req._size;

    const user = User.find()
        .skip(pageInt * sizeInt)
        .limit(sizeInt)
        .exec((err, users) => {
            if (err) {
                res.status(500).send({ message: msg.SERVER_ERROR });
            } else if (users) {
                res.status(200).json(users);
            }
        });
};

//Get a user
export const getUserById: RequestHandler = async (req, res, next) => {
    let userId = req._userId;
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
    let fileToUpload = req.file;
    let body:UserReqUpdateDTO = req.body;

    let userId = req._userId;
    let isAdmin = req._userAdmin;

    if (isAdmin || userId == req._id) {
        // Manage File in the update request
        if (fileToUpload) {
            // Remove old file
            const remove = await removeOldPic(req._id);

            // Get a new filename for the file
            let newfilename = Math.round(new Date().getTime());
            let ext = req.file.mimetype.split('/')[1];
            req.file.originalname = newfilename + '.' + ext;
            body.profilePic = newfilename + '.' + ext;

            // Send file to Google Cloud Storage
            try {
                await util.promisify(upload);
                const uploaded = await uploadPic(req, res);
            } catch (error: Error) {
                res.status(500).send({ message: error.message });
            }
        }

        // Manage text field of the update request
        User.findOneAndUpdate(
            { _id: req.params.id },
            {
                ...body,
            },
            (err: Error) => {
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
        (err: Error, user: IUser) => {
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
                    rate: req._rate * 2,
                });
            }
        },
    );
};

// Get info of favorite movies
export const getUserFavorites: RequestHandler = async (req, res, next) => {
    const pageInt: number = parseInt(req.query.page as string);
    const sizeInt: number = parseInt(req.query.size as string);

    let user = await User.findOne({ _id: req._id }).exec();

    let movies = [] as Schema<IMovie>[];

    await Promise.all(
        user.myFavorites.map(async (id) => {
            await Movie.findOne({ movieDbId: id }).then(
                (movieInfo) => {
                    if (movieInfo) {
                        movies.push(movieInfo);
                    }
                },
            );
        }),
    );

    let nbMovies = movies.length;

    movies = movies.slice(pageInt * sizeInt, sizeInt + pageInt * sizeInt);

    const toReturn = {
        nbFavorites: nbMovies,
        page: pageInt,
        perPage: sizeInt,
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
