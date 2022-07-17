import { msg } from 'constants/constants';

type parsedInt = { parsedInt?: number; error?: string };

export const parseToInt = (str: string): parsedInt => {
    const parsedInt = Number(str);
    let error: Error | undefined = undefined;

    if (!isNaN(parsedInt) && typeof parsedInt != 'undefined') {
        return { parsedInt: parsedInt } as parsedInt;
    } else {
        return { error: msg.BAD_PARAMS + str } as parsedInt;
    }
}
