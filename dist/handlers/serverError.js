"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverErrorManager = void 0;
const serverErrorManager = async (error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
    next();
};
exports.serverErrorManager = serverErrorManager;
