"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const responseMessages_1 = require("../contants/responseMessages");
const userModel_1 = __importDefault(require("../models/userModel"));
const isAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        let user = await userModel_1.default.findOne({ email: decoded.email });
        if (!user.isAdmin) {
            throw new Error();
        }
        next();
    }
    catch (error) {
        return res.status(403).json({
            message: responseMessages_1.authMsg.UNAUTHORIZED,
        });
    }
};
exports.isAdmin = isAdmin;
