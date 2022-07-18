import IMovie from "@models/movie";
import { requestType } from '@mytypes/requestType';

export default interface MoviePagingDTO {
    page: number,
    size: number,
    requestType: requestType,
    nbPages?: number,
    nbResults?: number,
    data?: IMovie[],
}