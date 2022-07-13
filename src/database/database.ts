import { ConnectOptions, connect } from 'mongoose';

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
