"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
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
router.get("/", isAdmin, userController_1.getUsers); // Get all users
router
    .route("/:id")
    .get(isAuth, userController_1.getUserById) // Get a user
    .post(isAuth, upload, userController_1.updateUser) // Update a user
    .delete(isAdmin, userController_1.deleteUser); // Delete a user
router.patch("/:id/:movieDbId/:rate", isAuth, userController_1.userRate); //add, remove & delete rate
router.get("/:id/favorites", isAuth, userController_1.getFavorites); // Get userFavorites with movies information
//add & remove a favorite
router.post("/:id/favorites/:movieDbId", isAuth, userController_1.updateFavorite);
exports.default = router;
