import { Application } from "express";

export const run = async (app: Application) => {
    app.listen(process.env.PORT, () => {
        console.log('Server started.');
    });
};