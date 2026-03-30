/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_UPLOAD_PATH: string;
    readonly VITE_API_PRE: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}