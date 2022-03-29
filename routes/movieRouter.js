const express = require("express");
const router = express.Router();

const movieController = require("../controllers/movieController");

const isAdmin = require("../middleware/isAdmin");

router
  .route("/")
  .get(movieController.getMovies) // Get movies with pagination params in query
  .post(isAdmin, movieController.addMovie); // Add a movie

router
  .route("/:id")
  .get(movieController.getMovieById)
  .patch(isAdmin, movieController.updateMovie)
  .delete(isAdmin, movieController.deleteMovie);

router.post("/:id/metadata", isAdmin, movieController.updateMetaData); //Change metadata a MKV file on the hard drive

module.exports = router;
