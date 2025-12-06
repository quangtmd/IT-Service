interface ImportMetaEnv {
  readonly VITE_BACKEND_API_BASE_URL: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly SSR: boolean;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "@google/genai";
