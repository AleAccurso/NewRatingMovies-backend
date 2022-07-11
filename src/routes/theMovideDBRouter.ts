import { Router } from "express";
import { isAdmin } from "../middelware/isAdmin";
import { getSearchResultsFromAPI, getInfoFromAPI } from "../controllers/theMovieDBController";
import { routerParamConverter } from '../middelware/routes';

const router = Router();

// API - theMovieDB

// Get a search result
router.post(
  "/search/:title/:language",
  routerParamConverter,
  isAdmin,
  getSearchResultsFromAPI
);

// Get information about a movie from API
router.post("/:id/getInfo", routerParamConverter, getInfoFromAPI);

export default router;
