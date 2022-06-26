export {}; // Make the file a module

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: number;
            JWT_SECRET: string;
            MONGOOSE_URI: string;
            API_URL: string;
            API_TOKEN: string;
            LANGUAGES: 'en' | 'fr' | 'it' | 'nl';
            FRONT_URL: string;
        }
    }
}
