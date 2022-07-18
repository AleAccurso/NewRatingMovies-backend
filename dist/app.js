"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
// Manage HTTP requests
const httpHeaders_1 = require("@config/httpHeaders");
const error_1 = __importDefault(require("@middelwares/error"));
// routes
const userRouter_1 = __importDefault(require("@routes/userRouter"));
const authRouter_1 = __importDefault(require("@routes/authRouter"));
const movieRouter_1 = __importDefault(require("@routes/movieRouter"));
const theMovideDBRouter_1 = __importDefault(require("@routes/theMovideDBRouter"));
const database_1 = require("@database/database");
// Create server
const server = (0, express_1.default)();
// HTTP requests setup
server.use((0, body_parser_1.json)());
server.use((0, body_parser_1.urlencoded)({ extended: false }));
server.use(httpHeaders_1.httpHeaders);
// Routes
server.use('/api/auth/', authRouter_1.default);
server.use('/api/movies/', movieRouter_1.default);
server.use('/api/users/', userRouter_1.default);
server.use('/api/the-movie-db/', theMovideDBRouter_1.default);
server.use(error_1.default);
// Connect to db and run server
(0, database_1.start)(server);
