import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Usar PROJECT_ROOT si está definido (Render), si no usar __dirname
const projectRoot = process.env.PROJECT_ROOT || join(__dirname, '..');
const distPath = join(projectRoot, 'dist');

console.log('Server paths:');
console.log('  __dirname:', __dirname);
console.log('  projectRoot:', projectRoot);
console.log('  distPath:', distPath);
console.log('  dist exists:', existsSync(distPath));

const app = express();
const PORT = Number(process.env.PORT || 10000);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Servir archivos estáticos del frontend compilado
if (IS_PRODUCTION) {
  if (existsSync(distPath)) {
    app.use(express.static(distPath));
    console.log('Serving static files from:', distPath);
  } else {
    console.error('WARNING: dist folder not found at', distPath);
  }
}

app.use(express.json({ limit: '50mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const buildGeminiText = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

const buildGeminiImage = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-3-generate-001:predict?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, config: { aspectRatio: '4:3', sampleCount: 1 } })
  });

  const data = await response.json();
  const bytes = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!bytes) {
    throw new Error('No image data was returned by Gemini');
  }

  return { base64: bytes, mimeType: 'image/png' };
};

app.post('/api/generate', async (req, res) => {
  const { prompt, provider = 'ollama', options, model, apiKey } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    if (provider === 'gemini' || provider === 'backend') {
      try {
        const text = await buildGeminiText(prompt);
        return res.json({ text });
      } catch (geminiError) {
        if (process.env.OLLAMA_BASE_URL || process.env.OLLAMA_MODEL) {
          return await callOllama(req, res);
        }
        throw geminiError;
      }
    }

    return await callOllama(req, res);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'AI generation failed' });
  }
});

// Helper function to call Ollama (local or cloud)
async function callOllama(req, res) {
  const { prompt, options, model: reqModel, apiKey: reqApiKey } = req.body || {};
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const ollamaModel = reqModel || process.env.OLLAMA_MODEL || 'llama3.2';
  const ollamaApiKey = reqApiKey || process.env.OLLAMA_API_KEY || '';
  const headers = { 'Content-Type': 'application/json' };
  if (ollamaApiKey) {
    headers.Authorization = `Bearer ${ollamaApiKey}`;
  }

  // Check if using Ollama Cloud (ollama.com) - use OpenAI-compatible API
  if (ollamaBaseUrl.includes('ollama.com')) {
    const url = ollamaBaseUrl.replace(/\/api$/, '/v1') + '/chat/completions';
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: ollamaModel,
        messages: [{ role: 'user', content: prompt }],
        stream: false
      })
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Ollama Cloud error: ${response.status} - ${errorBody}`);
    }
    
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return res.json({ text });
  }
  
  // Local Ollama - use native API
  const response = await fetch(`${ollamaBaseUrl.replace(/\/$/, '')}/api/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model: ollamaModel, prompt, stream: false, options: { temperature: 0.7, ...(options || {}) } })
  });

  const data = await response.json();
  return res.json({ text: data.response || '' });
}

app.post('/api/generate-image', async (req, res) => {
  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const result = await buildGeminiImage(prompt);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Image generation failed' });
  }
});

app.post('/api/transcribe', async (req, res) => {
  const { audioData, mimeType } = req.body || {};

  if (!audioData) {
    return res.status(400).json({ error: 'Audio data is required' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ inlineData: { data: audioData, mimeType: mimeType || 'audio/wav' } }, { text: 'Transcribe this audio. Return only the transcription text.' }] }]
      })
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.json({ text });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Transcription failed' });
  }
});

// Endpoint para servir la configuración de IA dinámicamente
app.get('/config/ai-config.json', (req, res) => {
  const config = {
    provider: process.env.AI_PROVIDER || 'gemini',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    ollamaModel: process.env.OLLAMA_MODEL || 'llama3.2',
    ollamaApiKey: process.env.OLLAMA_API_KEY || '',
    backendUrl: ''
  };
  res.json(config);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA routing: servir index.html para todas las rutas no-API
if (IS_PRODUCTION) {
  app.get('*', (req, res, next) => {
    // No aplicar SPA routing para rutas API
    if (req.path.startsWith('/api') || req.path.startsWith('/config') || req.path === '/health') {
      return next();
    }
    const indexPath = join(distPath, 'index.html');
    if (existsSync(indexPath)) {
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error sending index.html:', err);
          next();
        }
      });
    } else {
      console.error('index.html not found at:', indexPath);
      res.status(500).send('Application not built. Run npm run build first.');
    }
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Paperboy server listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
