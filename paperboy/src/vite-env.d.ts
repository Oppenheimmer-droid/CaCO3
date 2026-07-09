/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_PROVIDER: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_OLLAMA_BASE_URL: string;
  readonly VITE_OLLAMA_MODEL: string;
  readonly VITE_OLLAMA_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
