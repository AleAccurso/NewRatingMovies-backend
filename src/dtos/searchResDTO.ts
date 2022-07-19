import { LanguagesEnum } from "@enums/languages";

export default interface SearchLocalDTO {
    poster_path: string,
    title: string,
    overview: string
}

export type searchLocalKey = {[key in LanguagesEnum]: SearchLocalDTO}

export default interface SearchResDTO {
    id: number,
    release_date: string,
    localSearchInfo: searchLocalKey
}