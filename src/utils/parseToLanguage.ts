import { LanguagesEnum } from '@enums/languages';

export function ToLanguage(str: string): LanguagesEnum {
    if (Object.values(LanguagesEnum).includes(str as unknown as LanguagesEnum)) {
        return str as LanguagesEnum;
    } else {
        return LanguagesEnum.UNKNOWN;
    }
}
