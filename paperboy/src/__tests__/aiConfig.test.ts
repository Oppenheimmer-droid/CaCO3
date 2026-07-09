import { describe, it, expect } from 'vitest';
import { mergeAIConfig } from '../services/aiConfig';

describe('mergeAIConfig', () => {
  it('prefers explicit runtime config over env defaults', () => {
    const result = mergeAIConfig(
      {
        provider: 'gemini',
        geminiApiKey: 'env-key',
        ollamaBaseUrl: 'http://env:11434',
        ollamaModel: 'env-model'
      },
      {
        provider: 'ollama',
        ollamaBaseUrl: 'http://runtime:11434',
        ollamaModel: 'runtime-model'
      }
    );

    expect(result.provider).toBe('ollama');
    expect(result.ollamaBaseUrl).toBe('http://runtime:11434');
    expect(result.ollamaModel).toBe('runtime-model');
    expect(result.geminiApiKey).toBe('env-key');
  });
});
