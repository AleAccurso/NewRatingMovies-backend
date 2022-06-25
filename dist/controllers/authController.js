"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = require("bcryptjs");
const userModel_1 = __importDefault(require("../models/userModel"));
const jsonwebtoken_1 = require("jsonwebtoken");
const responseMessages_1 = require("../contants/responseMessages");
const register = async (req, res, next) => {
    const { name, email, password, language } = req.body;
    try {
        const existUser = await userModel_1.default.findOne({ email: email }).exec();
        if (existUser) {
            return res.status(409).json({
                message: responseMessages_1.msg.RESOURCE_EXISTS + "email",
            });
        }
        const hashedPassword = await (0, bcryptjs_1.hash)(password, 12);
        const user = new userModel_1.default({
            nickname: name,
            email: email,
            password: hashedPassword,
            language: language,
        });
        const result = await user.save();
        res.status(201).json({
            message: responseMessages_1.msg.SUCCESS_ACTION + "register_user",
            user: { id: result._id, email: result.email },
        });
    }
    catch (err) {
        if (!err.statusCode) {
            return res.status(500).json({
                message: responseMessages_1.msg.SERVER_ERROR,
            });
        }
        next(err);
    }
};
exports.register = register;
let loadedUser;
const login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email: email }).exec();
        if (!user) {
            return res.status(401).json({
                message: responseMessages_1.msg.RESOURCE_NOT_FOUND + jwt, "user": ,
            });
        }
        loadedUser = user;
        const comparePassword = await (0, bcryptjs_1.compare)(password, user.password);
        if (!comparePassword) {
            return res.status(401).json({
                message: responseMessages_1.authMsg.PASSWORD_MISSMATCH,
            });
        }
        const token = (0, jsonwebtoken_1.sign)({ email: loadedUser.email }, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });
        res.status(200).json({ token: token, language: loadedUser.language });
    }
    catch (err) {
        if (!err.statusCode) {
            return res.status(500).json({
                message: responseMessages_1.msg.SERVER_ERROR,
            });
        }
        next(err);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        (0, jsonwebtoken_1.sign)(authHeader, "", { expiresIn: 1 }, (logout, err) => {
            if (authHeader) {
                res.status(200).send({ msg: responseMessages_1.msg.SUCCESS_ACTION + "logout" });
            }
            else {
                res.status(404).send({ msg: responseMessages_1.authMsg.NOBODY_LOGGED });
            }
        });
    }
    catch (err) {
        res.status(500).json({
            message: responseMessages_1.msg.SERVER_ERROR,
        });
    }
};
exports.logout = logout;
const getUser = (req, res, next) => {
    if (loadedUser) {
        res.status(200).json({
            user: {
                id: loadedUser._id,
                nickname: loadedUser.nickname,
                email: loadedUser.email,
                isAdmin: loadedUser.isAdmin,
                myFavorites: loadedUser.myFavorites,
                language: loadedUser.language,
                myRates: loadedUser.myRates,
                profilePic: loadedUser.profilePic,
            },
        });
    }
    else {
        res.status(404).json({
            user: {},
            message: responseMessages_1.authMsg.NOBODY_LOGGED,
        });
    }
};
exports.getUser = getUser;