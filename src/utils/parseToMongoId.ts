import { ObjectId } from 'mongodb';

import { msg } from '@constants/constants';

type parsedId = { parsedId?: ObjectId; error?: string };

export const parseToMongoId = (str: string): parsedId => {
    let parsedId: ObjectId | undefined = undefined;
    let error: Error | undefined = undefined;

    parsedId = new ObjectId(str);
    
    if (typeof parsedId == 'undefined') {
        return { error: msg.BAD_PARAMS + str } as parsedId;
    } else {
        return { parsedId: parsedId } as parsedId
    }
}
