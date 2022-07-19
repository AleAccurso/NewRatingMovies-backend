"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserFavorite = exports.getUserFavorites = exports.updateUserRate = exports.deleteUserById = exports.updateUserById = exports.getUserById = exports.getUsers = void 0;
const util_1 = __importDefault(require("util"));
const user_1 = require("@schema/user");
const movie_1 = require("@schema/movie");
const userPicController_1 = require("@controllers/userPicController");
const constants_1 = require("@constants/constants");
const parseToInt_1 = require("@utils/parseToInt");
const parseToMongoId_1 = require("@utils/parseToMongoId");
//Update user - To manage formData
const Multer = require('multer');
const upload = Multer({
    storage: Multer.MemoryStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // Maximum file size is 2MB
    },
}).single('avatar');
const getUsers = async (req, res, next) => {
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
    if (typeof pageInt != "undefined" && typeof sizeInt != "undefined") {
        const user = user_1.User.find()
            .skip(pageInt * sizeInt)
            .limit(sizeInt)
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
    let userId = {};
    if (req && req.query && req.query.id) {
        const parseResult = (0, parseToMongoId_1.parseToMongoId)(req.query.id);
        if (parseResult.error || typeof parseResult.parsedId == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        }
        else {
            userId = parseResult.parsedId;
        }
    }
    let isAdmin = req._userAdmin;
    if (isAdmin || userId == req._userId) {
        const user = user_1.User.findOne({ _id: userId }, (err, user) => {
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
    let fileToUpload = req._file;
    let body = req.body;
    let userId = {};
    if (req && req.params && req.params.id) {
        const parseResult = (0, parseToMongoId_1.parseToMongoId)(req.params.id);
        if (parseResult.error || typeof parseResult.parsedId == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        }
        else {
            userId = parseResult.parsedId;
        }
    }
    let isAdmin = req._userAdmin;
    if (isAdmin || userId == req._userId) {
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
        user_1.User.findOneAndUpdate({ _id: userId }, {
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
    let userId = {};
    if (req && req.params && req.params.id) {
        const parseResult = (0, parseToMongoId_1.parseToMongoId)(req.params.id);
        if (parseResult.error || typeof parseResult.parsedId == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        }
        else {
            userId = parseResult.parsedId;
        }
    }
    let userRole = req._userAdmin;
    if (userRole || userId == req._userId) {
        const user = user_1.User.findOne({ _id: userId }, (err, user) => {
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
    let userId = {};
    if (req && req.params && req.params.id) {
        const parseResult = (0, parseToMongoId_1.parseToMongoId)(req.params.id);
        if (parseResult.error || typeof parseResult.parsedId == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        }
        else {
            userId = parseResult.parsedId;
        }
    }
    let movieDbIdInt = -1;
    if (req && req.query && req.query.page) {
        const parseResult = (0, parseToInt_1.parseToInt)(req.query.page);
        if (parseResult.error || typeof parseResult.parsedInt == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        }
        else {
            movieDbIdInt = parseResult.parsedInt;
        }
    }
    let rateInt = -1;
    if (req && req.query && req.query.page) {
        const parseResult = (0, parseToInt_1.parseToInt)(req.query.page);
        if (parseResult.error || typeof parseResult.parsedInt == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        }
        else {
            rateInt = parseResult.parsedInt;
        }
    }
    const user = user_1.User.findOne({ _id: userId }, null, (err, user) => {
        if (err) {
            res.status(500).send({ message: constants_1.msg.SERVER_ERROR });
        }
        else if (user) {
            let userChanged = false;
            let index = user.myRates.findIndex((rate) => rate.movieDbId === movieDbIdInt);
            if (index > -1) {
                if (rateInt == 0) {
                    user.myRates.splice(index, 1);
                    userChanged = true;
                }
                else if (movieDbIdInt && rateInt) {
                    user.myRates[index] = {
                        movieDbId: movieDbIdInt,
                        rate: rateInt * 2,
                    };
                    userChanged = true;
                }
            }
            else if (movieDbIdInt && rateInt && rateInt > 0) {
                user.myRates.push({
                    movieDbId: movieDbIdInt,
                    rate: rateInt * 2,
                });
                userChanged = true;
            }
            if (userChanged) {
                user.save();
            }
            res.status(200).json({
                movieDbId: movieDbIdInt,
                rate: (typeof rateInt != 'undefined' ? rateInt : 0) * 2,
            });
        }
    });
};
exports.updateUserRate = updateUserRate;
// Get info of favorite movies
const getUserFavorites = async (req, res, next) => {
    let userId = {};
    if (req && req.params && req.params.id) {
        const parseResult = (0, parseToMongoId_1.parseToMongoId)(req.params.id);
        if (parseResult.error || typeof parseResult.parsedId == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        }
        else {
            userId = parseResult.parsedId;
        }
    }
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
    let user = await user_1.User.findOne({ _id: userId }).exec();
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
    if (pageInt && sizeInt) {
        movies = movies.slice(pageInt * sizeInt, sizeInt + pageInt * sizeInt);
    }
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
    let userId = {};
    if (req && req.params && req.params.id) {
        const parseResult = (0, parseToMongoId_1.parseToMongoId)(req.params.id);
        if (parseResult.error || typeof parseResult.parsedId == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        }
        else {
            userId = parseResult.parsedId;
        }
    }
    let movieDbIdInt = -1;
    if (req && req.query && req.query.page) {
        const parseResult = (0, parseToInt_1.parseToInt)(req.query.page);
        if (parseResult.error || typeof parseResult.parsedInt == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        }
        else {
            movieDbIdInt = parseResult.parsedInt;
        }
    }
    const user = user_1.User.findOne({ _id: userId }, (err, user) => {
        if (err) {
            res.status(500).send({ message: constants_1.msg.SERVER_ERROR });
        }
        else if (user && movieDbIdInt) {
            let index = user.myFavorites.indexOf(movieDbIdInt);
            if (index >= 0) {
                user.myFavorites.splice(index, 1);
            }
            else {
                user.myFavorites.push(movieDbIdInt);
            }
            user.save();
            res.status(200).json({ movieDbId: movieDbIdInt });
        }
    });
};
exports.updateUserFavorite = updateUserFavorite;
