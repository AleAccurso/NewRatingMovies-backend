"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHelper = void 0;
const errorHelper = async (error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    const data = error === null || error === void 0 ? void 0 : error.data;
    res.status(status).json({ message: message, data: data });
};
exports.errorHelper = errorHelper;
