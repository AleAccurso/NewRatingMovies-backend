import { RequestHandler } from 'express';
import { hash, compare } from 'bcryptjs';

import { MongoError } from 'mongodb';

import { User } from '../schema/user';
import { sign } from 'jsonwebtoken';

import { authMsg, msg } from '../contants/responseMessages';
import IUser from '../models/user';
import UserReqCreateDTO from '../dto/userReqCreateDTO';

export const register: RequestHandler = async (req, res, next) => {
    const { nickname, email, password, language } = req.body as UserReqCreateDTO;

    try {
        const existUser = await User.findOne({ email: email }).exec();

        if (existUser) {
            return res.status(409).json({
                message: msg.RESOURCE_EXISTS + 'email',
            });
        }

        const hashedPassword = await hash(password, 12);

        const user = new User({
            nickname: nickname,
            email: email,
            password: hashedPassword,
            language: language,
        });

        const result = await user.save();

        res.status(201).json({
            message: msg.SUCCESS_ACTION + 'register_user',
            user: { id: result._id, email: result.email },
        });
    } catch (err) {
        if (err instanceof MongoError) {
            return res.status(500).json({
                message: msg.DB_ERROR,
            });
        } else {
            return res.status(500).json({
                message: msg.SERVER_ERROR,
            });
        }
    }
};

let loadedUser= {} as IUser;

export const login: RequestHandler = async (req, res, next) => {
    const { email, password }:IUser = req.body;
    console.log("🚀 ~ constlogin:RequestHandler= ~ email", email);

    try {
        const user = await User.findOne({ email: email }).exec();

        if (!user) {
            return res.status(401).json({
                message: msg.RESOURCE_NOT_FOUND + 'user',
            });
        }
        loadedUser = user;

        const comparePassword = await compare(password, user.password);

        if (!comparePassword) {
            return res.status(401).json({
                message: authMsg.PASSWORD_MISSMATCH,
            });
        }

        const token = sign(
            { email: loadedUser.email },
            process.env.JWT_SECRET,
            {
                expiresIn: '24h',
            },
        );

        res.status(200).json({ token: token, language: loadedUser.language });
    } catch (err) {
        if (err instanceof MongoError) {
            return res.status(500).json({
                message: msg.DB_ERROR,
            });
        } else {
            return res.status(500).json({
                message: msg.SERVER_ERROR,
            });
        }
    }
};

export const logout: RequestHandler = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');

        if (!authHeader) {
            return res.status(401).json({
                message: authMsg.NOT_AUTHENTICATED,
            });
        }

        sign(authHeader, '', { expiresIn: 1 }, (logout, err) => {
            if (authHeader) {
                loadedUser = {} as IUser;
                res.status(200).send({ msg: msg.SUCCESS_ACTION + 'logout' });
            } else {
                res.status(404).send({ msg: authMsg.NOBODY_LOGGED });
            }
        });
    } catch (err) {
        res.status(500).json({
            message: msg.SERVER_ERROR,
        });
    }
};

export const getLoggedUser: RequestHandler = (req, res, next) => {
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
            } as IUser,
        });
    } else {
        res.status(404).json({
            user: {},
            message: authMsg.NOBODY_LOGGED,
        });
    }
};
