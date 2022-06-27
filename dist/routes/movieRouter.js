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
const isAdmin_1 = require("../middelware/isAdmin");
const movieController = __importStar(require("../controllers/movieController"));
const router = (0, express_1.Router)();
router
    .route("/")
    .get(movieController.getMovies) // Get movies with pagination params in query
    .post(isAdmin_1.isAdmin, movieController.addMovie); // Add a movie
router
    .route("/:id")
    .get(movieController.getMovieById)
    .patch(isAdmin_1.isAdmin, movieController.updateMovieById)
    .delete(isAdmin_1.isAdmin, movieController.deleteMovieById);
router.post("/:id/metadata", isAdmin_1.isAdmin, movieController.updateMetaData); //Change metadata a MKV file on the hard drive
router.get("/check/:movieDBId", isAdmin_1.isAdmin, movieController.isInDB); //Change metadata a MKV file on the hard drive
exports.default = router;