const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

const { authMsg, msg } = require("../constants/response_messages");

exports.register = async (req, res, next) => {
  const { name, email, password, language } = req.body;
  try {
    const existUser = await userModel.findOne({ email: email });
    if (existUser) {
      return res.status(409).json({
        message: msg.RESOURCE_EXISTS + "email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new userModel({
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

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(401).json({
        message: msg.RESOURCE_NOT_FOUND + "user",
      });
    }
    loadedUser = user;

    const comparePassword = bcrypt.compare(password, user.password);

    if (!comparePassword) {
      return res.status(401).json({
        message: authMsg.PASSWORD_MISSMATCH,
      });
    }
    const token = jwt.sign(
      { email: loadedUser.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "3600s",
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

exports.logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    jwt.sign(authHeader, "", { expiresIn: 1 }, (logout, err) => {
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

exports.getUser = (req, res, next) => {
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
