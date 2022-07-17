import MoviePagingDTO from 'dto/moviePagingDTO';
import { RequestTypeEnum } from 'enums/requestType';
import HttpException from 'exceptions/httpException';

import * as MovieRepository from 'repositories/movies';

export const getMovies = async (
    page: number,
    size: number,
    data: RequestTypeEnum,
): Promise<MoviePagingDTO> => {
    try {
        let moviePagingDTO = {
            page: page,
            size: size,
            requestType: data,
        } as MoviePagingDTO;

        const count = await MovieRepository.CountMovies();

        moviePagingDTO.nbResults = count;
        moviePagingDTO.nbPages = Math.ceil(count / size);

        switch (data) {
            case RequestTypeEnum.FULL:
                const moviesFull = await MovieRepository.GetMoviesFull(
                    page,
                    size,
                );
                if (moviesFull) {
                    moviePagingDTO.data = moviesFull;
                }
                break;
            case RequestTypeEnum.ADMIN:
                const moviesAdmin = await MovieRepository.GetMoviesAdmin(
                    page,
                    size,
                );
                if (moviesAdmin) {
                    moviePagingDTO.data = moviesAdmin;
                }
                break;
            case RequestTypeEnum.MINIMUM:
                const moviesMinimum = await MovieRepository.GetMoviesMinimum(
                    page,
                    size,
                );
                if (moviesMinimum) {
                    moviePagingDTO.data = moviesMinimum;
                }
                break;
            default:
                moviePagingDTO.data = [];
        }

        return moviePagingDTO;
    } catch (err) {
        throw err;
    }
};
