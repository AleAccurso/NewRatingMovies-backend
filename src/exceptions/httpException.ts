import { Request, Response, NextFunction } from 'express';
import { HttpCode } from '../enums/httpCode';

class HttpException extends Error {
    status: HttpCode;
    message: string;
    constructor(status: HttpCode, message: string) {
        super(message);
        this.status = status as number;
        this.message = message;
    }
}

export default HttpException;
