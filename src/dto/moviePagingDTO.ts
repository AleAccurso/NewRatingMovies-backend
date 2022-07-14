import IMovie from "../models/movie";

export default interface MoviePagingDTO {
    page: number,
    size: number,
    nbPages?: number,
    nbResults?: number,
    data?: IMovie[],
}