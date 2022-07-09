"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = require("mongoose");
const connectDB = async () => {
    await (0, mongoose_1.connect)(process.env.MONGOOSE_URI, {
        useNewUrlParser: true,
        useFindOneAndUpdate: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
        .then(() => {
        console.log('DB connected.');
    })
        .catch((err) => console.log(err));
};
exports.connectDB = connectDB;
