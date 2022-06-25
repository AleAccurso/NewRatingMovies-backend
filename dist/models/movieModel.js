"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MovieSchema = new mongoose_1.Schema({
    movieDbId: { type: String, required: true, unique: true },
    release_date: { type: String, required: true },
    director: { type: String, required: true },
    casting: { type: String, required: true },
    vote_average: { type: Number, required: true },
    vote_count: { type: Number, required: true },
    genre: { type: Array, required: true },
    en: {
        title: { type: String, required: true },
        overview: { type: String, required: true },
        poster_path: { type: String, required: true },
        trailers: { type: Array, required: true },
    },
    fr: {
        title: { type: String, required: true },
        overview: { type: String, required: true },
        poster_path: { type: String, required: true },
        trailers: { type: Array, required: true },
    },
    nl: {
        title: { type: String, required: true },
        overview: { type: String, required: true },
        poster_path: { type: String, required: true },
        trailers: { type: Array, required: true },
    },
    it: {
        title: { type: String, required: true },
        overview: { type: String, required: true },
        poster_path: { type: String, required: true },
        trailers: { type: Array, required: true },
    },
}, { timestamps: true });
exports.default = MovieSchema;
