import { ObjectId } from 'mongodb';
import { msg } from '../contants/responseMessages';

type parsedId = { parsedId?: ObjectId; error?: Error };

export const parseToMongoId = (str: string): parsedId => {
    let parsedId: ObjectId | undefined = undefined;
    let error: Error | undefined = undefined;

    parsedId = new ObjectId(str);
    
    if (typeof parsedId == 'undefined') {
        error = new Error(msg.BAD_PARAMS + str);
    }

    return { parsedId: parsedId, error: error };
}
