declare global {
    namespace NodeJS {
        export interface ProcessEnv {
            PORT: number;
            JWT_SECRET: string;
            MONGOOSE_URI: string;
            API_URL: string;
            API_TOKEN: string;
            LANGUAGES: string[];
            FRONT_URL: string;
        }
    }
}

export {}; // Make the file a module