"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseToInt = void 0;
const responseMessages_1 = require("../contants/responseMessages");
const parseToInt = (str) => {
    let parsedLang = undefined;
    let error = undefined;
    let availableLanguages = process.env.LANGUAGES;
    if (availableLanguages.includes(str)) {
        parsedLang = str;
    }
    else {
        error = new Error(responseMessages_1.msg.BAD_PARAMS + str);
    }
    return { parsedLanguage: parsedLang, error: error };
};
exports.parseToInt = parseToInt;
