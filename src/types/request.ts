import { ObjectId } from 'mongodb';

import { language } from '@mytypes/language';

declare module 'express-serve-static-core' {
    export interface Request {
        _page?: number,
        _size?: number,
        _id?: ObjectId,
        _movieDbId?: number,
        _title?: string,
        _language?: language,
        _rate?: number,
        _userId?: ObjectId,
        _userAdmin?: boolean,
        file: File
    }
}