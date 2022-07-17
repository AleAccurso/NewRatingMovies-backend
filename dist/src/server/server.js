"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const run = async (app) => {
    app.listen(process.env.PORT, () => {
        console.log('Server started.');
    });
};
exports.run = run;
