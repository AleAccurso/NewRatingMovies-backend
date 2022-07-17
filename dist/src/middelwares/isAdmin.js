"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("@constants/constants");
const user_1 = require("@schema/user");
const isAdmin = async (req, res, next) => {
    let decoded;
    try {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            return res.status(401).json({
                message: constants_1.authMsg.NOT_AUTHENTICATED,
            });
        }
        const token = authHeader.split(' ')[1];
        decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (typeof decoded != 'string') {
            let user = await user_1.User.findOne({ email: decoded.email });
            if (!user) {
                return res.status(401).json({
                    message: constants_1.msg.RESOURCE_NOT_FOUND + 'user',
                });
            }
            if (!user.isAdmin) {
                throw new Error();
            }
        }
        next();
    }
    catch (err) {
        return res.status(403).json({
            message: constants_1.authMsg.UNAUTHORIZED,
        });
    }
};
exports.isAdmin = isAdmin;
