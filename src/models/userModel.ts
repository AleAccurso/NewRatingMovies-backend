import { Schema, model } from 'mongoose';
import IUser from '../interfaces/user';
import Rate from './subSchema/rate';

const UserSchema = new Schema<IUser>(
    {
        nickname: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isAdmin: { type: Boolean, required: true, default: false },
        myFavorites: { type: [Number], default: [] },
        myRates: { type: [Rate] },
        language: { type: String, required: true, default: 'fr' },
        profilePic: { type: String, required: false },
    },
    { timestamps: true },
);

export const User = model<IUser>('User', UserSchema);
