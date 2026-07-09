export interface RuntimeAIConfig {
  provider?: 'gemini' | 'ollama';
  geminiApiKey?: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
}

export function mergeAIConfig(envConfig: RuntimeAIConfig = {}, runtimeConfig: RuntimeAIConfig = {}): RuntimeAIConfig {
  return {
    provider: runtimeConfig.provider || envConfig.provider || 'gemini',
    geminiApiKey: runtimeConfig.geminiApiKey || envConfig.geminiApiKey || '',
    ollamaBaseUrl: runtimeConfig.ollamaBaseUrl || envConfig.ollamaBaseUrl || 'http://localhost:11434',
    ollamaModel: runtimeConfig.ollamaModel || envConfig.ollamaModel || 'llama3.2'
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
