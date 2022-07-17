import { Router } from "express";
import * as userController from "controllers/userController";
import { isAuth} from "middelwares/isAuth";
import { isAdmin } from "middelwares/isAdmin"

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
    .get(isAuth, userController.getUserById) // Get a user
    .post(isAuth, upload, userController.updateUserById) // Update a user
    .delete(isAdmin, userController.deleteUserById); // Delete a user

router.patch("/:id/:movieDbId/:rate", isAuth, userController.updateUserRate); //add, remove & delete rate

router.get("/:id/favorites", isAuth, userController.getUserFavorites); // Get userFavorites with movies information

//add & remove a favorite
router.post("/:id/favorites/:movieDbId", isAuth, userController.updateUserFavorite);

export default router;
