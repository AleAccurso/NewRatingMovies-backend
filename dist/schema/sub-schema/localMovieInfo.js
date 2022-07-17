"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.default = new mongoose_1.Schema({
    title: String,
    overview: String,
    poster_path: String,
    trailers: [String]
});
