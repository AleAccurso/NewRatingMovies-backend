"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const responseMessages_1 = require("../contants/responseMessages");
const userModel_1 = __importDefault(require("../models/userModel"));
const isAuth = async (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        return res.status(401).json({
            message: responseMessages_1.authMsg.NOT_AUTHENTICATED,
        });
    }
    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
        decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch (err) {
        return res.status(500).json({
            message: `${err}`,
        });
    }
    if (!decodedToken) {
        return res.status(401).json({
            message: responseMessages_1.authMsg.NOT_AUTHENTICATED,
        });
    }
    let user = await userModel_1.default.findOne({ email: decodedToken.email });
    if (user) {
        req.userId = user._id;
        req.userRole = user.isAdmin;
    }
    next();
};
exports.isAuth = isAuth;
