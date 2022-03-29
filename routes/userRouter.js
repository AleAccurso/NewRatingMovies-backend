const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

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

// Get all users
router.get("/", userController.getUsers);

router
  .route("/:id")
  .get(isAuth, userController.getUserById) // Get a user
  .post(isAuth, upload, userController.updateUser) // Update a user
  .delete(isAdmin, userController.deleteUser); // Delete a user

//add, remove & delete rate
router.patch("/:id/:movieDbId/:rate", isAuth, userController.userRate);

//add & remove a favorite
router.patch("/:id/:movieDbId", isAuth, userController.userFavorite);

module.exports = router;
