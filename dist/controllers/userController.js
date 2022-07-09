"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserFavorite = exports.getUserFavorites = exports.updateUserRate = exports.deleteUserById = exports.updateUserById = exports.getUserById = exports.getUsers = void 0;
const user_1 = require("../schema/user");
const movie_1 = require("../schema/movie");
const responseMessages_1 = require("../contants/responseMessages");
const userPicController_1 = require("./userPicController");
const util_1 = __importDefault(require("util"));
const mongodb_1 = require("mongodb");
//Update user - To manage formData
const Multer = require('multer');
const upload = Multer({
    storage: Multer.MemoryStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // Maximum file size is 2MB
    },
}).single('avatar');
const getUsers = async (req, res, next) => {
    const pageInt = req._page;
    const sizeInt = req._size;
    const user = user_1.User.find()
        .skip(pageInt * sizeInt)
        .limit(sizeInt)
        .exec((err, users) => {
        if (err) {
            res.status(500).send({ message: responseMessages_1.msg.SERVER_ERROR });
        }
        else if (users) {
            res.status(200).json(users);
        }
    });
};
exports.getUsers = getUsers;
//Get a user
const getUserById = async (req, res, next) => {
    let userId = req._userId;
    let isAdmin = req._userAdmin;
    if (isAdmin || userId == req._id) {
        const user = user_1.User.findOne({ _id: req._id }, (err, user) => {
            if (err) {
                res.status(404).send({
                    message: responseMessages_1.msg.RESOURCE_NOT_FOUND + 'user',
                });
            }
            else if (user) {
                res.status(200).json(user);
            }
        });
    }
    else {
        res.status(403).send({ message: responseMessages_1.authMsg.UNAUTHORIZED });
    }
};
exports.getUserById = getUserById;
//update a user
const updateUserById = async (req, res, next) => {
    let fileToUpload = req.file;
    let body = req.body;
    let userId = req._userId;
    let isAdmin = req._userAdmin;
    if (isAdmin || userId == req._id) {
        // Manage File in the update request
        if (fileToUpload) {
            // Remove old file
            const remove = await (0, userPicController_1.removeOldPic)(req._id);
            // Get a new filename for the file
            let newfilename = Math.round(new Date().getTime());
            let ext = req.file.mimetype.split('/')[1];
            req.file.originalname = newfilename + '.' + ext;
            body.profilePic = newfilename + '.' + ext;
            // Send file to Google Cloud Storage
            try {
                await util_1.default.promisify(upload);
                const uploaded = await (0, userPicController_1.uploadPic)(req, res);
            }
            catch (error) {
                res.status(500).send({ message: error.message });
            }
        }
        // Manage text field of the update request
        user_1.User.findOneAndUpdate({ _id: req.params.id }, {
            ...body,
        }, (err) => {
            if (err) {
                res.status(500).send({ message: responseMessages_1.msg.SERVER_ERROR });
            }
            else {
                res.status(200).json(req.body);
            }
        });
    }
    else {
        res.status(403).send({ message: responseMessages_1.authMsg.UNAUTHORIZED });
    }
};
exports.updateUserById = updateUserById;
//Delete a user
const deleteUserById = async (req, res, next) => {
    let userId = req._id;
    let userRole = req._userAdmin;
    if (userRole || userId == req._id) {
        const user = user_1.User.findOne({ _id: req._id }, (err, user) => {
            if (err) {
                res.status(404).send({
                    message: responseMessages_1.msg.RESOURCE_NOT_FOUND + 'user',
                });
            }
            else if (user) {
                user_1.User.deleteOne({ _id: req.params.id }, (err) => {
                    if (err) {
                        res.status(500).send({ message: responseMessages_1.msg.SERVER_ERROR });
                    }
                    else {
                        res.status(200).json({
                            message: responseMessages_1.msg.SUCCESS_ACTION + 'delete_user',
                        });
                    }
                });
            }
        });
    }
    else {
        res.status(403).send({ message: responseMessages_1.authMsg.UNAUTHORIZED });
    }
};
exports.deleteUserById = deleteUserById;
// Add, modify & remove a rate
const updateUserRate = async (req, res, next) => {
    const user = user_1.User.findOne({ _id: req._id }, (err, user) => {
        if (err) {
            res.status(500).send({ message: responseMessages_1.msg.SERVER_ERROR });
        }
        else if (user) {
            let userChanged = false;
            let index = user.myRates.findIndex((rate) => rate.movieDbId === req._movieDbId);
            if (index > -1) {
                if (req._rate == 0) {
                    user.myRates.splice(index, 1);
                    userChanged = true;
                }
                else if (req._movieDbId && req._rate) {
                    user.myRates[index] = {
                        movieDbId: req._movieDbId,
                        rate: req._rate * 2,
                    };
                    userChanged = true;
                }
            }
            else if (req._movieDbId && req._rate && req._rate > 0) {
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
    });
};
exports.updateUserRate = updateUserRate;
// Get info of favorite movies
const getUserFavorites = async (req, res, next) => {
    const pageInt = parseInt(req.query.page);
    const sizeInt = parseInt(req.query.size);
    let user = await user_1.User.findOne({ _id: req._id }).exec();
    let movies = [];
    await Promise.all(user.myFavorites.map(async (id) => {
        await movie_1.Movie.findOne({ movieDbId: id }).then((movieInfo) => {
            if (movieInfo) {
                movies.push(movieInfo);
            }
        });
    }));
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
exports.getUserFavorites = getUserFavorites;
//Add & remove a favorite
const updateUserFavorite = async (req, res, next) => {
    var _a;
    const id = (_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.id;
    const user = user_1.User.findOne({ _id: new mongodb_1.ObjectId(id) }, (err, user) => {
        if (err) {
            res.status(500).send({ message: responseMessages_1.msg.SERVER_ERROR });
        }
        else if (user && req._movieDbId) {
            let index = user.myFavorites.indexOf(req._movieDbId);
            if (index >= 0) {
                user.myFavorites.splice(index, 1);
            }
            else {
                user.myFavorites.push(req._movieDbId);
            }
            user.save();
            res.status(200).json({ movieDbId: req._movieDbId });
        }
    });
};
exports.updateUserFavorite = updateUserFavorite;
