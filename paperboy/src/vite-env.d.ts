/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_PROVIDER: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_OLLAMA_BASE_URL: string;
  readonly VITE_OLLAMA_MODEL: string;
  readonly VITE_OLLAMA_API_KEY: string;
  readonly VITE_BACKEND_URL: string;
  readonly GITHUB_PAGES: string;
  // Non-VITE env vars (set via define in vite.config)
  readonly AI_PROVIDER: string;
  readonly GEMINI_API_KEY: string;
  readonly OLLAMA_BASE_URL: string;
  readonly OLLAMA_MODEL: string;
  readonly OLLAMA_API_KEY: string;
  readonly BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
