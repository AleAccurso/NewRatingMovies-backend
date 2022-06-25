import { Router } from 'express';

const router = Router();
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
router.get("/", isAdmin, userController.getUsers); // Get all users

router
  .route("/:id")
  .get(isAuth, userController.getUserById) // Get a user
  .post(isAuth, upload, userController.updateUser) // Update a user
  .delete(isAdmin, userController.deleteUser); // Delete a user

router.patch("/:id/:movieDbId/:rate", isAuth, userController.userRate); //add, remove & delete rate

router.get("/:id/favorites", isAuth, userController.getFavorites); // Get userFavorites with movies information

//add & remove a favorite
router.post("/:id/favorites/:movieDbId", isAuth, userController.updateFavorite);

export default router;
