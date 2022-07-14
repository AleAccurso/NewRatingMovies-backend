import { Movie } from '../schema/movie';
import IMovie from '../models/movie';
import MoviePagingDTO from '../dto/moviePagingDTO';
import { RequestTypeEnum } from '../enums/requestType';

import * as MovieRepository from '../repositories/movies';

export const getMovies = async(
    page: number,
    size: number,
    data: RequestTypeEnum,
): Promise<MoviePagingDTO> => {
    try {
        let moviePagingDTO = {page: page, size: size} as MoviePagingDTO

        const countResponse = await MovieRepository.CountMovies();
        if (countResponse.count) {
            moviePagingDTO.nbResults = countResponse.count
            moviePagingDTO.nbPages = Math.ceil(countResponse.count/size)
        }
    
        switch (data) {
            case RequestTypeEnum.FULL:
                const responseFull = await MovieRepository.GetMoviesFull(page, size);
                if (responseFull.movies) {
                    moviePagingDTO.data = responseFull.data
                }
            case RequestTypeEnum.ADMIN:
                const responseAdmin = await MovieRepository.GetMoviesAdmin(page, size);
                if (responseAdmin.movies) {
                    moviePagingDTO.data = responseAdmin.movies
                }
            case RequestTypeEnum.MINIMUM:
                const responseMinimum = await MovieRepository.GetMoviesAdmin(page, size);
                if (responseMinimum.movies) {
                    moviePagingDTO.data = responseMinimum.movies
                }
        }

        return moviePagingDTO
        
    } catch (error) {
        
    }
};
