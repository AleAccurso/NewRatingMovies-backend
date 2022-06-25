"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = async (error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
    next();
};
