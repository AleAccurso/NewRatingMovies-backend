"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFavorite = exports.getFavorites = exports.userRate = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const movieModel_1 = __importDefault(require("../models/movieModel"));
const userPicController_1 = require("./userPicController");
const util = require("util");
const { authMsg, msg } = require("../constants/response_messages");
//Update user - To manage formData
const Multer = require("multer");
const upload = Multer({
    storage: Multer.MemoryStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // Maximum file size is 2MB
    },
}).single("avatar");
const getUsers = async (req, res, next) => {
    pageInt = parseInt(req.query.page);
    sizeInt = parseInt(req.query.size);
    const user = userModel_1.default
        .find()
        .skip(pageInt * sizeInt)
        .limit(sizeInt)
        .exec((err, users) => {
        if (err) {
            res.status(500).send({ message: msg.SERVER_ERROR });
        }
        else if (users) {
            res.status(200).json(users);
        }
    });
};
exports.getUsers = getUsers;
//Get a user
const getUserById = async (req, res, next) => {
    let userId = req.userId;
    let userRole = req.userRole;
    if (userRole || userId == req.params.id) {
        const user = userModel_1.default.findOne({ _id: req.params.id }, (err, user) => {
            if (err) {
                res.status(404).send({
                    message: msg.RESOURCE_NOT_FOUND + "user",
                });
            }
            else if (user) {
                res.status(200).json(user);
            }
        });
    }
    else {
        res.status(403).send({ message: authMsg.UNAUTHORIZED });
    }
};
exports.getUserById = getUserById;
//update a user
const updateUser = async (req, res, next) => {
    let fileToUpload = req.file;
    let body = req.body;
    let userId = req.userId;
    let userRole = req.userRole;
    if (userRole || userId == req.params.id) {
        // Manage File in the update request
        if (fileToUpload) {
            // Remove old file
            const remove = await (0, userPicController_1.removeOldPic)(req.params.id);
            // Get a new filename for the file
            let newfilename = Math.round(new Date().getTime());
            let ext = req.file.mimetype.split("/")[1];
            req.file.originalname = newfilename + "." + ext;
            body.profilePic = newfilename + "." + ext;
            // Send file to Google Cloud Storage
            try {
                await util.promisify(upload);
                const uploaded = await (0, userPicController_1.uploadPic)(req, res);
            }
            catch (error) {
                res.status(500).send({ message: err.message });
            }
        }
        // Manage text field of the update request
        userModel_1.default.findOneAndUpdate({ _id: req.params.id }, {
            ...body,
        }, (err) => {
            if (err) {
                res.status(500).send({ message: msg.SERVER_ERROR });
            }
            else {
                res.status(200).json(req.body);
            }
        });
    }
    else {
        res.status(403).send({ message: authMsg.UNAUTHORIZED });
    }
};
exports.updateUser = updateUser;
//Delete a user
const deleteUser = async (req, res, next) => {
    let userId = req.userId;
    let userRole = req.userRole;
    if (userRole || userId == req.params.id) {
        const user = userModel_1.default.findOne({ _id: req.params.id }, (err, user) => {
            if (err) {
                res.status(404).send({
                    message: msg.RESOURCE_NOT_FOUND + "user",
                });
            }
            else if (user) {
                userModel_1.default.deleteOne({ _id: req.params.id }, (err) => {
                    if (err) {
                        res.status(500).send({ message: msg.SERVER_ERROR });
                    }
                    else {
                        res.status(200).json({
                            message: msg.SUCCESS_ACTION + "delete_user",
                        });
                    }
                });
            }
        });
    }
    else {
        res.status(403).send({ message: authMsg.UNAUTHORIZED });
    }
};
exports.deleteUser = deleteUser;
// Add, modify & remove a rate
const userRate = async (req, res, next) => {
    const user = userModel_1.default.findOne({ _id: req.params.id }, (err, user) => {
        if (err) {
            res.status(500).send({ message: msg.SERVER_ERROR });
        }
        else if (user) {
            let userChanged = false;
            let index = user.myRates.findIndex((rate) => rate.movieDbId === req.params.movieDbId);
            if (index > -1) {
                if (req.params.rate == 0) {
                    user.myRates.splice(index, 1);
                    userChanged = true;
                }
                else {
                    user.myRates[index] = {
                        movieDbId: req.params.movieDbId,
                        rate: req.params.rate * 2,
                    };
                    userChanged = true;
                }
            }
            else if (req.params.rate > 0) {
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
exports.userRate = userRate;
// Get info of favorite movies
const getFavorites = async (req, res, next) => {
    pageInt = parseInt(req.query.page);
    sizeInt = parseInt(req.query.size);
    const user = await userModel_1.default.findOne({ _id: req.params.id }).exec();
    let movies = [];
    await Promise.all(user.myFavorites.map(async (id) => {
        await movieModel_1.default.findOne({ movieDbId: id }).then((movieInfo) => {
            if (movieInfo) {
                movies.push(movieInfo);
            }
        });
    }));
    let nbMovies = movies.length;
    movies = movies.slice(pageInt * sizeInt, sizeInt + pageInt * sizeInt);
    toReturn = {
        nbFavorites: nbMovies,
        page: pageInt,
        perPage: sizeInt,
        movies: movies,
    };
    res.status(200).json(toReturn);
};
exports.getFavorites = getFavorites;
//Add & remove a favorite
const updateFavorite = async (req, res, next) => {
    const user = userModel_1.default.findOne({ _id: req.params.id }, (err, user) => {
        if (err) {
            res.status(500).send({ message: msg.SERVER_ERROR });
        }
        else if (user) {
            let index = user.myFavorites.indexOf(req.params.movieDbId);
            if (index >= 0) {
                user.myFavorites.splice(index, 1);
            }
            else {
                user.myFavorites.push(req.params.movieDbId);
            }
            user.save();
            res.status(200).json({ movieDbId: req.params.movieDbId });
        }
    });
};
exports.updateFavorite = updateFavorite;
