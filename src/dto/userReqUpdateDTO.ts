import { language } from "../types/language";

export default interface UserReqCreateDTO {
    nickname: string,
    email: string,
    admin: boolean,
    language: language,
    profilePic: string
}