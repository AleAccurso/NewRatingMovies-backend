const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MovieSchema = new Schema({
  movieDbId: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  genres: { type: Array, required: true },
  strGenres: { type: String, required: true },
  vote_average: { type: Number, required: true },
  release_date: { type: String, required: true },
  poster_path: { type: String, required: true },
  director: { type: String, required: true },
  overview: { type: String, required: true },
  actors: { type: String, required: true },
});

module.exports = mongoose.model("Movie", MovieSchema);
