import { Router } from "express";
import {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    userRate,
    getFavorites,
    updateFavorite,
} from "../controllers/userController";

const router = Router();

const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

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
router.get("/", isAdmin, getUsers); // Get all users

router
    .route("/:id")
    .get(isAuth, getUserById) // Get a user
    .post(isAuth, upload, updateUser) // Update a user
    .delete(isAdmin, deleteUser); // Delete a user

router.patch("/:id/:movieDbId/:rate", isAuth, userRate); //add, remove & delete rate

router.get("/:id/favorites", isAuth, getFavorites); // Get userFavorites with movies information

//add & remove a favorite
router.post("/:id/favorites/:movieDbId", isAuth, updateFavorite);

export default router;
