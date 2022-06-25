"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
require("dotenv").config();
const app = (0, express_1.default)();
const database_1 = require("./database/database");
// Manage HTTP requests
const serverErrorManager = require("./handlers/serverErrors");
const httpHeaders = require("./config/httpHeaders");
// routes
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const authRouter = require("./routes/authRouter");
const movieRouter = require("./routes/movieRouter");
const theMovideDBRouter = require("./routes/theMovideDBRouter");
// HTTP requests setup
app.use(body_parser_1.json);
app.use((0, body_parser_1.urlencoded)({ extended: false }));
app.use(httpHeaders);
// Routes
app.use("/api/auth/", authRouter);
app.use("/api/movies/", movieRouter);
app.use("/api/users/", userRouter_1.default);
app.use("/api/the-movie-db/", theMovideDBRouter);
app.use(serverErrorManager);
// Connect to db and run server
(0, database_1.Initialise)(app);
