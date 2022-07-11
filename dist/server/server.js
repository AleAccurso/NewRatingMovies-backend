"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const start = (app) => {
    app.listen(process.env.PORT, () => {
        console.log('Server started.');
    });
};
exports.start = start;
