const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.postSignin = async (req, res, next) => {
  const { name, email, password, language } = req.body;
  try {
    const existUser = await userModel.findOne({ email: email });
    if (existUser) {
      const error = new Error(
        "Email already exist, please pick another email!"
      );
      res.status(409).json({
        error: "Email already exist, please pick another email! ",
      });
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new userModel({
      nickname: name,
      email: email,
      password: hashedPassword,
      language: language,
    });
    const result = await user.save();
    res.status(200).json({
      message: "User created",
      user: { id: result._id, email: result.email },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

let loadedUser;
exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email: email });

    if (!user) {
      const error = new Error("User with this email not found!");
      error.statusCode = 401;
      throw error;
    }
    loadedUser = user;

    const comparePassword = bcrypt.compare(password, user.password);

    if (!comparePassword) {
      const error = new Error("Password does not match!");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign({ email: loadedUser.email }, process.env.JWT_SECRET, {
      expiresIn: "3600s",
    });
    res.status(200).json({ token: token, language: loadedUser.language });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  jwt.sign(authHeader, "", { expiresIn: 1 } , (logout, err) => {
    if (logout) {
      res.status(200).send({msg : 'You have been Logged Out' });
    } else {
      res.status(200).send({msg : 'Cannot log out.'});
    }
  })
}

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
    res.status(200).json({
      user: {},
      message: "No user Logged.",
    });
  }
};
