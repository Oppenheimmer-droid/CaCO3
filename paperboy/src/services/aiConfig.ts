export interface RuntimeAIConfig {
  provider?: 'gemini' | 'ollama' | 'groq' | 'fal';
  geminiApiKey?: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  ollamaApiKey?: string;
  groqApiKey?: string;
  groqModel?: string;
  backendUrl?: string;
  // Image generation
  imageProvider?: string;
  falApiKey?: string;
  falModel?: string;
}

export function mergeAIConfig(envConfig: RuntimeAIConfig = {}, runtimeConfig: RuntimeAIConfig = {}): RuntimeAIConfig {
  return {
    provider: runtimeConfig.provider || envConfig.provider || 'groq',
    geminiApiKey: runtimeConfig.geminiApiKey || envConfig.geminiApiKey || '',
    ollamaBaseUrl: runtimeConfig.ollamaBaseUrl || envConfig.ollamaBaseUrl || '',
    ollamaModel: runtimeConfig.ollamaModel || envConfig.ollamaModel || 'llama3',
    ollamaApiKey: runtimeConfig.ollamaApiKey || envConfig.ollamaApiKey || '',
    groqApiKey: runtimeConfig.groqApiKey || envConfig.groqApiKey || '',
    groqModel: runtimeConfig.groqModel || envConfig.groqModel || 'llama-3.3-70b-versatile',
    // Ignore localhost backend URLs
    backendUrl: (runtimeConfig.backendUrl || envConfig.backendUrl || '').replace(/localhost.*/, ''),
    // Image generation
    imageProvider: runtimeConfig.imageProvider || envConfig.imageProvider || 'fal',
    falApiKey: runtimeConfig.falApiKey || envConfig.falApiKey || '',
    falModel: runtimeConfig.falModel || envConfig.falModel || 'fal-ai/flux-pro'
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
