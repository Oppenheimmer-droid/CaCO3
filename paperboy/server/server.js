import express from 'express';

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
  const { prompt, provider = 'ollama', options } = req.body || {};

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
          const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
          const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';
          const ollamaApiKey = process.env.OLLAMA_API_KEY || '';
          const headers = { 'Content-Type': 'application/json' };
          if (ollamaApiKey) {
            headers.Authorization = `Bearer ${ollamaApiKey}`;
          }
          const response = await fetch(`${ollamaBaseUrl.replace(/\/$/, '')}/api/generate`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ model: ollamaModel, prompt, stream: false, options: { temperature: 0.7, ...(options || {}) } })
          });
          const data = await response.json();
          return res.json({ text: data.response || '' });
        }
        throw geminiError;
      }
    }

    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';
    const ollamaApiKey = process.env.OLLAMA_API_KEY || '';
    const headers = { 'Content-Type': 'application/json' };
    if (ollamaApiKey) {
      headers.Authorization = `Bearer ${ollamaApiKey}`;
    }
    const response = await fetch(`${ollamaBaseUrl.replace(/\/$/, '')}/api/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ model: ollamaModel, prompt, stream: false, options: { temperature: 0.7, ...(options || {}) } })
    });

    const data = await response.json();
    return res.json({ text: data.response || '' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'AI generation failed' });
  }
});

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

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`Paperboy backend listening on port ${port}`);
});
