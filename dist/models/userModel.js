"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    nickname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    myFavorites: { type: Array, default: [] },
    myRates: { type: Array, default: [] },
    language: { type: String, required: true, default: "fr" },
    profilePic: { type: String, required: false },
}, { timestamps: true });
exports.default = UserSchema;
