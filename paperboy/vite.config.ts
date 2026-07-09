import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Para GitHub Pages: /CaCO3/ (o el base path del repositorio)
    // Para Render/producción: / (raíz)
    const isGitHubPages = env.GITHUB_PAGES === 'true';
    const base = isGitHubPages ? '/CaCO3/' : '/';
    
    return {
      base,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'import.meta.env.VITE_AI_PROVIDER': JSON.stringify(env.AI_PROVIDER),
        'import.meta.env.VITE_OLLAMA_BASE_URL': JSON.stringify(env.OLLAMA_BASE_URL),
        'import.meta.env.VITE_OLLAMA_MODEL': JSON.stringify(env.OLLAMA_MODEL),
        'import.meta.env.VITE_OLLAMA_API_KEY': JSON.stringify(env.OLLAMA_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true
      }
    };
});
