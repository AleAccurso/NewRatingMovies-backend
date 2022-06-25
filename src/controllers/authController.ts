import { RequestHandler } from "express";
import { hash, compare } from "bcryptjs";

import UserSchema from "../models/userModel";
import { sign } from "jsonwebtoken";

import { authMsg, msg } from "../contants/responseMessages";

export const register: RequestHandler = async (req, res, next) => {
  const { name, email, password, language } = req.body;
  try {
    const existUser = await UserSchema.findOne({ email: email }).exec();
    if (existUser) {
      return res.status(409).json({
        message: msg.RESOURCE_EXISTS + "email",
      });
    }

    const hashedPassword = await hash(password, 12);
    const user = new UserSchema({
      nickname: name,
      email: email,
      password: hashedPassword,
      language: language,
    });
    const result = await user.save();
    res.status(201).json({
      message: msg.SUCCESS_ACTION + "register_user",
      user: { id: result._id, email: result.email },
    });
  } catch (err) {
    if (!err.statusCode) {
      return res.status(500).json({
        message: msg.SERVER_ERROR,
      });
    }
    next(err);
  }
};

let loadedUser;

export const login: RequestHandler = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email: email }).exec();

    if (!user) {
      return res.status(401).json({
        message: msg.RESOURCE_NOT_FOUND +jwt "user",
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
        expiresIn: "24h",
      }
    );
    res.status(200).json({ token: token, language: loadedUser.language });
  } catch (err) {
    if (!err.statusCode) {
      return res.status(500).json({
        message: msg.SERVER_ERROR,
      });
    }
    next(err);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    sign(authHeader, "", { expiresIn: 1 }, (logout, err) => {
      if (authHeader) {
        res.status(200).send({ msg: msg.SUCCESS_ACTION + "logout" });
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

export const getUser: RequestHandler = (req, res, next) => {
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
  } else {
    res.status(404).json({
      user: {},
      message: authMsg.NOBODY_LOGGED,
    });
  }
};
