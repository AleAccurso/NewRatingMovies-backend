import { Router } from "express";
import * as userController from "../controllers/userController";
import { isAuth} from "../middelware/isAuth";
import { isAdmin } from "../middelware/isAdmin"
import { routerParamConverter } from "../middelware/routes";

const router = Router();

//Manage formData for the avatar/profilePic
const Multer = require("multer");
const upload = Multer({
    storage: Multer.MemoryStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // Maximum file size is 2MB
    },
}).single("avatar");

/*
  User routes
*/
router.get("/", isAdmin, userController.getUsers); // Get all users

router
    .route("/:id")
    .get(isAuth, routerParamConverter, userController.getUserById) // Get a user
    .post(isAuth, routerParamConverter, upload, userController.updateUserById) // Update a user
    .delete(isAdmin, routerParamConverter, userController.deleteUserById); // Delete a user

router.patch("/:id/:movieDbId/:rate", routerParamConverter, isAuth, userController.updateUserRate); //add, remove & delete rate

router.get("/:id/favorites", routerParamConverter, isAuth, userController.getUserFavorites); // Get userFavorites with movies information

//add & remove a favorite
router.post("/:id/favorites/:movieDbId", routerParamConverter, isAuth, userController.updateUserFavorite);

export default router;
