import { Request, Response, NextFunction } from "express";

interface Error {
    status?: number;
    message?: string;
    data?: object;
}

export const serverErrorManager = async (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const status = error.status || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
    next();
};
