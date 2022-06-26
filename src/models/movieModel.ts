import { Schema, model } from "mongoose";
import IMovie from "../interfaces/movie";
import localMovieInfo from "./subSchema/localMovieInfo"

const MovieSchema = new Schema(
    {
        movieDbId: { type: String, required: true, unique: true },
        release_date: { type: String, required: true },
        director: { type: String, required: true },
        casting: { type: String, required: true },
        vote_average: { type: Number, required: true },
        vote_count: { type: Number, required: true },
        genre: { type: Array, required: true },
        en: {type: localMovieInfo, required: true },
        fr: {type: localMovieInfo, required: true },
        nl: {type: localMovieInfo, required: true },
        it: {type: localMovieInfo, required: true },
    },
    { timestamps: true }
);

export const Movie = model<IMovie>('Movie', MovieSchema);
