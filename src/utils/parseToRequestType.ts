import { RequestTypeEnum } from '../enums/requestType';
import { requestType } from '../types/requestType';

export function ToRequestType(str: string): requestType {

    if (Object.values(RequestTypeEnum).includes(str as RequestTypeEnum)) {
        return str as requestType;
    } else {
        return RequestTypeEnum.UNKNOWN
    }
}
