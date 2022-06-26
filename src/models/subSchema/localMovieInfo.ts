import { Schema } from "mongoose";

export default new Schema ({
    title: String,
    overview: String,
    poster_path: String,
    trailers: [String]
})