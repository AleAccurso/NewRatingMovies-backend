import { Document } from "mongoose";

export default interface IUser extends Document {
    nickname: string,
    email: string,
    password: string,
    isAdmin: boolean,
    myFavorites: number[],
    myRates: [{movieDbId: number, rate: number}],
    language: "en" | "fr" | "it" | "nl",
    profilePic: string
}