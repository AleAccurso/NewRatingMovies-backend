"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const rate_1 = __importDefault(require("./subSchema/rate"));
const UserSchema = new mongoose_1.Schema({
    nickname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    myFavorites: { type: [Number], default: [] },
    myRates: { type: [rate_1.default] },
    language: { type: String, required: true, default: 'fr' },
    profilePic: { type: String, required: false },
}, { timestamps: true });
exports.User = (0, mongoose_1.model)('User', UserSchema);
