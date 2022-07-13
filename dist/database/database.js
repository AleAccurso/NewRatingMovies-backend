"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const mongoose_1 = require("mongoose");
const server_1 = require("../server/server");
const start = async (app) => {
    await (0, mongoose_1.connect)(process.env.MONGOOSE_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => {
        console.log('DB connected.');
        (0, server_1.run)(app);
    })
        .catch((err) => console.log(err));
};
exports.start = start;
