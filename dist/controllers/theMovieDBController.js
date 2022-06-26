"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInfoFromAPI = exports.getSearchResultsFromAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const responseMessages_1 = require("../contants/responseMessages");
//Get search result from api
const getSearchResultsFromAPI = (req, res, next) => {
    let url = process.env.API_URL +
        '/search/movie?api_key=' +
        process.env.API_TOKEN +
        '&query=' +
        req.params.title.replace(' ', '+') +
        '&language=' +
        req.params.language;
    axios_1.default
        .get(url)
        .then((response) => {
        let data = response.data['results'];
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
        .catch((err) => {
        if (!err.statusCode) {
            return res.status(500).json({
                message: responseMessages_1.msg.SERVER_ERROR,
            });
        }
        else {
            console.log('movieDBController/getSearchResultsFromAPI?statusCode=' +
                err.statusCode);
        }
        next(err);
    });
};
exports.getSearchResultsFromAPI = getSearchResultsFromAPI;
// Get the information about a movie from api
// Here, the id is actually the id of the movie in the API
// movieDbId in our DB
const getInfoFromAPI = async (req, res, next) => {
    let infoToReturn;
    const generalDetails = await axios_1.default
        .get(process.env.API_URL +
        '/movie/' +
        req.params.id +
        '?api_key=' +
        process.env.API_TOKEN +
        '&append_to_response=credits&language=en')
        .then((response) => {
        let fullMovieData = response.data;
        //gets the director's name
        let director = null;
        Object.entries(fullMovieData.credits.crew).forEach((crew) => {
            if (crew[1].job == 'Director') {
                director = crew[1].name;
            }
        });
        //Get all names of genre
        let genres = [];
        fullMovieData['genres'].forEach((genre) => {
            genres.push(genre.name.replace(' ', '').toLowerCase());
        });
        //Make an string of the 3 first actors
        let actors = '';
        if (fullMovieData['credits']['cast']) {
            if (fullMovieData['credits']['cast'][0]) {
                actors += fullMovieData['credits']['cast'][0]['name'];
            }
            if (fullMovieData['credits']['cast'][1]) {
                actors +=
                    ' - ' + fullMovieData['credits']['cast'][1]['name'];
            }
            if (fullMovieData['credits']['cast'][2]) {
                actors +=
                    ' - ' + fullMovieData['credits']['cast'][2]['name'];
            }
        }
        if (actors.count === 0) {
            actors = null;
        }
        //Build bassic object to return
        infoToReturn = {
            movieDbId: fullMovieData['id'],
            genre: genres,
            vote_average: fullMovieData['vote_average'],
            vote_count: fullMovieData['vote_count'],
            release_date: fullMovieData['release_date'],
            director: director,
            casting: actors,
        };
    })
        .catch((err) => {
        if (!err.statusCode) {
            return res.status(500).json({
                message: responseMessages_1.msg.SERVER_ERROR,
            });
        }
        else {
            console.log('movieDBController/getInfoFromAPI?statusCode-general-details=' +
                err.statusCode);
        }
        next(err);
    });
    //Add information of the other languages
    let langList = JSON.parse(process.env.LANGUAGES);
    for (let index = 0; index < langList.length; index++) {
        const localInfo = await axios_1.default
            .get(process.env.API_URL +
            '/movie/' +
            req.params.id +
            '?api_key=' +
            process.env.API_TOKEN +
            '&language=' +
            langList[index])
            .then(async (response) => {
            fullMovieData = await response.data;
            infoToReturn[langList[index]] = {
                title: fullMovieData['title'],
                overview: fullMovieData['overview'],
                poster_path: fullMovieData['poster_path'],
            };
        })
            .catch((err) => {
            if (!err.statusCode) {
                return res.status(500).json({
                    message: responseMessages_1.msg.SERVER_ERROR,
                });
            }
            else {
                console.log('movieDBController/getInfoFromAPI?statusCode-local-details=' +
                    err.statusCode);
            }
            next(err);
        });
        const trailers = await axios_1.default
            .get(process.env.API_URL +
            '/movie/' +
            req.params.id +
            '/videos?api_key=' +
            process.env.API_TOKEN +
            '&language=' +
            langList[index])
            .then(async (response) => {
            videos = await response.data.results;
            let movieTrailers = [];
            videos.forEach((video) => {
                if (video.site == 'YouTube' &&
                    ['Trailer', 'Teaser'].includes(video.type)) {
                    let toAdd = {
                        name: video.name,
                        key: video.key,
                    };
                    movieTrailers.push(toAdd);
                }
            });
            infoToReturn[langList[index]].trailers = movieTrailers;
        })
            .catch((err) => {
            if (!err.statusCode) {
                return res.status(500).json({
                    message: responseMessages_1.msg.SERVER_ERROR,
                });
            }
            else {
                console.log('movieDBController/getInfoFromAPI?statusCode-trailers=' +
                    err.statusCode);
            }
            next(err);
        });
    }
    res.status(200).json(infoToReturn);
};
exports.getInfoFromAPI = getInfoFromAPI;
