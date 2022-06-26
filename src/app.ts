import express from "express";
import dotenv from 'dotenv';
import { json, urlencoded } from "body-parser";

import { Initialise } from "./database/database";

// Manage HTTP requests
import { serverErrorManager } from "./handlers/serverError";
import { httpHeaders } from "./config/httpHeaders";

// routes
import userRouter from "./routes/userRouter";
import authRouter from "./routes/authRouter";
import movieRouter from "./routes/movieRouter";
import theMovideDBRouter from "./routes/theMovideDBRouter";

// Create app
const app = express();

// Make env variable available
dotenv.config()

// HTTP requests setup
app.use(json);
app.use(urlencoded({ extended: false }));
app.use(httpHeaders);

// Routes
app.use("/api/auth/", authRouter);
app.use("/api/movies/", movieRouter);
app.use("/api/users/", userRouter);
app.use("/api/the-movie-db/", theMovideDBRouter);

app.use(serverErrorManager);

// Connect to db and run server
Initialise(app);
