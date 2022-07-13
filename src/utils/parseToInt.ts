import { msg } from '../contants/responseMessages';

type parsedInt = { parsedInt?: number; error?: Error };

export const parseToInt = (str: string): parsedInt => {
    const tempInt = Number(str);
    let parsedInt: number | undefined = undefined;
    let error: Error | undefined = undefined;

    if (!isNaN(tempInt) && typeof tempInt != 'undefined') {
        parsedInt = tempInt;
    } else {
        error = new Error(msg.BAD_PARAMS + str);
    }

    return { parsedInt: parsedInt, error: error };
}
