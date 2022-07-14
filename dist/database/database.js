"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const mongoose_1 = require("mongoose");
const server_1 = require("../server/server");
const start = async (app) => {
    (0, mongoose_1.set)('debug', true);
    // connection.once('open', function () {
    //     logger.info('MongoDB event open');
    //     // logger.debug('MongoDB connected [%s]', url);
    //     connection.on('connected', function () {
    //         logger.info('MongoDB event connected');
    //     });
    //     connection.on('disconnected', function () {
    //         logger.warn('MongoDB event disconnected');
    //     });
    //     connection.on('reconnected', function () {
    //         logger.info('MongoDB event reconnected');
    //     });
    //     connection.on('error', function (err) {
    //         logger.error('MongoDB event error: ' + err);
    //     });
    // });
    return await (0, mongoose_1.connect)(process.env.MONGOOSE_URI, {
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
