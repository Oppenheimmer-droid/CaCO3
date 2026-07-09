export interface RuntimeAIConfig {
  provider?: 'gemini' | 'ollama';
  geminiApiKey?: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  ollamaApiKey?: string;
  backendUrl?: string;
  // Image generation
  imageProvider?: string;
  falApiKey?: string;
  falModel?: string;
}

export function mergeAIConfig(envConfig: RuntimeAIConfig = {}, runtimeConfig: RuntimeAIConfig = {}): RuntimeAIConfig {
  return {
    provider: runtimeConfig.provider || envConfig.provider || 'ollama',
    geminiApiKey: runtimeConfig.geminiApiKey || envConfig.geminiApiKey || '',
    ollamaBaseUrl: runtimeConfig.ollamaBaseUrl || envConfig.ollamaBaseUrl || 'https://ollama.com/api',
    ollamaModel: runtimeConfig.ollamaModel || envConfig.ollamaModel || 'llama3',
    ollamaApiKey: runtimeConfig.ollamaApiKey || envConfig.ollamaApiKey || '',
    // Ignore localhost backend URLs
    backendUrl: (runtimeConfig.backendUrl || envConfig.backendUrl || '').replace(/localhost.*/, ''),
    // Image generation
    imageProvider: runtimeConfig.imageProvider || envConfig.imageProvider || 'fal',
    falApiKey: runtimeConfig.falApiKey || envConfig.falApiKey || '',
    falModel: runtimeConfig.falModel || envConfig.falModel || 'fal-ai/flux'
  };
}

export async function loadRuntimeAIConfig(url = '/config/ai-config.json'): Promise<RuntimeAIConfig> {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      return {};
    }

    const data = await response.json() as RuntimeAIConfig;
    return data || {};
  } catch {
    return {};
  }
}
