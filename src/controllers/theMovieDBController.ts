import { RequestHandler } from 'express';
import axios from 'axios';
import { msg } from '../contants/responseMessages';
import IMovie from '../models/movie';
import { Trailer } from '../interfaces/trailer';
import { MovieInfoAPI } from '../interfaces/movieInfo';
import { localMovieInfo } from '../models/movie';

//Get search result from api
export const getSearchResultsFromAPI: RequestHandler = (req, res, next) => {
    let url =
        process.env.API_URL +
        '/search/movie?api_key=' +
        process.env.API_TOKEN +
        '&query=' +
        req.params.title.replace(' ', '+') +
        '&language=' +
        req.params.language;

    axios
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
                    message: msg.SERVER_ERROR,
                });
            } else {
                console.log(
                    'movieDBController/getSearchResultsFromAPI?statusCode=' +
                        err.statusCode,
                );
            }
            next(err);
        });
};

// Get the information about a movie from api
// Here, the id is actually the id of the movie in the API
// movieDbId in our DB
export const getInfoFromAPI: RequestHandler = async (req, res, next) => {
    const movieDbId = req._movieDbId;
    let infoToReturn = {} as IMovie;

    const generalDetails = await axios
        .get(
            process.env.API_URL +
                '/movie/' +
                movieDbId +
                '?api_key=' +
                process.env.API_TOKEN +
                '&append_to_response=credits&language=en',
        )
        .then((response) => {
            let fullMovieData = response.data as MovieInfoAPI;

            //gets the director's name
            let director = '';

            Object.entries(fullMovieData.credits.crew).forEach((crew) => {
                if (crew[1].job == 'Director') {
                    director = crew[1].name as string;
                }
            });

            //Get all names of genre
            let genres = [] as string[];

            fullMovieData['genres'].forEach(
                (genre: { id: number; name: string }) => {
                    genres.push(genre.name.replace(' ', '').toLowerCase());
                },
            );

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
            } as IMovie;
        })
        .catch((err) => {
            if (!err.statusCode) {
                return res.status(500).json({
                    message: msg.SERVER_ERROR,
                });
            } else {
                console.log(
                    'movieDBController/getInfoFromAPI?statusCode-general-details=' +
                        err.statusCode,
                );
            }
            next(err);
        });

    //Add information of the other languages
    let langList = process.env.LANGUAGES;

    for (let index = 0; index < langList.length; index++) {
        const localInfo = await axios
            .get(
                process.env.API_URL +
                    '/movie/' +
                    req.params.id +
                    '?api_key=' +
                    process.env.API_TOKEN +
                    '&language=' +
                    langList[index],
            )
            .then(async (response) => {
                let fullMovieData = response.data as MovieInfoAPI;

                let local:localMovieInfo = {
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
                        message: msg.SERVER_ERROR,
                    });
                } else {
                    console.log(
                        'movieDBController/getInfoFromAPI?statusCode-local-details=' +
                            err.statusCode,
                    );
                }
                next(err);
            });

        const trailers = await axios
            .get(
                process.env.API_URL +
                    '/movie/' +
                    movieDbId +
                    '/videos?api_key=' +
                    process.env.API_TOKEN +
                    '&language=' +
                    langList[index],
            )
            .then(async (response) => {
                const videos: Trailer[] = (await response.data
                    .results) as Trailer[];

                let movieTrailers = [] as { title: string; key: string }[];
                videos.forEach((video) => {
                    if (
                        video.site == 'YouTube' &&
                        ['Trailer', 'Teaser'].includes(video.type)
                    ) {
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
                            if (infoToReturn.en) infoToReturn.en.trailers = movieTrailers;
                            
                            break;
                        case 'fr':
                            if (infoToReturn.fr) infoToReturn.fr.trailers = movieTrailers;
                            break;
                        case 'it':
                            if (infoToReturn.it) infoToReturn.it.trailers = movieTrailers;
                            break;
                        case 'nl':
                            if (infoToReturn.nl) infoToReturn.nl.trailers = movieTrailers;
                            break;
                    }
                }
            })
            .catch((err) => {
                if (!err.statusCode) {
                    return res.status(500).json({
                        message: msg.SERVER_ERROR,
                    });
                } else {
                    console.log(
                        'movieDBController/getInfoFromAPI?statusCode-trailers=' +
                            err.statusCode,
                    );
                }
                next(err);
            });
    }

    res.status(200).json(infoToReturn);
};
