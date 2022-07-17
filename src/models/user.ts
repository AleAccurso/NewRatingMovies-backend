import { language } from "types/language";
import { Document, Model, ObjectId } from "mongoose";

export default interface IUser extends Document {
    _id: ObjectId,
    nickname: string,
    email: string,
    password: string,
    isAdmin: boolean,
    myFavorites: number[],
    myRates: [{movieDbId: number, rate: number}],
    language: language,
    profilePic: string
}

export interface User extends Model<IUser> {}