import { Router } from "express";
import { isAdmin } from "middelwares/isAdmin";
import * as movieController from "controllers/movieController";

const router = Router();

router
    .route("/")
    .get(movieController.getMovies) // Get movies with pagination params in query
    .post(isAdmin, movieController.addMovie); // Add a movie

router
    .route("/:id")
    .get(movieController.getMovieById)
    .patch(isAdmin, movieController.updateMovieById)
    .delete(isAdmin, movieController.deleteMovieById);

router.post("/:id/metadata", isAdmin, movieController.updateMetaData); //Change metadata a MKV file on the hard drive

router.get("/check/:movieDBId", isAdmin, movieController.isInDB); //Change metadata a MKV file on the hard drive

export default router;
