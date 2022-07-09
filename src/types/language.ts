const availableLanguages = process.env.LANGUAGES

export type language = typeof availableLanguages[number];