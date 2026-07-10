import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Para GitHub Pages: /CaCO3/ (o el base path del repositorio)
    // Para Render/producción: / (raíz)
    const isGitHubPages = env.GITHUB_PAGES === 'true';
    const base = isGitHubPages ? '/CaCO3/' : '/';
    
    // Default values - Groq (free) and FAL
    const defaultGroqModel = 'llama-3.3-70b-versatile';
    const defaultImageProvider = 'fal';
    const defaultFalModel = 'fal-ai/flux-2-pro';
    
    // Keys for production - estos vienen de Render Environment Variables
    const groqApiKey = env.GROQ_API_KEY || '';
    const falApiKey = env.FAL_API_KEY || '';
    
    return {
      base,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'import.meta.env.VITE_AI_PROVIDER': JSON.stringify(env.AI_PROVIDER || 'groq'),
        'import.meta.env.VITE_GROQ_API_KEY': JSON.stringify(groqApiKey),
        'import.meta.env.VITE_GROQ_MODEL': JSON.stringify(env.GROQ_MODEL || defaultGroqModel),
        'import.meta.env.VITE_OLLAMA_BASE_URL': JSON.stringify(env.OLLAMA_BASE_URL || 'https://ollama.com/api'),
        'import.meta.env.VITE_OLLAMA_MODEL': JSON.stringify(env.OLLAMA_MODEL || 'llama3'),
        'import.meta.env.VITE_OLLAMA_API_KEY': JSON.stringify(env.OLLAMA_API_KEY || ''),
        'import.meta.env.VITE_IMAGE_PROVIDER': JSON.stringify(env.IMAGE_PROVIDER || defaultImageProvider),
        'import.meta.env.VITE_FAL_API_KEY': JSON.stringify(falApiKey),
        'import.meta.env.VITE_FAL_MODEL': JSON.stringify(env.FAL_MODEL || defaultFalModel)
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
