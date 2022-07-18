"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserFavorite = exports.getUserFavorites = exports.updateUserRate = exports.deleteUserById = exports.updateUserById = exports.getUserById = exports.getUsers = void 0;
const util_1 = __importDefault(require("util"));
const mongodb_1 = require("mongodb");
const user_1 = require("@schema/user");
const movie_1 = require("@schema/movie");
const userPicController_1 = require("@controllers/userPicController");
const constants_1 = require("@constants/constants");
//Update user - To manage formData
const Multer = require('multer');
const upload = Multer({
    storage: Multer.MemoryStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // Maximum file size is 2MB
    },
}).single('avatar');
const getUsers = async (req, res, next) => {
    const page = req === null || req === void 0 ? void 0 : req._page;
    const size = req === null || req === void 0 ? void 0 : req._size;
    if (typeof page != "undefined" && typeof size != "undefined") {
        const user = user_1.User.find()
            .skip(page * size)
            .limit(size)
            .exec((err, users) => {
            if (err) {
                res.status(500).send({ message: constants_1.msg.SERVER_ERROR });
            }
            else if (users) {
                res.status(200).json(users);
            }
        });
    }
    else {
        res.status(400).json({ message: constants_1.msg.BAD_PARAMS + 'page_size' });
    }
};
exports.getUsers = getUsers;
//Get a user
const getUserById = async (req, res, next) => {
    const userId = req._userId;
    let isAdmin = req._userAdmin;
    if (isAdmin || userId == req._id) {
        const user = user_1.User.findOne({ _id: req._id }, (err, user) => {
            if (err) {
                res.status(404).send({
                    message: constants_1.msg.RESOURCE_NOT_FOUND + 'user',
                });
            }
            else if (user) {
                res.status(200).json(user);
            }
        });
    }
    else {
        res.status(403).send({ message: constants_1.authMsg.UNAUTHORIZED });
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
            const remove = await (0, userPicController_1.removeOldPic)(req, res, next);
            // Get a new filename for the file
            let newfilename = Math.round(new Date().getTime());
            let ext = fileToUpload.mimetype.split('/')[1];
            fileToUpload.originalname = newfilename + '.' + ext;
            body.profilePic = newfilename + '.' + ext;
            // Send file to Google Cloud Storage
            try {
                util_1.default.promisify(upload);
                (0, userPicController_1.uploadPic)(req, res, next);
            }
            catch (err) {
                res.status(500).send({ message: err });
            }
        }
        // Manage text field of the update request
        user_1.User.findOneAndUpdate({ _id: req.params.id }, {
            ...body,
        }, null, (err) => {
            if (err) {
                res.status(500).send({ message: constants_1.msg.SERVER_ERROR });
            }
            else {
                res.status(200).json(req.body);
            }
        });
    }
    else {
        res.status(403).send({ message: constants_1.authMsg.UNAUTHORIZED });
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
                    message: constants_1.msg.RESOURCE_NOT_FOUND + 'user',
                });
            }
            else if (user) {
                user_1.User.deleteOne({ _id: req.params.id }, (err) => {
                    if (err) {
                        res.status(500).send({ message: constants_1.msg.SERVER_ERROR });
                    }
                    else {
                        res.status(200).json({
                            message: constants_1.msg.SUCCESS_ACTION + 'delete_user',
                        });
                    }
                });
            }
        });
    }
    else {
        res.status(403).send({ message: constants_1.authMsg.UNAUTHORIZED });
    }
};
exports.deleteUserById = deleteUserById;
// Add, modify & remove a rate
const updateUserRate = async (req, res, next) => {
    const user = user_1.User.findOne({ _id: req._id }, null, (err, user) => {
        if (err) {
            res.status(500).send({ message: constants_1.msg.SERVER_ERROR });
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
                rate: (typeof req._rate != 'undefined' ? req._rate : 0) * 2,
            });
        }
    });
};
exports.updateUserRate = updateUserRate;
// Get info of favorite movies
const getUserFavorites = async (req, res, next) => {
    const page = req._page;
    const size = req._size;
    let user = await user_1.User.findOne({ _id: req._id }).exec();
    let movies = [];
    if (user) {
        await Promise.all(user.myFavorites.map(async (id) => {
            const movie = await movie_1.Movie.findOne({ movieDbId: id });
            if (movie) {
                movies.push(movie);
            }
            ;
        }));
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
exports.getUserFavorites = getUserFavorites;
//Add & remove a favorite
const updateUserFavorite = async (req, res, next) => {
    var _a;
    const id = (_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.id;
    const user = user_1.User.findOne({ _id: new mongodb_1.ObjectId(id) }, (err, user) => {
        if (err) {
            res.status(500).send({ message: constants_1.msg.SERVER_ERROR });
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
