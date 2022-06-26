"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const isAdmin_1 = require("../middelware/isAdmin");
const theMovieDBController_1 = require("../controllers/theMovieDBController");
const router = (0, express_1.Router)();
// API - theMovieDB
// Get a search result
router.post("/search/:title/:language", isAdmin_1.isAdmin, theMovieDBController_1.getSearchResultsFromAPI);
// Get information about a movie from API
router.post("/:id/getInfo", theMovieDBController_1.getInfoFromAPI);
exports.default = router;
