import express from "express";
import dotenv from 'dotenv';
import { json, urlencoded } from "body-parser";

import { connectDB } from "./database/database"

// Manage HTTP requests
import { ErrorHandler } from "./handlers/ErrorHandler";
import { httpHeaders } from "./config/httpHeaders";

// routes
import userRouter from "./routes/userRouter";
import authRouter from "./routes/authRouter";
import movieRouter from "./routes/movieRouter";
import theMovideDBRouter from "./routes/theMovideDBRouter";

import { routerParamConverter } from "./middelware/routes";
import { start } from "./server/server";

// Create server
const server = express();

// connect DB
connectDB()

// Make env variable available
dotenv.config()

// HTTP requests setup
server.use(json);
server.use(urlencoded({ extended: false }));
server.use(httpHeaders);

// Routes
server.use("/api/auth/", authRouter);
server.use("/api/movies/", movieRouter);
server.use("/api/users/", userRouter);
server.use("/api/the-movie-db/", theMovideDBRouter);

server.use(routerParamConverter);
server.use(ErrorHandler);

// Connect to db and run server
start(server);
