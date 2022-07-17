"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToRequestType = void 0;
const requestType_1 = require("enums/requestType");
function ToRequestType(str) {
    if (Object.values(requestType_1.RequestTypeEnum).includes(str)) {
        return str;
    }
    else {
        return requestType_1.RequestTypeEnum.UNKNOWN;
    }
}
exports.ToRequestType = ToRequestType;
