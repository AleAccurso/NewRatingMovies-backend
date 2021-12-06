require("dotenv").config();

const express = require("express");
const router = express.Router();
const movieModel = require("../models/movieModel");
const axios = require("axios");
const { exec } = require("child_process");
const { Console } = require("console");

//get all movies
router.get("/", (req, res) => {
  const movies = movieModel.find({}, (err, movies) => {
    if (err) {
      console.log("RETRIEVE error: " + err);
      res.status(500).send("Error");
    } else if (movies) {
      res.status(200).json(movies);
    }
  });
});

//Add a movie
router.post("/", (req, res) => {
  let movie = new movieModel({
    ...req.body,
  });
  movie
    .save()
    .then(() => res.status(201).json({ message: "Movie register sucessfull" }))
    .catch((error) => res.status(400).json({ error }));
});

//Get a specific movie by movieDbId
router.get("/:id", (req, res) => {
  const movies = movieModel.findOne(
    { movieDbId: req.params.id },
    (err, movies) => {
      if (err) {
        console.log("RETRIEVE error: " + err);
        res.status(500).send("Error");
      } else if (movies) {
        res.status(200).json(movies);
      }
    }
  );
});

//Update a movie
router.patch("/:id", (req, res) => {
  const movie = movieModel.updateOne(
    { id: req.params.id },
    req.body,
    (err, movie) => {
      if (err) {
        console.log("RETRIEVE error: " + err);
        res.status(500).send("Error");
      } else {
        res.status(200).json(req.body);
      }
    }
  );
});

//Delete movie from DB
router.route("/:id").delete((req, res) => {
  movieModel.deleteOne({ id: req.params.id }, (err) => {
    if (err) {
      res.status(500).send("Error");
    } else {
      res.status(200).json("Movie deleted");
    }
  });
});

//Get search result from api
router.post("/search/:title/:language", (req, res) => {
  let url =
    process.env.API_URL +
    "/search/movie?api_key=" +
    process.env.API_TOKEN +
    "&query=" +
    req.params.title.replace(" ", "+") +
    "&language=" +
    req.params.language;

  axios
    .get(url)
    .then((response) => {
      res.status(200).json(response.data["results"]);
    })
    .catch((error) => {
      console.log(error);
    });
});

// Get the information about a movie from api
// Here, the id is actually the id of the movie in the API
// movieDbId in our DB
router.post("/:id/getInfo", (req, res) => {
  axios
    .get(
      process.env.API_URL +
        "/movie/" +
        req.params.id +
        "?api_key=" +
        process.env.API_TOKEN +
        "&append_to_response=credits&language=fr"
    )
    .then((response) => {
      let fullMovieData = response.data;

      //gets the director's name
      let director = null;

      Object.entries(fullMovieData.credits.crew).forEach((crew) => {
        if (crew[1].job == "Director") {
          director = crew[1].name;
        }
      });

      //Make a string of all genres
      let strGenres = "";
      fullMovieData["genres"].forEach((genre) => {
        strGenres += genre.name + ", ";
      });
      strGenres = strGenres.slice(0, -2);

      //Make an string of the 3 first actors
      let actors = [];

      if (fullMovieData["credits"]["cast"]) {
        if (fullMovieData["credits"]["cast"][0]) {
          actors += fullMovieData["credits"]["cast"][0]["name"];
        }
        if (fullMovieData["credits"]["cast"][1]) {
          actors += " - " + fullMovieData["credits"]["cast"][1]["name"];
        }
        if (fullMovieData["credits"]["cast"][2]) {
          actors += " - " + fullMovieData["credits"]["cast"][2]["name"];
        }
      }

      if (actors.count === 0) {
        actors = null;
      }

      //Build object to return
      let infoToReturn = {
        movieDbId: fullMovieData["id"],
        title: fullMovieData["title"],
        strGenres: strGenres,
        vote_average: fullMovieData["vote_average"],
        vote_count: fullMovieData["vote_count"],
        release_date: fullMovieData["release_date"],
        poster_path: fullMovieData["poster_path"],
        director: director,
        overview: fullMovieData["overview"],
        casting: actors,
        language: "fr",
      };

      res.status(200).json(infoToReturn);
    })
    .catch((error) => {
      console.log(error);
    });
});

//Change metadata
router.post("/:id/metadata", (req, res) => {
  const job = req.body;

  //Get file extension
  const format = job.format.substring(job.format.indexOf("/") + 1);

  //Change title in metadata
  if (format === "x-matroska") {
    console.log(
      `mkvpropedit "${job.path}" -e info -s title="${job.selectedMovie.title}"`
    );

    exec(
      `mkvpropedit "${job.path}" -e info -s title="${job.selectedMovie.title}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        if (stdout) {
          console.log(stdout);
          res.status(200).json("Metadata modified");
        }
      }
    );
  } else {
    res.status(200).json("Not a MKV movie");
  }
});

module.exports = router;
