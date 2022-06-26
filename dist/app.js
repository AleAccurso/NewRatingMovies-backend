"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = require("body-parser");
const database_1 = require("./database/database");
// Manage HTTP requests
const serverError_1 = require("./handlers/serverError");
const httpHeaders_1 = require("./config/httpHeaders");
// routes
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const authRouter_1 = __importDefault(require("./routes/authRouter"));
const movieRouter_1 = __importDefault(require("./routes/movieRouter"));
const theMovideDBRouter_1 = __importDefault(require("./routes/theMovideDBRouter"));
// Create app
const app = (0, express_1.default)();
// Make env variable available
dotenv_1.default.config();
// HTTP requests setup
app.use(body_parser_1.json);
app.use((0, body_parser_1.urlencoded)({ extended: false }));
app.use(httpHeaders_1.httpHeaders);
// Routes
app.use("/api/auth/", authRouter_1.default);
app.use("/api/movies/", movieRouter_1.default);
app.use("/api/users/", userRouter_1.default);
app.use("/api/the-movie-db/", theMovideDBRouter_1.default);
app.use(serverError_1.serverErrorManager);
// Connect to db and run server
(0, database_1.Initialise)(app);
