"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Initialise = void 0;
const mongoose_1 = require("mongoose");
const Initialise = async (app) => {
    await (0, mongoose_1.connect)(process.env.MONGOOSE_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('Server started.');
        });
    })
        .catch((err) => console.log(err));
};
exports.Initialise = Initialise;
