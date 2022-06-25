"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpHeaders = void 0;
const httpHeaders = async (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
};
exports.httpHeaders = httpHeaders;
