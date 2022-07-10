"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const database_1 = require("./database/database");
// Manage HTTP requests
const ErrorHandler_1 = require("./handlers/ErrorHandler");
const httpHeaders_1 = require("./config/httpHeaders");
// routes
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const authRouter_1 = __importDefault(require("./routes/authRouter"));
const movieRouter_1 = __importDefault(require("./routes/movieRouter"));
const theMovideDBRouter_1 = __importDefault(require("./routes/theMovideDBRouter"));
const routes_1 = require("./middelware/routes");
const server_1 = require("./server/server");
// Create server
const server = (0, express_1.default)();
// connect DB
(0, database_1.connectDB)();
// HTTP requests setup
server.use(body_parser_1.json);
server.use((0, body_parser_1.urlencoded)({ extended: false }));
server.use(httpHeaders_1.httpHeaders);
// Routes
server.use("/api/auth/", authRouter_1.default);
server.use("/api/movies/", movieRouter_1.default);
server.use("/api/users/", userRouter_1.default);
server.use("/api/the-movie-db/", theMovideDBRouter_1.default);
server.use(routes_1.routerParamConverter);
server.use(ErrorHandler_1.ErrorHandler);
// Connect to db and run server
(0, server_1.start)(server);
