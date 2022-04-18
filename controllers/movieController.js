require("dotenv").config();

const movieModel = require("../models/movieModel");
const userModel = require("../models/userModel");

const { msg } = require("../constants/response_messages");
const { exec } = require("child_process");
const { Console } = require("console");

//get movies
exports.getMovies = async (req, res, next) => {
  pageInt = parseInt(req.query.page);
  sizeInt = parseInt(req.query.size);
  data = req.query.data;

  totalNbMovies = await movieModel.countDocuments({});

  dataToSend = {
    nbMovies: totalNbMovies,
  };

  if (!isNaN(pageInt) && !isNaN(sizeInt)) {
    if (data == "full") {
      const movies = movieModel
        .find()
        .skip(pageInt * sizeInt)
        .limit(sizeInt)
        .exec((err, movies) => {
          if (err) {
            res.status(500).send({ message: msg.SERVER_ERROR });
          } else if (movies) {
            dataToSend["movies"] = movies;
            res.status(200).json(dataToSend);
          }
        });
    } else if (data == "admin") {
      const movies = movieModel
        .find()
        .select({
          release_date: 1,
          vote_average: 1,
          director: 1,
          en: {
            title: 1,
            overview: 1,
          },
          fr: {
            title: 1,
            overview: 1,
          },
          it: {
            title: 1,
            overview: 1,
          },
          nl: {
            title: 1,
            overview: 1,
          },
        })
        .skip(pageInt * sizeInt)
        .limit(sizeInt)
        .exec((err, movies) => {
          if (err) {
            res.status(500).send({ message: msg.SERVER_ERROR });
          } else if (movies) {
            dataToSend["movies"] = movies;
            res.status(200).json(dataToSend);
          }
        });
    } else if (data == "min") {
      const movies = movieModel
        .find()
        .select({
          _id: 1,
          movieDbId: 1,
          release_date: 1,
          en: {
            title: 1,
            poster_path: 1,
          },
          fr: {
            title: 1,
            poster_path: 1,
          },
          it: {
            title: 1,
            poster_path: 1,
          },
          nl: {
            title: 1,
            poster_path: 1,
          },
        })
        .skip(pageInt * sizeInt)
        .limit(sizeInt)
        .exec((err, movies) => {
          if (err) {
            res.status(500).send({ message: msg.SERVER_ERROR });
          } else if (movies) {
            dataToSend["movies"] = movies;
            res.status(200).json(dataToSend);
          }
        });
    } else {
      res.status(400).json({ message: msg.BAD_PARAMS + "data" });
    }
  } else {
    res.status(400).json({ message: msg.BAD_PARAMS + "page_size" });
  }
};

//Add a movie
exports.addMovie = async (req, res, next) => {
  let movie = new movieModel({
    ...req.body,
  });

  movie
    .save()
    .then(() => {
      res.status(201).json({ message: msg.SUCCESS_ACTION + "add_movie" });
      next();
    })
    .catch((error) => res.status(400).json({ message: error }));
};

//Get movie by its id
exports.getMovieById = async (req, res, next) => {
  const movies = movieModel.findOne({ _id: req.params.id }, (err, movie) => {
    if (err) {
      res.status(404).send({ message: msg.RESOURCE_NOT_FOUND + "movie" });
    } else if (movies) {
      res.status(200).json(movie);
    }
  });
};

//Update a movie
exports.updateMovie = async (req, res, next) => {
  const movie = movieModel.findOneAndUpdate(
    { _id: req.params.id },
    {
      ...req.body,
    },
    (err) => {
      if (err) {
        res.status(500).send({ message: msg.SERVER_ERROR });
      } else {
        res.status(200).json(req.body);
      }
    }
  );
};

//Delete movie from DB
exports.deleteMovie = async (req, res, next) => {
  idToRemove = req.params.id;
  const movies = movieModel.findOne({ _id: idToRemove }, (err, movie) => {
    if (err) {
      res.status(404).send({ message: msg.RESOURCE_NOT_FOUND + "movie" });
    } else if (movie) {
      // Remove movie if movie in favorite and/or rate of a user
      userModel
        .find()
        .cursor()
        .eachAsync((user) => {
          // Favorites
          if (user.myFavorites.includes(movie.movieDbId)) {
            const index = user.myFavorites.indexOf(movie.movieDbId);
            if (index > -1) {
              user.myFavorites.splice(index, 1);
            }
          }
          //Rates
          console.log("rates:", user.myRates);
          console.log("movie to remove:", movie.movieDbId);
          for (let i = 0; i < user.myRates.length; i++) {
            if (user.myRates[i].movieDbId == movie.movieDbId) {
              console.log("in");
              user.myRates.splice(i, 1);
            }
          }
        });

      // Remove movie from DB
      movieModel.deleteOne({ id: idToRemove }, (err) => {
        if (err) {
          res.status(500).send({ message: msg.SERVER_ERROR });
        } else {
          res.status(200).json({
            message: msg.SUCCESS_ACTION + "delete_movie",
            deletedId: movie._id,
          });
        }
      });
    }
  });
};

//Change metadata
exports.updateMetaData = async (req, res, next) => {
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
          // console.log(`error: ${error.message}`);
          // return;
          res.status(500).json({ message: error.message });
        }
        if (stderr) {
          // console.log(`stderr: ${stderr}`);
          // return;
          res.status(400).json({ message: stderr });
        }
        if (stdout) {
          console.log(stdout);
          res
            .status(200)
            .json({ message: msg.SUCCESS_ACTION + "update_metadata" });
        }
      }
    );
  } else {
    res.status(400).json({ message: msg.BAD_DATA + "mkv_required" });
  }
};

// Checks if a movie with the concerned movieDBId is in DB
exports.isInDB = async (req, res, next) => {
  const movies = movieModel.findOne(
    { movieDbId: req.params.movieDBId },
    (err, movie) => {
      if (err) {
        res.status(404).send({ message: msg.RESOURCE_NOT_FOUND + "movie" });
      } else if (movies) {
        res.status(200).json(movie);
      }
    }
  );
};
