"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseToInt = void 0;
const constants_1 = require("../contants/constants");
const parseToInt = (str) => {
    const tempInt = Number(str);
    let parsedInt = undefined;
    let error = undefined;
    if (!isNaN(tempInt) && typeof tempInt != 'undefined') {
        parsedInt = tempInt;
    }
    else {
        error = new Error(constants_1.msg.BAD_PARAMS + str);
    }
    return { parsedInt: parsedInt, error: error };
};
exports.parseToInt = parseToInt;
