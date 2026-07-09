import { AIProviderError, ImageGenerationOptions, TextGenerationOptions } from '../types';
import { parseComicPanelData, parseStringArray, validatePanelCount, createProviderError } from '../utils/parser';
import { loadRuntimeAIConfig, mergeAIConfig, RuntimeAIConfig } from './aiConfig';
import { callBackendAI } from './aiBackend';

// Environment configuration
const ENV_AI_PROVIDER = (import.meta.env.VITE_AI_PROVIDER || import.meta.env.AI_PROVIDER || 'ollama') as 'gemini' | 'ollama';
const ENV_GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
const ENV_OLLAMA_BASE_URL = (import.meta.env.VITE_OLLAMA_BASE_URL || import.meta.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '');
const ENV_OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || import.meta.env.OLLAMA_MODEL || 'llama3.2';
const ENV_OLLAMA_API_KEY = import.meta.env.VITE_OLLAMA_API_KEY || import.meta.env.OLLAMA_API_KEY || '';
const ENV_BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');

let runtimeAIConfig: RuntimeAIConfig | null = null;

async function resolveAIConfig(): Promise<RuntimeAIConfig> {
  if (runtimeAIConfig) {
    return runtimeAIConfig;
  }

  const loaded = await loadRuntimeAIConfig();
  runtimeAIConfig = mergeAIConfig(
    {
      provider: ENV_AI_PROVIDER,
      geminiApiKey: ENV_GEMINI_API_KEY,
      ollamaBaseUrl: ENV_OLLAMA_BASE_URL,
      ollamaModel: ENV_OLLAMA_MODEL,
      ollamaApiKey: ENV_OLLAMA_API_KEY,
      backendUrl: ENV_BACKEND_URL
    },
    loaded
  );

  return runtimeAIConfig;
}

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

export interface TextGenerationResult {
  text: string;
  rawResponse?: unknown;
}

export interface ImageGenerationResult {
  base64: string;
  mimeType: string;
}

export interface TranscriptionResult {
  text: string;
}

export interface AIProvider {
  readonly name: string;
  readonly supportsImageGeneration: boolean;
  readonly supportsTranscription: boolean;
  
  generateText(prompt: string, options?: TextGenerationOptions): Promise<TextGenerationResult>;
  generateImage(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult>;
  transcribeAudio(audioData: string, mimeType: string): Promise<TranscriptionResult>;
}

function getRetryableStatus(error: unknown): boolean {
  const err = error as unknown as Record<string, unknown>;
  const message = (err.message as string) || '';
  return (
    err.status === 429 ||
    err.status === 500 ||
    err.status === 503 ||
    err.code === 429 ||
    message.includes('429') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.includes('Internal error') ||
    message.includes('INTERNAL')
  );
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 5,
  baseDelay: number = 5000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (!getRetryableStatus(error) || attempt === maxAttempts) {
        throw createProviderError(error, `AI request failed after ${attempt} attempts`);
      }
      
      // Exponential backoff
      const errorRecord = error as unknown as Record<string, unknown>;
      const message = (errorRecord.message as string) || '';
      const isQuota = errorRecord.status === 429 || 
                      message.includes('429') ||
                      message.includes('RESOURCE_EXHAUSTED');
      const waitTime = baseDelay * (isQuota ? 7 : 1) * attempt;
      
      console.warn(`Attempt ${attempt} failed, retrying in ${waitTime}ms...`);
      await delay(waitTime);
    }
  }
  
  throw createProviderError(lastError, 'Max retry attempts exceeded');
}

// ==================== GEMINI PROVIDER ====================

class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  readonly supportsImageGeneration = true;
  readonly supportsTranscription = true;

  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required for GeminiProvider');
    }
    this.apiKey = apiKey;
  }

  async generateText(prompt: string, options?: TextGenerationOptions): Promise<TextGenerationResult> {
    const model = options?.model || 'gemini-2.0-flash';
    const url = `${this.baseUrl}/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
    
    const body: Record<string, unknown> = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    if (options?.responseMimeType) {
      body.generationConfig = {
        responseMimeType: options.responseMimeType,
        responseSchema: options.responseSchema
      };
    }

    return withRetry(async () => {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new AIProviderError(
          `Gemini API error: ${response.status} ${response.statusText} - ${errorBody}`,
          undefined,
          response.status,
          response.status === 429 || response.status >= 500
        );
      }

      const data = await response.json() as Record<string, unknown>;
      const text = this.extractText(data);
      
      return { text, rawResponse: data };
    }, options?.maxAttempts || 5, options?.retryDelay || 5000);
  }

  async generateImage(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const model = 'imagen-3-generate-001';
    const aspectRatio = options?.aspectRatio || '4:3';
    const url = `${this.baseUrl}/v1beta/models/${model}:predict?key=${this.apiKey}`;
    
    const body = {
      prompt: prompt,
      config: {
        aspectRatio: aspectRatio,
        sampleCount: 1
      }
    };

    return withRetry(async () => {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new AIProviderError(
          `Gemini Imagen error: ${response.status} ${response.statusText} - ${errorBody}`,
          undefined,
          response.status,
          response.status === 429 || response.status >= 500
        );
      }

      const data = await response.json() as Record<string, unknown>;
      
      // Extract image from prediction results
      const predictions = data.predictions as Array<Record<string, unknown>> | undefined;
      if (!predictions || predictions.length === 0) {
        throw new AIProviderError('No image generated - content may have been filtered');
      }

      const bytesBase64 = predictions[0].bytesBase64Encoded as string;
      if (!bytesBase64) {
        throw new AIProviderError('No image data in response');
      }

      return {
        base64: bytesBase64,
        mimeType: 'image/png'
      };
    }, options?.maxAttempts || 5, options?.retryDelay || 10000);
  }

  async transcribeAudio(audioData: string, mimeType: string): Promise<TranscriptionResult> {
    const model = 'gemini-2.0-flash-exp';
    const url = `${this.baseUrl}/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
    
    const parts: Array<{ inlineData?: { data: string; mimeType: string }; text?: string }> = [
      { inlineData: { data: audioData, mimeType } },
      { text: 'Transcribe este audio. Devuelve solo el texto transcrito, sin explicaciones.' }
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new AIProviderError(
        `Transcription error: ${response.status} ${response.statusText} - ${errorBody}`,
        undefined,
        response.status
      );
    }

    const data = await response.json() as Record<string, unknown>;
    const text = this.extractText(data);
    
    if (!text) {
      throw new AIProviderError('No transcription text in response');
    }

    return { text };
  }

  // Legacy method for backwards compatibility with original code
  async generateContent(model: string, contents: { parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> }, config?: Record<string, unknown>): Promise<{ text?: string; candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data: string; mimeType: string } }> } }> }> {
    const url = `${this.baseUrl}/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
    
    const body: Record<string, unknown> = { contents };
    if (config) {
      body.generationConfig = config;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new AIProviderError(
        `Gemini API error: ${response.status} ${response.statusText} - ${errorBody}`,
        undefined,
        response.status
      );
    }

    return response.json();
  }

  private extractText(data: Record<string, unknown>): string {
    const candidates = data.candidates as Array<Record<string, unknown>> | undefined;
    if (!candidates || candidates.length === 0) {
      return '';
    }

    const content = candidates[0].content as Record<string, unknown> | undefined;
    if (!content) {
      return '';
    }

    const parts = content.parts as Array<Record<string, unknown>> | undefined;
    if (!parts || parts.length === 0) {
      return '';
    }

    return (parts[0].text as string) || '';
  }
}

// ==================== OLLAMA PROVIDER ====================

class BackendProvider implements AIProvider {
  readonly name = 'backend';
  readonly supportsImageGeneration = true;
  readonly supportsTranscription = true;

  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async generateText(prompt: string, options?: TextGenerationOptions): Promise<TextGenerationResult> {
    const result = await callBackendAI('/generate', { prompt, provider: 'backend', options }, this.baseUrl);
    return { text: result.text || '' };
  }

  async generateImage(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const result = await callBackendAI('/generate-image', { prompt, options }, this.baseUrl);
    return {
      base64: result.base64 || '',
      mimeType: result.mimeType || 'image/png'
    };
  }

  async transcribeAudio(audioData: string, mimeType: string): Promise<TranscriptionResult> {
    const result = await callBackendAI('/transcribe', { audioData, mimeType }, this.baseUrl);
    return { text: result.text || '' };
  }
}

// Ollama Cloud Provider - Uses backend as proxy to avoid CORS
class OllamaCloudProvider implements AIProvider {
  readonly name = 'ollama-cloud';
  readonly supportsImageGeneration = false;
  readonly supportsTranscription = false;

  private model: string;
  private apiKey?: string;

  constructor(_baseUrl: string, model: string, apiKey?: string) {
    this.model = model;
    this.apiKey = apiKey;
  }

  async generateText(prompt: string, options?: TextGenerationOptions): Promise<TextGenerationResult> {
    // Use backend proxy to avoid CORS issues
    const result = await callBackendAI('/generate', { 
      prompt, 
      provider: 'ollama',
      model: options?.model || this.model,
      apiKey: this.apiKey
    });

    return { text: result.text || '' };
  }

  async generateImage(_prompt: string, _options?: ImageGenerationOptions): Promise<ImageGenerationResult> {
    throw new AIProviderError('Image generation is not supported by Ollama Cloud', 'IMAGE_GENERATION_UNSUPPORTED');
  }

  async generateComicPanels(panelCount: number, options?: TextGenerationOptions): Promise<{ panels: Array<{ title: string; description: string; caption: string; characters: string[]; background: string }> }> {
    const prompt = `Generate ${panelCount} comic panels for a story. Return valid JSON with an array of panels, each containing: title, description, characters (array), background, and caption.`;

    const result = await this.generateText(prompt, {
      responseMimeType: 'application/json'
    });

    const parseResult = parseComicPanelData(result.text);
    if (!parseResult.success || !parseResult.data) {
      throw new AIProviderError(`Failed to parse comic panels: ${parseResult.error}`);
    }
    return { panels: parseResult.data as Array<{ title: string; description: string; caption: string; characters: string[]; background: string }> };
  }

  async transcribeAudio(_audioData: string, _mimeType: string): Promise<TranscriptionResult> {
    throw new AIProviderError('Transcription is not supported by Ollama Cloud', 'TRANSCRIPTION_UNSUPPORTED');
  }
}

class OllamaProvider implements AIProvider {
  readonly name = 'ollama';
  readonly supportsImageGeneration = false; // Most Ollama models don't support image generation
  readonly supportsTranscription = true;

  private baseUrl: string;
  private model: string;
  private apiKey?: string;

  constructor(baseUrl: string, model: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.model = model;
    this.apiKey = apiKey;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  async generateText(prompt: string, options?: TextGenerationOptions): Promise<TextGenerationResult> {
    if (this.baseUrl.includes('/api')) {
      const result = await callBackendAI('/generate', { prompt, provider: 'ollama' }, this.baseUrl);
      return { text: result.text || '' };
    }

    const url = `${this.baseUrl}/api/generate`;
    
    const body = {
      model: options?.model || this.model,
      prompt,
      stream: false,
      options: {
        temperature: 0.7
      }
    };

    // Add JSON mode if schema is requested
    if (options?.responseMimeType === 'application/json') {
      (body.options as Record<string, unknown>).format = 'json';
    }

    return withRetry(async () => {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new AIProviderError(
          `Ollama API error: ${response.status} ${response.statusText} - ${errorBody}`,
          undefined,
          response.status,
          response.status === 429 || response.status >= 500
        );
      }

      const data = await response.json() as Record<string, unknown>;
      
      return {
        text: (data.response as string) || '',
        rawResponse: data
      };
    }, options?.maxAttempts || 3, options?.retryDelay || 3000);
  }

  async generateImage(prompt: string, _options?: ImageGenerationOptions): Promise<ImageGenerationResult> {
    // Ollama's standard models don't support image generation
    // If you have a vision model like llava, you could use the /api/chat endpoint
    throw new AIProviderError(
      `Image generation is not supported by OllamaProvider by default. ` +
      `If you have a vision-capable model (like llava), you can implement custom support. ` +
      `Current model: ${this.model}`,
      'IMAGE_GENERATION_UNSUPPORTED',
      undefined,
      false
    );
  }

  async transcribeAudio(audioData: string, mimeType: string): Promise<TranscriptionResult> {
    // Ollama doesn't have built-in transcription
    // Use a local Whisper model via API if available
    const url = `${this.baseUrl}/api/transcribe`;
    
    // For now, return error - would need to implement with local Whisper
    throw new AIProviderError(
      'Audio transcription requires a local Whisper API or similar service. ' +
      'Ollama does not provide native transcription. Consider using a separate service ' +
      'or the Gemini provider for audio transcription.',
      'TRANSCRIPTION_UNSUPPORTED',
      undefined,
      false
    );
  }

  // Try to use vision model for image understanding
  async describeImage(imageBase64: string, mimeType: string, prompt: string = 'Describe this image in detail.'): Promise<string> {
    const url = `${this.baseUrl}/api/chat`;
    
    const body = {
      model: this.model,
      messages: [
        {
          role: 'user',
          content: prompt,
          images: [imageBase64]
        }
      ],
      stream: false
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new AIProviderError(
        `Ollama vision error: ${response.status} ${response.statusText} - ${errorBody}`,
        undefined,
        response.status
      );
    }

    const data = await response.json() as Record<string, unknown>;
    const message = data.message as Record<string, unknown> | undefined;
    return (message?.content as string) || '';
  }
}

// ==================== PROVIDER FACTORY ====================

let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const providerConfig = {
    provider: ENV_AI_PROVIDER,
    geminiApiKey: ENV_GEMINI_API_KEY,
    ollamaBaseUrl: ENV_OLLAMA_BASE_URL,
    ollamaModel: ENV_OLLAMA_MODEL,
    ollamaApiKey: ENV_OLLAMA_API_KEY,
    backendUrl: ENV_BACKEND_URL !== 'http://localhost:4000' ? ENV_BACKEND_URL : '' // Only use if explicitly set
  };

  // Ollama takes priority - direct API calls
  if (providerConfig.provider === 'ollama' || providerConfig.ollamaBaseUrl) {
    if (providerConfig.ollamaBaseUrl.includes('ollama.com')) {
      cachedProvider = new OllamaCloudProvider(providerConfig.ollamaBaseUrl, providerConfig.ollamaModel, providerConfig.ollamaApiKey);
      console.info(`Using Ollama Cloud provider: ${providerConfig.ollamaBaseUrl} with model ${providerConfig.ollamaModel}`);
    } else {
      cachedProvider = new OllamaProvider(providerConfig.ollamaBaseUrl, providerConfig.ollamaModel, providerConfig.ollamaApiKey);
      console.info(`Using Ollama provider: ${providerConfig.ollamaBaseUrl} with model ${providerConfig.ollamaModel}`);
    }
  } else if (providerConfig.backendUrl) {
    // Backend provider - only if backendUrl is explicitly configured (not localhost)
    cachedProvider = new BackendProvider(providerConfig.backendUrl);
    console.info(`Using backend provider: ${providerConfig.backendUrl}`);
  } else {
    // Default to Gemini
    const apiKey = providerConfig.geminiApiKey || '';
    cachedProvider = new GeminiProvider(apiKey);
    console.info('Using Gemini provider');
  }

  return cachedProvider;
}

export async function initializeAIProvider(): Promise<AIProvider> {
  const config = await resolveAIConfig();
  if (cachedProvider) {
    return cachedProvider;
  }

  // Ollama takes priority - direct API calls
  if (config.provider === 'ollama' || config.ollamaBaseUrl) {
    const ollamaUrl = config.ollamaBaseUrl || 'http://localhost:11434';
    if (ollamaUrl.includes('ollama.com')) {
      cachedProvider = new OllamaCloudProvider(ollamaUrl, config.ollamaModel || 'llama3.2', config.ollamaApiKey);
      console.info(`Using Ollama Cloud from runtime config: ${ollamaUrl} with model ${config.ollamaModel}`);
    } else {
      cachedProvider = new OllamaProvider(ollamaUrl, config.ollamaModel || 'llama3.2', config.ollamaApiKey);
      console.info(`Using Ollama provider from runtime config: ${ollamaUrl} with model ${config.ollamaModel}`);
    }
  } else if (config.backendUrl) {
    // Backend provider - only if explicitly configured
    cachedProvider = new BackendProvider(config.backendUrl);
    console.info(`Using backend provider from runtime config: ${config.backendUrl}`);
  } else {
    // Default to Gemini
    cachedProvider = new GeminiProvider(config.geminiApiKey || '');
    console.info('Using Gemini provider from runtime config');
  }

  return cachedProvider;
}

export function resetAIProvider(): void {
  cachedProvider = null;
  runtimeAIConfig = null;
}

export { ENV_AI_PROVIDER as AI_PROVIDER, ENV_GEMINI_API_KEY as GEMINI_API_KEY, ENV_OLLAMA_BASE_URL as OLLAMA_BASE_URL, ENV_OLLAMA_MODEL as OLLAMA_MODEL };
