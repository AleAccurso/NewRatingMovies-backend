import { ConnectOptions, connect } from 'mongoose';
import { Application } from 'express';

export const Initialise = async (app: Application) => {
    await connect(process.env.MONGOOSE_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as ConnectOptions)
        .then(() => {
            app.listen(process.env.PORT, () => {
                console.log('Server started.');
            });
        })
        .catch((err: Error) => console.log(err));
};
