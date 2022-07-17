"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController = __importStar(require("@controllers/userController"));
const isAuth_1 = require("@middelwares/isAuth");
const isAdmin_1 = require("@middelwares/isAdmin");
const router = (0, express_1.Router)();
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
router.get("/", isAdmin_1.isAdmin, userController.getUsers); // Get all users
router
    .route("/:id")
    .get(isAuth_1.isAuth, userController.getUserById) // Get a user
    .post(isAuth_1.isAuth, upload, userController.updateUserById) // Update a user
    .delete(isAdmin_1.isAdmin, userController.deleteUserById); // Delete a user
router.patch("/:id/:movieDbId/:rate", isAuth_1.isAuth, userController.updateUserRate); //add, remove & delete rate
router.get("/:id/favorites", isAuth_1.isAuth, userController.getUserFavorites); // Get userFavorites with movies information
//add & remove a favorite
router.post("/:id/favorites/:movieDbId", isAuth_1.isAuth, userController.updateUserFavorite);
exports.default = router;
