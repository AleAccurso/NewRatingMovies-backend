import { Router } from "express";
import { isAdmin } from "../middelware/isAdmin";
import * as movieController from "../controllers/movieController";
import { routerParamConverter } from '../middelware/routes';

const router = Router();

router
    .route("/")
    .get(movieController.getMovies) // Get movies with pagination params in query
    .post(isAdmin, movieController.addMovie); // Add a movie

router
    .route("/:id")
    .get(routerParamConverter, movieController.getMovieById)
    .patch(isAdmin, routerParamConverter, movieController.updateMovieById)
    .delete(isAdmin, routerParamConverter, movieController.deleteMovieById);

router.post("/:id/metadata", routerParamConverter, isAdmin, movieController.updateMetaData); //Change metadata a MKV file on the hard drive

router.get("/check/:movieDBId", routerParamConverter, isAdmin, movieController.isInDB); //Change metadata a MKV file on the hard drive

export default router;
