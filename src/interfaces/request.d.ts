import { ObjectId } from 'mongodb';

declare global {
    namespace Express {
        export interface Request {
            _userId?: ObjectId;
            _userAdmin?: boolean;
            _file?: File;
        }
    }
}

export {};