"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const mongoose_1 = require("mongoose");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
(0, dotenv_1.config)({
    path: (0, path_1.resolve)(__dirname, '../../.env'),
});
const run = async (app) => {
    console.log('connecting DB ...');
    const conn = await (0, mongoose_1.connect)(process.env.MONGOOSE_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => {
        console.log('DB connected.');
        app.listen(process.env.PORT, () => {
            console.log(`Server started on port ${process.env.PORT}.`);
        });
    })
        .catch((err) => console.log(err));
};
exports.run = run;
