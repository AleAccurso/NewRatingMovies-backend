"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = require("mongoose");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
(0, dotenv_1.config)({
    path: (0, path_1.resolve)(__dirname, '../../.env'),
});
const connectDB = async () => {
    await (0, mongoose_1.connect)(process.env.MONGOOSE_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => {
        console.log('DB connected.');
    })
        .catch((err) => console.log(err));
};
exports.connectDB = connectDB;
