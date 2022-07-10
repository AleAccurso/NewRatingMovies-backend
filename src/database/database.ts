import { ConnectOptions, connect } from 'mongoose';
import { config as configDotenv } from 'dotenv';
import { resolve } from 'path';

configDotenv({
    path: resolve(__dirname, '../../.env'),
});

export const connectDB = async () => {
    await connect(process.env.MONGOOSE_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as ConnectOptions)
        .then(() => {
            console.log('DB connected.');
        })
        .catch((err: Error) => console.log(err));
};
