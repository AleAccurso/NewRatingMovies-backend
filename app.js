require("dotenv").config();

const express = require("express");
const app = express();

const server = require("./database/database");

// Manage HTTP requests
const serverErrorManager = require("./handlers/serverErrors");
const bodyParser = require("body-parser");
const httpHeaders = require("./config/httpHeaders");

// routes
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const movieRouter = require("./routes/movieRouter");
const theMovideDBRouter = require("./routes/theMovideDBRouter");

// HTTP requests setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(httpHeaders);

// Routes
app.use("/api/auth/", authRouter);
app.use("/api/movies/", movieRouter);
app.use("/api/users/", userRouter);
app.use("/api/the-movie-db/", theMovideDBRouter);

app.use(serverErrorManager);

// Connect to db and run server
app.keepAliveTimeout = 25 * 60 * 1000;
app.headersTimeout = 25 * 60 * 1000;
server.Initialise(app);
