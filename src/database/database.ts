import { ConnectOptions, connect } from 'mongoose';

export const connectDB = async () => {
    await connect(process.env.MONGOOSE_URI, {
        useNewUrlParser: true,
        useFindOneAndUpdate: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    } as ConnectOptions)
        .then(() => {
                console.log('DB connected.');
        })
        .catch((err: Error) => console.log(err));
};