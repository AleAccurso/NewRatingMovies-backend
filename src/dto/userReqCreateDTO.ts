import { language } from "types/language";

export default interface UserReqCreateDTO {
    nickname: string,
    email: string,
    password: string,
    language: language
}