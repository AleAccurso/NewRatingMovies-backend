"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const mongoose_1 = require("mongoose");
const server_1 = require("@server/server");
const dotenv_1 = require("dotenv");
const bunyan_1 = __importDefault(require("bunyan"));
(0, dotenv_1.config)();
const start = async (app) => {
    (0, mongoose_1.set)('debug', true);
    var logger = bunyan_1.default.createLogger({ name: "myapp" });
    mongoose_1.connection.once('open', function () {
        logger.info('MongoDB event open');
        // logger.debug('MongoDB connected [%s]', url);
        mongoose_1.connection.on('connected', function () {
            logger.info('MongoDB event connected');
        });
        mongoose_1.connection.on('disconnected', function () {
            logger.warn('MongoDB event disconnected');
        });
        mongoose_1.connection.on('reconnected', function () {
            logger.info('MongoDB event reconnected');
        });
        mongoose_1.connection.on('error', function (err) {
            logger.error('MongoDB event error: ' + err);
        });
    });
    const connectWithRetry = async () => {
        return await (0, mongoose_1.connect)(process.env.MONGOOSE_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
            .then(() => {
            console.log('DB connected.');
            (0, server_1.run)(app);
        })
            .catch((err) => {
            console.log(err);
            setTimeout(connectWithRetry, 5000);
        });
    };
    connectWithRetry();
};
exports.start = start;
