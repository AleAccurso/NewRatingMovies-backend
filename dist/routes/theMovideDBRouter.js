"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const isAdmin_1 = require("../middelware/isAdmin");
const theMovieDBController_1 = require("../controllers/theMovieDBController");
const routes_1 = require("../middelware/routes");
const router = (0, express_1.Router)();
// API - theMovieDB
// Get a search result
router.post("/search/:title/:language", routes_1.routerParamConverter, isAdmin_1.isAdmin, theMovieDBController_1.getSearchResultsFromAPI);
// Get information about a movie from API
router.post("/:id/getInfo", routes_1.routerParamConverter, theMovieDBController_1.getInfoFromAPI);
exports.default = router;
