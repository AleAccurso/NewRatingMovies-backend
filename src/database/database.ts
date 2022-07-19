import { Application } from 'express';
import { ConnectOptions, connect, connection, set } from 'mongoose';
import { run } from '@server/server';
import { config } from 'dotenv';
import bunyan from 'bunyan';

config();

export const start = async (app: Application) => {
    set('debug', true);

    var logger = bunyan.createLogger({name: "myapp"});

    connection.once('open', function () {
        logger.info('MongoDB event open');
        // logger.debug('MongoDB connected [%s]', url);

        connection.on('connected', function () {
            logger.info('MongoDB event connected');
        });

        connection.on('disconnected', function () {
            logger.warn('MongoDB event disconnected');
        });

        connection.on('reconnected', function () {
            logger.info('MongoDB event reconnected');
        });

        connection.on('error', function (err) {
            logger.error('MongoDB event error: ' + err);
        });
    });

    const connectWithRetry = async() => {
    return await connect(process.env.MONGOOSE_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as ConnectOptions)
        .then(() => {
            console.log('DB connected.');
            run(app);
        })
        .catch((err: Error) => {
            console.log(err);
            setTimeout(connectWithRetry, 5000);
        });
    }
    connectWithRetry();
};
