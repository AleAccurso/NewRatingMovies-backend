"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToLanguage = void 0;
const languages_1 = require("enums/languages");
function ToLanguage(str) {
    if (Object.values(languages_1.LanguagesEnum).includes(str)) {
        return str;
    }
    else {
        return languages_1.LanguagesEnum.UNKNOWN;
    }
}
exports.ToLanguage = ToLanguage;
