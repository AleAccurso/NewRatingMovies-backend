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
server.Initialise(app);

// function print(path, layer) {
//     if (layer.route) {
//         layer.route.stack.forEach(
//             print.bind(null, path.concat(split(layer.route.path))),
//         );
//     } else if (layer.name === 'router' && layer.handle.stack) {
//         layer.handle.stack.forEach(
//             print.bind(null, path.concat(split(layer.regexp))),
//         );
//     } else if (layer.method) {
//         console.log(
//             '%s /%s',
//             layer.method.toUpperCase(),
//             path.concat(split(layer.regexp)).filter(Boolean).join('/'),
//         );
//     }
// }

// function split(thing) {
//     if (typeof thing === 'string') {
//         return thing.split('/');
//     } else if (thing.fast_slash) {
//         return '';
//     } else {
//         var match = thing
//             .toString()
//             .replace('\\/?', '')
//             .replace('(?=\\/|$)', '$')
//             .match(
//                 /^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//,
//             );
//         return match
//             ? match[1].replace(/\\(.)/g, '$1').split('/')
//             : '<complex:' + thing.toString() + '>';
//     }
// }

// app._router.stack.forEach(print.bind(null, []));
