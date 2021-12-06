require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// routes
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const movieRouter = require("./routes/movieRouter");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/api/auth/", authRouter);
app.use("/api/movies", movieRouter);
app.use("/api/users", userRouter);

//<---------></--------->
//user
app.get("api/users", (req, res) => {}); // Get all users

app
  .route("api/users/:id")
  .get((req, res) => {}) // Get info about a user -->not working
  .patch((req, res) => {}) // Update a user
  .delete((req, res) => {}); //Delete a user

//<---------></--------->
//Movies

app
  .route("api/movies")
  .get((req, res) => {}) //Get all movies
  .post((req, res) => {}); //Add a movie

app
  .route("api/movies/:id")
  .get((req, res) => {}) //Get a specific movie by movieDbId
  .delete((req, res) => {}); //Delete movie

// API - theMovieDB
app.post("api/movies/search/:title", (req, res) => {}); // Get a search result
app.post("api/movies/:id/getInfo", (req, res) => {}); // Get information about a movie from API

//Local
app.post("api/movies/:id/metadata", (req, res) => {}); //Change metadata a MKV file on the hard drive

//
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// connect to db
mongoose
  .connect(process.env.MONGOOSE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    app.listen(process.env.PORT, () =>
      console.log("server started on port", process.env.PORT)
    );
  })
  .catch((err) => console.log(err));
