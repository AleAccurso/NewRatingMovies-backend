import { Request, Response, NextFunction } from "express";
import { HttpCode } from "../enums/httpCode";

interface Error {
    status: HttpCode;
    message: string;
}

export const errorHelper = async (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ message: message });
};
