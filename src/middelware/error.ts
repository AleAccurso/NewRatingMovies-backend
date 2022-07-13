import { Request, Response, NextFunction } from "express";

interface Error {
    status: number;
    message: string;
    data?: object;
}

export const errorHelper = async (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    const data = error?.data;
    res.status(status).json({ message: message, data: data });
};
