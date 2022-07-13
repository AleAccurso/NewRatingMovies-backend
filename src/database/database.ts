import { Application } from 'express';
import { ConnectOptions, connect } from 'mongoose';
import { run } from '../server/server';

export const start = async (app: Application) => {
    await connect(process.env.MONGOOSE_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as ConnectOptions)
        .then(() => {
            console.log('DB connected.');
            run(app);
        })
        .catch((err: Error) => console.log(err));
};
