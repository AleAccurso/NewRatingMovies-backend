import { Router } from "express";

import { isAdmin } from "@middelwares/isAdmin";
import { getSearchResultsFromAPI, getInfoFromAPI } from "@controllers/theMovieDBController";

const router = Router();

// API - theMovieDB

// Get a search result
router.post(
  "/search/:title/:language",
  isAdmin,
  getSearchResultsFromAPI
);

// Get information about a movie from API
router.post("/:id/getInfo", getInfoFromAPI);

export default router;
