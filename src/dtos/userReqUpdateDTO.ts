import { language } from "@mytypes/language";

export default interface UserReqUpdateDTO {
    nickname: string,
    email: string,
    admin: boolean,
    language: language,
    profilePic: string
}