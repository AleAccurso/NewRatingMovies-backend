"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseToInt = void 0;
const constants_1 = require("@constants/constants");
const parseToInt = (str) => {
    const parsedInt = Number(str);
    if (!isNaN(parsedInt) && typeof parsedInt != 'undefined') {
        return { parsedInt: parsedInt };
    }
    else {
        return { error: constants_1.msg.BAD_PARAMS + str };
    }
};
exports.parseToInt = parseToInt;
