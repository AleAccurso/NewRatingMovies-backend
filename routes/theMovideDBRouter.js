const express = require("express");
const router = express.Router();

const theMovieDBController = require("../controllers/theMovieDBController");

const isAdmin = require("../middleware/isAdmin");

// API - theMovieDB

// Get a search result
router.post(
  "/search/:title/:language",
  isAdmin,
  theMovieDBController.getSearchResultsFromAPI
);

// Get information about a movie from API
router.post("/:id/getInfo", theMovieDBController.getInfoFromAPI);

module.exports = router;
