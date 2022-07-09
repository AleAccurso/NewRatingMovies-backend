"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Movie = void 0;
const mongoose_1 = require("mongoose");
const localMovieInfo_1 = __importDefault(require("./subSchema/localMovieInfo"));
const MovieSchema = new mongoose_1.Schema({
    movieDbId: { type: Number, required: true, unique: true },
    release_date: { type: String, required: true },
    director: { type: String, required: true },
    casting: { type: String, required: true },
    vote_average: { type: Number, required: true },
    vote_count: { type: Number, required: true },
    genre: { type: Array, required: true },
    en: { type: localMovieInfo_1.default, required: true },
    fr: { type: localMovieInfo_1.default, required: true },
    nl: { type: localMovieInfo_1.default, required: true },
    it: { type: localMovieInfo_1.default, required: true },
}, { timestamps: true });
exports.Movie = (0, mongoose_1.model)('Movie', MovieSchema);
