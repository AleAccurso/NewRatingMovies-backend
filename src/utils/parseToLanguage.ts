import { LanguagesEnum } from '../enums/languages';
import { language } from '../types/language';

export function ToLanguage(str: string): language {
    if (Object.values(LanguagesEnum).includes(str as unknown as LanguagesEnum)) {
        return str as language;
    } else {
        return LanguagesEnum.UNKNOWN;
    }
}
