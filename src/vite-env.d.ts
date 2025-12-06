
interface ImportMetaEnv {
  readonly VITE_BACKEND_API_BASE_URL: string;
  readonly VITE_GEMINI_API_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "@google/genai" {
  export class GoogleGenAI {
    constructor(config: { apiKey: string });
    getGenerativeModel(config: { model: string; systemInstruction?: string }): any;
    models: any;
    chats: any;
  }
  export enum Type {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    INTEGER = 'INTEGER',
    BOOLEAN = 'BOOLEAN',
    ARRAY = 'ARRAY',
    OBJECT = 'OBJECT',
  }
}
