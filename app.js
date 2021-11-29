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
app.use("/api", userRouter);

//<---------></--------->
//user
app.route("api/users").get((req, res) => {});

app.route("api/user/:userId").get((req, res) => {});

app.route("api/user/update/:userId").patch((req, res) => {});

app.route("api/user/delete/:userId").delete((req, res) => {});

//<---------></--------->
//Movies

app
  .route("api/movies")
  .get((req, res) => {})
  .post((req, res) => {});

app
  .route("api/movies/:id")
  .get((req, res) => {})
  .patch((req, res) => {});

app.route("api/movies/search/:title").post((req, res) => {});
app.route("api/movies/:id/getInfo").post((req, res) => {});

app.route("api/movies/delete/:id").delete((req, res) => {});

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
