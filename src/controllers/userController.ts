import util from 'util';
import { RequestHandler } from 'express';
import { CallbackError, Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

import { User } from '@schema/user';
import { Movie } from '@schema/movie';
import IUser from '@models/user';
import IMovie from '@models/movie';
import { removeOldPic, uploadPic } from '@controllers/userPicController';
import { authMsg, msg } from '@constants/constants';
import { FileRequest } from '@interfaces/file';
import UserReqUpdateDTO from "@dtos/userReqUpdateDTO"
import { parseToInt } from '@utils/parseToInt';
import { parseToMongoId } from '@utils/parseToMongoId';

//Update user - To manage formData
const Multer = require('multer');
const upload = Multer({
    storage: Multer.MemoryStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // Maximum file size is 2MB
    },
}).single('avatar');

export const getUsers: RequestHandler = async (req, res, next) => {
    
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

    if (typeof pageInt != "undefined" && typeof sizeInt != "undefined"){
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
    } else {
        res.status(400).json({ message: msg.BAD_PARAMS + 'page_size' });
    }
};

//Get a user
export const getUserById: RequestHandler = async (req, res, next) => {
    let userId = {} as ObjectId
    
    if (req && req.query && req.query.id) {
        const parseResult = parseToMongoId(req.query.id as string);

        if (parseResult.error || typeof parseResult.parsedId == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        } else {
            userId = parseResult.parsedId;
        }
    }
    
    let isAdmin = req._userAdmin;

    if (isAdmin || userId == req._userId) {
        const user = User.findOne(
            { _id: userId },
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
    let fileToUpload = req._file as FileRequest;
    let body = req.body as UserReqUpdateDTO;

    let userId = {} as ObjectId
    
    if (req && req.query && req.query.id) {
        const parseResult = parseToMongoId(req.query.id as string);

        if (parseResult.error || typeof parseResult.parsedId == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        } else {
            userId = parseResult.parsedId;
        }
    }

    let isAdmin = req._userAdmin;

    if (isAdmin || userId == req._userId) {
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
            { _id: userId },
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
    let userId = {} as ObjectId
    
    if (req && req.query && req.query.id) {
        const parseResult = parseToMongoId(req.query.id as string);

        if (parseResult.error || typeof parseResult.parsedId == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        } else {
            userId = parseResult.parsedId;
        }
    }

    let userRole = req._userAdmin;

    if (userRole || userId == req._userId) {
        const user = User.findOne(
            { _id: userId },
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
    let userId = {} as ObjectId
    
    if (req && req.query && req.query.id) {
        const parseResult = parseToMongoId(req.query.id as string);

        if (parseResult.error || typeof parseResult.parsedId == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        } else {
            userId = parseResult.parsedId;
        }
    }

    let movieDbIdInt: number = -1;
    
    if (req && req.query && req.query.page) {
        const parseResult = parseToInt(req.query.page as string);

        if (parseResult.error || typeof parseResult.parsedInt == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        } else {
            movieDbIdInt = parseResult.parsedInt;
        }
    }

    let rateInt: number = -1;
    
    if (req && req.query && req.query.page) {
        const parseResult = parseToInt(req.query.page as string);

        if (parseResult.error || typeof parseResult.parsedInt == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        } else {
            rateInt = parseResult.parsedInt;
        }
    }

    const user = User.findOne(
        { _id: userId },
        null,
        (err, user) => {
            if (err) {
                res.status(500).send({ message: msg.SERVER_ERROR });
            } else if (user) {
                let userChanged = false;
                let index = user.myRates.findIndex(
                    (rate) => rate.movieDbId === movieDbIdInt,
                );

                if (index > -1) {
                    if (rateInt == 0) {
                        user.myRates.splice(index, 1);
                        userChanged = true;
                    } else if (movieDbIdInt && rateInt) {
                        user.myRates[index] = {
                            movieDbId: movieDbIdInt,
                            rate: rateInt * 2,
                        };
                        userChanged = true;
                    }
                } else if (movieDbIdInt && rateInt && rateInt > 0) {
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
                    rate: (typeof rateInt != 'undefined'? rateInt : 0) * 2,
                });
            }
        },
    );
};

// Get info of favorite movies
export const getUserFavorites: RequestHandler = async (req, res, next) => {
    
    let userId = {} as ObjectId
    
    if (req && req.query && req.query.id) {
        const parseResult = parseToMongoId(req.query.id as string);

        if (parseResult.error || typeof parseResult.parsedId == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        } else {
            userId = parseResult.parsedId;
        }
    }
    

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

    let user = await User.findOne({ _id: userId }).exec();

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

//Add & remove a favorite
export const updateUserFavorite: RequestHandler = async (req, res, next) => {
    let userId = {} as ObjectId
    
    if (req && req.query && req.query.id) {
        const parseResult = parseToMongoId(req.query.id as string);

        if (parseResult.error || typeof parseResult.parsedId == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        } else {
            userId = parseResult.parsedId;
        }
    }

    let movieDbIdInt: number = -1;
    
    if (req && req.query && req.query.page) {
        const parseResult = parseToInt(req.query.page as string);

        if (parseResult.error || typeof parseResult.parsedInt == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        } else {
            movieDbIdInt = parseResult.parsedInt;
        }
    }


    const user = User.findOne(
        { _id: userId },
        (err: Error, user: IUser) => {
            if (err) {
                res.status(500).send({ message: msg.SERVER_ERROR });
            } else if (user && movieDbIdInt) {
                let index = user.myFavorites.indexOf(movieDbIdInt);
                if (index >= 0) {
                    user.myFavorites.splice(index, 1);
                } else {
                    user.myFavorites.push(movieDbIdInt);
                }

                user.save();
                res.status(200).json({ movieDbId: movieDbIdInt });
            }
        },
    );
};
