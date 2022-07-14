import { RequestTypeEnum } from '../enums/requestType';

export function ToRequestType(str: string): RequestTypeEnum {

    if (Object.values(RequestTypeEnum).includes(str as RequestTypeEnum)) {
        return str as RequestTypeEnum;
    } else {
        return RequestTypeEnum.UNKNOWN
    }
}
