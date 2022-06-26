import { RequestHandler } from "express";

import { User } from "../models/userModel"
import { Movie } from "../models/movieModel";

import { authMsg, msg } from "../contants/responseMessages";
import { removeOldPic, uploadPic } from "./userPicController";

import util from "util";

//Update user - To manage formData
const Multer = require("multer");
const upload = Multer({
    storage: Multer.MemoryStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // Maximum file size is 2MB
    },
}).single("avatar");

export const getUsers: RequestHandler = async (req, res, next) => {

    const pageInt: number = parseInt(req.query.page as string);
    const sizeInt: number = parseInt(req.query.size as string);

    const user = User
        .find()
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
    let userId = req.params.userId;
    let userRole = req.userRole;

    if (userRole || userId == req.params.id) {
        const user = User.findOne({ _id: req.params.id }, (err: Error, user: User) => {
            if (err) {
                res.status(404).send({
                    message: msg.RESOURCE_NOT_FOUND + "user",
                });
            } else if (user) {
                res.status(200).json(user);
            }
        });
    } else {
        res.status(403).send({ message: authMsg.UNAUTHORIZED });
    }
};

//update a user
export const updateUserById: RequestHandler = async (req, res, next) => {
    let fileToUpload = req.file;
    let body = req.body;

    let userId = req.userId;
    let userRole = req.userRole;

    if (userRole || userId == req.params.id) {
        // Manage File in the update request
        if (fileToUpload) {
            // Remove old file
            const remove = await removeOldPic(req.params.id);

            // Get a new filename for the file
            let newfilename = Math.round(new Date().getTime());
            let ext = req.file.mimetype.split("/")[1];
            req.file.originalname = newfilename + "." + ext;
            body.profilePic = newfilename + "." + ext;

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
            (err) => {
                if (err) {
                    res.status(500).send({ message: msg.SERVER_ERROR });
                } else {
                    res.status(200).json(req.body);
                }
            }
        );
    } else {
        res.status(403).send({ message: authMsg.UNAUTHORIZED });
    }
};

//Delete a user
export const deleteUserById: RequestHandler = async (req, res, next) => {
    let userId = req.userId;
    let userRole = req.userRole;

    if (userRole || userId == req.params.id) {
        const user = User.findOne({ _id: req.params.id }, (err: Error, user: User) => {
            if (err) {
                res.status(404).send({
                    message: msg.RESOURCE_NOT_FOUND + "user",
                });
            } else if (user) {
                User.deleteOne({ _id: req.params.id }, (err) => {
                    if (err) {
                        res.status(500).send({ message: msg.SERVER_ERROR });
                    } else {
                        res.status(200).json({
                            message: msg.SUCCESS_ACTION + "delete_user",
                        });
                    }
                });
            }
        });
    } else {
        res.status(403).send({ message: authMsg.UNAUTHORIZED });
    }
};

// Add, modify & remove a rate
export const updateUserRate: RequestHandler = async (req, res, next) => {
    const user = User.findOne({ _id: req.params.id }, (err: Error, user: User) => {
        if (err) {
            res.status(500).send({ message: msg.SERVER_ERROR });
        } else if (user) {
            let userChanged = false;
            let index = user.myRates.findIndex(
                (rate) => rate.movieDbId === req.params.movieDbId
            );

            if (index > -1) {
                if (req.params.rate == 0) {
                    user.myRates.splice(index, 1);
                    userChanged = true;
                } else {
                    user.myRates[index] = {
                        movieDbId: req.params.movieDbId,
                        rate: req.params.rate * 2,
                    };
                    userChanged = true;
                }
            } else if (req.params.rate > 0) {
                user.myRates.push({
                    movieDbId: req.params.movieDbId,
                    rate: req.params.rate * 2,
                });
                userChanged = true;
            }

            if (userChanged) {
                user.save();
            }

            res.status(200).json({
                movieDbId: req.params.movieDbId,
                rate: req.params.rate * 2,
            });
        }
    });
};

// Get info of favorite movies
export const getUserFavorites: RequestHandler = async (req, res, next) => {
    
    const pageInt: number = parseInt(req.query.page as string);
    const sizeInt: number = parseInt(req.query.size as string);

    let user = await User.findOne({ _id: req.params.id }).exec();

    let movies: Movie[] = [];

    await Promise.all(
        user.myFavorites.map(async (id) => {
            await Movie.findOne({ movieDbId: id }).then((movieInfo: Movie) => {
                if (movieInfo) {
                    movies.push(movieInfo);
                }
            });
        })
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
    const user = User.findOne({ _id: req.params.id }, (err: Error, user: User) => {
        if (err) {
            res.status(500).send({ message: msg.SERVER_ERROR });
        } else if (user) {
            let index = user.myFavorites.indexOf(req.params.movieDbId);
            if (index >= 0) {
                user.myFavorites.splice(index, 1);
            } else {
                user.myFavorites.push(req.params.movieDbId);
            }

            user.save();
            res.status(200).json({ movieDbId: req.params.movieDbId });
        }
    });
};
