import { msg } from '../contants/responseMessages';
import { language } from '../types/language';

type parsedLanguage = { parsedLanguage?: language; error?: Error };

export const parseToInt = (str: string): parsedLanguage => {
    let parsedLang: language | undefined = undefined;
    let error: Error | undefined = undefined;
    let availableLanguages = process.env.LANGUAGES;

    if (availableLanguages.includes(str)) {
        parsedLang = str as language;
    } else {
        error = new Error(msg.BAD_PARAMS + str);
    }

    return { parsedLanguage: parsedLang, error: error };
}
