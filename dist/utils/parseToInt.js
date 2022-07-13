"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseToInt = void 0;
const responseMessages_1 = require("../contants/responseMessages");
const parseToInt = (str) => {
    const tempInt = Number(str);
    let parsedInt = undefined;
    let error = undefined;
    if (!isNaN(tempInt) && typeof tempInt != 'undefined') {
        parsedInt = tempInt;
    }
    else {
        error = new Error(responseMessages_1.msg.BAD_PARAMS + str);
    }
    return { parsedInt: parsedInt, error: error };
};
exports.parseToInt = parseToInt;
