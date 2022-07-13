import { Application } from "express";

export const start = async (app: Application) => {
    app.listen(process.env.PORT, () => {
        console.log('Server started.');
    });
};