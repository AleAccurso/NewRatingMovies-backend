"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseToMongoId = void 0;
const mongodb_1 = require("mongodb");
const constants_1 = require("constants/constants");
const parseToMongoId = (str) => {
    let parsedId = undefined;
    let error = undefined;
    parsedId = new mongodb_1.ObjectId(str);
    if (typeof parsedId == 'undefined') {
        return { error: constants_1.msg.BAD_PARAMS + str };
    }
    else {
        return { parsedId: parsedId };
    }
};
exports.parseToMongoId = parseToMongoId;
