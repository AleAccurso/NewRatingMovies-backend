"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInfoFromAPI = exports.getSearchResultsFromAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("@constants/constants");
const languages_1 = require("@enums/languages");
const parseToInt_1 = require("@utils/parseToInt");
const parseToLanguage_1 = require("@utils/parseToLanguage");
const httpCode_1 = require("@enums/httpCode");
const httpException_1 = __importDefault(require("@exceptions/httpException"));
//Get search result from api
const getSearchResultsFromAPI = (req, res, next) => {
    let lang = languages_1.LanguagesEnum.UNKNOWN;
    if (req && req.params && req.params.language) {
        const parseResult = (0, parseToLanguage_1.ToLanguage)(req.params.language);
        if (parseResult === languages_1.LanguagesEnum.UNKNOWN) {
            throw new httpException_1.default(httpCode_1.HttpCode.BAD_REQUEST, constants_1.msg.BAD_PARAMS + req.params.language);
        }
        else {
            lang = parseResult;
        }
    }
    let url = process.env.API_URL +
        '/search/movie?api_key=' +
        process.env.API_TOKEN +
        '&query=' +
        req.params.title.replace(' ', '+') +
        '&language=' +
        lang;
    axios_1.default
        .get(url)
        .then((response) => {
        let data = response.data['results'];
        let toReturn = [];
        for (let index = 0; index < data.length; index++) {
            toReturn.push({
                id: data[index].id,
                release_date: data[index].release_date,
                [lang]: {
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
            throw new httpException_1.default(httpCode_1.HttpCode.INTERNAL_SERVER_ERROR, constants_1.msg.SERVER_ERROR);
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
    let movieDbIdInt = -1;
    if (req && req.params && req.params.id) {
        const parseResult = (0, parseToInt_1.parseToInt)(req.params.id);
        if (parseResult.error || typeof parseResult.parsedInt == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        }
        else {
            movieDbIdInt = parseResult.parsedInt;
        }
    }
    let infoToReturn = {};
    const generalDetails = await axios_1.default
        .get(process.env.API_URL +
        '/movie/' +
        movieDbIdInt +
        '?api_key=' +
        process.env.API_TOKEN +
        '&append_to_response=credits&language=en')
        .then((response) => {
        let fullMovieData = response.data;
        //gets the director's name
        let director = '';
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
                message: constants_1.msg.SERVER_ERROR,
            });
        }
        else {
            console.log('movieDBController/getInfoFromAPI?statusCode-general-details=' +
                err.statusCode);
        }
        next(err);
    });
    //Add information of the other languages
    let langList = Object.values(languages_1.LanguagesEnum);
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
            let fullMovieData = response.data;
            let local = {
                title: fullMovieData['title'],
                overview: fullMovieData['overview'],
                poster_path: fullMovieData['poster_path'],
            };
            switch (langList[index]) {
                case 'en':
                    infoToReturn.en = local;
                    break;
                case 'fr':
                    infoToReturn.fr = local;
                    break;
                case 'it':
                    infoToReturn.it = local;
                    break;
                case 'nl':
                    infoToReturn.nl = local;
                    break;
            }
        })
            .catch((err) => {
            if (!err.statusCode) {
                return res.status(500).json({
                    message: constants_1.msg.SERVER_ERROR,
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
            movieDbIdInt +
            '/videos?api_key=' +
            process.env.API_TOKEN +
            '&language=' +
            langList[index])
            .then(async (response) => {
            const videos = (await response.data
                .results);
            let movieTrailers = [];
            videos.forEach((video) => {
                if (video.site == 'YouTube' &&
                    ['Trailer', 'Teaser'].includes(video.type)) {
                    let toAdd = {
                        title: video.name,
                        key: video.key,
                    };
                    movieTrailers.push(toAdd);
                }
            });
            if (typeof movieTrailers != 'undefined') {
                switch (langList[index]) {
                    case 'en':
                        if (infoToReturn.en)
                            infoToReturn.en.trailers = movieTrailers;
                        break;
                    case 'fr':
                        if (infoToReturn.fr)
                            infoToReturn.fr.trailers = movieTrailers;
                        break;
                    case 'it':
                        if (infoToReturn.it)
                            infoToReturn.it.trailers = movieTrailers;
                        break;
                    case 'nl':
                        if (infoToReturn.nl)
                            infoToReturn.nl.trailers = movieTrailers;
                        break;
                }
            }
        })
            .catch((err) => {
            if (!err.statusCode) {
                return res.status(500).json({
                    message: constants_1.msg.SERVER_ERROR,
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
