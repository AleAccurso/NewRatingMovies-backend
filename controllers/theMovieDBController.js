const axios = require("axios");

//Get search result from api
exports.getSearchResultsFromAPI = async (req, res, next) => {
  let url =
    process.env.API_URL +
    "/search/movie?api_key=" +
    process.env.API_TOKEN +
    "&query=" +
    req.params.title.replace(" ", "+") +
    "&language=" +
    req.params.language;
  let toReturn;
  axios
    .get(url)
    .then((response) => {
      let data = response.data["results"];
      let toReturn = [];

      for (let index = 0; index < data.length; index++) {
        toReturn.push({
          id: data[index].id,
          release_date: data[index].release_date,
          [req.params.language]: {
            poster_path: data[index].poster_path,
            title: data[index].title,
            overview: data[index].overview,
          },
        });
      }
      res.status(200).json(toReturn);
    })
    .catch((error) => {
      console.log(error);
    });
};

// Get the information about a movie from api
// Here, the id is actually the id of the movie in the API
// movieDbId in our DB
exports.getInfoFromAPI = async (req, res, next) => {
  let infoToReturn;

  await axios
    .get(
      process.env.API_URL +
        "/movie/" +
        req.params.id +
        "?api_key=" +
        process.env.API_TOKEN +
        "&append_to_response=credits&language=en"
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

      //Get all names of genre
      let genres = [];
      fullMovieData["genres"].forEach((genre) => {
        genres.push(genre.name.replace(" ", "").toLowerCase());
      });

      //Make an string of the 3 first actors
      let actors = "";

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

      //Build bassic object to return
      infoToReturn = {
        movieDbId: fullMovieData["id"],
        genre: genres,
        vote_average: fullMovieData["vote_average"],
        vote_count: fullMovieData["vote_count"],
        release_date: fullMovieData["release_date"],
        director: director,
        casting: actors,
      };
    })
    .catch((error) => {
      console.log(error);
    });

  //Add information of the other languages
  let langList = process.env.LANGUAGES;

  for (let index = 0; index < langList.length; index++) {
    await axios
      .get(
        process.env.API_URL +
          "/movie/" +
          req.params.id +
          "?api_key=" +
          process.env.API_TOKEN +
          "&language=" +
          langList[index]
      )
      .then((response) => {
        fullMovieData = response.data;
        infoToReturn[langList[index]] = {
          title: fullMovieData["title"],
          overview: fullMovieData["overview"],
          poster_path: fullMovieData["poster_path"],
        };
      })
      .catch((err) => {
        console.log(err);
      });

    await axios
      .get(
        process.env.API_URL +
          "/movie/" +
          req.params.id +
          "/videos?api_key=" +
          process.env.API_TOKEN +
          "&language=" +
          langList[index]
      )
      .then((response) => {
        videos = response.data.results;
        let movieTrailers = [];
        videos.forEach((video) => {
          if (
            video.site == "YouTube" &&
            ["Trailer", "Teaser"].includes(video.type)
          ) {
            let toAdd = {
              name: video.name,
              key: video.key,
            };
            movieTrailers.push(toAdd);
          }
        });
        infoToReturn[langList[index]].trailers = movieTrailers;
      });
  }
  res.status(200).json(infoToReturn);
};
