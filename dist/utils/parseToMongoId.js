"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseToMongoId = void 0;
const mongodb_1 = require("mongodb");
const responseMessages_1 = require("../contants/responseMessages");
const parseToMongoId = (str) => {
    let parsedId = undefined;
    let error = undefined;
    parsedId = new mongodb_1.ObjectId(str);
    if (typeof parsedId == 'undefined') {
        error = new Error(responseMessages_1.msg.BAD_PARAMS + str);
    }
    return { parsedId: parsedId, error: error };
};
exports.parseToMongoId = parseToMongoId;
