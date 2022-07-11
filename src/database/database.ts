import { ConnectOptions, connect } from 'mongoose';
import { config as configDotenv } from 'dotenv';
import { resolve } from 'path';
import { Application } from 'express';

configDotenv({
    path: resolve(__dirname, '../../.env'),
});

export const run = async (app: Application) => {
    console.log('connecting DB ...');
    const conn = await connect(process.env.MONGOOSE_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as ConnectOptions)
        .then(() => {
            console.log('DB connected.');
            app.listen(process.env.PORT, () => {
                console.log(`Server started on port ${process.env.PORT}.`);
            });
        })
        .catch((err: Error) => console.log(err));
};
