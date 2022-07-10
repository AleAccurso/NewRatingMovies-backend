const availableLanguages = ["en", "fr", "it", "nl"] as const

export type language = typeof availableLanguages[number];