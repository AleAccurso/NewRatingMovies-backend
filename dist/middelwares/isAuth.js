"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("constants/constants");
const user_1 = require("schema/user");
const isAuth = async (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        return res.status(401).json({
            message: constants_1.authMsg.NOT_AUTHENTICATED,
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
            message: constants_1.authMsg.NOT_AUTHENTICATED,
        });
    }
    if (typeof decodedToken != "string") {
        console.log("🚀 ~ constisAuth:RequestHandler= ~ decodedToken", decodedToken);
        let user = await user_1.User.findOne({ email: decodedToken.email });
        if (user) {
            req._userId = user._id;
            req._userAdmin = user.isAdmin;
        }
    }
    next();
};
exports.isAuth = isAuth;
