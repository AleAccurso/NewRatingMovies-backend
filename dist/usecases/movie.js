"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMovies = void 0;
const requestType_1 = require("enums/requestType");
const MovieRepository = __importStar(require("repositories/movies"));
const getMovies = async (page, size, data) => {
    try {
        let moviePagingDTO = {
            page: page,
            size: size,
            requestType: data,
        };
        const count = await MovieRepository.CountMovies();
        moviePagingDTO.nbResults = count;
        moviePagingDTO.nbPages = Math.ceil(count / size);
        switch (data) {
            case requestType_1.RequestTypeEnum.FULL:
                const moviesFull = await MovieRepository.GetMoviesFull(page, size);
                if (moviesFull) {
                    moviePagingDTO.data = moviesFull;
                }
                break;
            case requestType_1.RequestTypeEnum.ADMIN:
                const moviesAdmin = await MovieRepository.GetMoviesAdmin(page, size);
                if (moviesAdmin) {
                    moviePagingDTO.data = moviesAdmin;
                }
                break;
            case requestType_1.RequestTypeEnum.MINIMUM:
                const moviesMinimum = await MovieRepository.GetMoviesMinimum(page, size);
                if (moviesMinimum) {
                    moviePagingDTO.data = moviesMinimum;
                }
                break;
            default:
                moviePagingDTO.data = [];
        }
        return moviePagingDTO;
    }
    catch (err) {
        throw err;
    }
};
exports.getMovies = getMovies;
