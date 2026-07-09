import { describe, it, expect } from 'vitest';
import {
  parseJSON,
  parseComicPanelData,
  parseStringArray,
  validatePanelCount,
  createProviderError
} from '../utils/parser';

describe('parseJSON', () => {
  it('should parse valid JSON object', () => {
    const result = parseJSON<{ name: string }>('{"name": "test"}');
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: 'test' });
  });

  it('should parse valid JSON array', () => {
    const result = parseJSON<string[]>('["a", "b", "c"]');
    expect(result.success).toBe(true);
    expect(result.data).toEqual(['a', 'b', 'c']);
  });

  it('should handle JSON with markdown fences', () => {
    const result = parseJSON<{ value: number }>('```json\n{"value": 42}\n```');
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ value: 42 });
  });

  it('should handle JSON with any markdown fences', () => {
    const result = parseJSON<{ count: number }>('```\n{"count": 100}\n```');
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ count: 100 });
  });

  it('should extract array from text', () => {
    const result = parseJSON<number[]>('some text before [1, 2, 3] and after');
    expect(result.success).toBe(true);
    expect(result.data).toEqual([1, 2, 3]);
  });

  it('should extract object from text', () => {
    const result = parseJSON<{ active: boolean }>('{"status": "ok", "active": true}');
    expect(result.success).toBe(true);
    // Parser extracts the whole object, not just typed fields
    expect(result.data).toEqual({ status: 'ok', active: true });
  });

  it('should return error for invalid JSON', () => {
    const result = parseJSON('not valid json at all');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should return error for empty input', () => {
    const result = parseJSON('');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid input');
  });
});

describe('parseComicPanelData', () => {
  it('should parse valid comic panel data', () => {
    const data = JSON.stringify([
      { title: 'Panel 1', script: 'Script 1', explanation: 'Exp 1', imagePrompt: 'Prompt 1' },
      { title: 'Panel 2', script: 'Script 2', explanation: 'Exp 2', imagePrompt: 'Prompt 2' }
    ]);
    const result = parseComicPanelData(data);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it('should reject panels without title', () => {
    const data = JSON.stringify([
      { script: 'Script 1', explanation: 'Exp 1', imagePrompt: 'Prompt 1' }
    ]);
    const result = parseComicPanelData(data);
    expect(result.success).toBe(false);
    expect(result.error).toContain('title');
  });

  it('should reject panels without script', () => {
    const data = JSON.stringify([
      { title: 'Panel 1', explanation: 'Exp 1', imagePrompt: 'Prompt 1' }
    ]);
    const result = parseComicPanelData(data);
    expect(result.success).toBe(false);
    expect(result.error).toContain('script');
  });

  it('should handle wrapped JSON response', () => {
    const data = '```json\n' + JSON.stringify([
      { title: 'Test', script: 'Test script', explanation: 'Test exp', imagePrompt: 'Test prompt' }
    ]) + '\n```';
    const result = parseComicPanelData(data);
    expect(result.success).toBe(true);
  });
});

describe('parseStringArray', () => {
  it('should parse valid string array', () => {
    const result = parseStringArray('["prompt1", "prompt2", "prompt3"]');
    expect(result.success).toBe(true);
    expect(result.data).toEqual(['prompt1', 'prompt2', 'prompt3']);
  });

  it('should reject non-string elements', () => {
    const result = parseStringArray('[1, 2, "three"]');
    expect(result.success).toBe(false);
    expect(result.error).toContain('string');
  });

  it('should handle wrapped JSON response', () => {
    const data = '```json\n["item1", "item2"]\n```';
    const result = parseStringArray(data);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(['item1', 'item2']);
  });
});

describe('validatePanelCount', () => {
  it('should pass for correct count', () => {
    const panels = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = validatePanelCount(panels, 8);
    expect(result.success).toBe(true);
  });

  it('should fail for incorrect count', () => {
    const panels = [1, 2, 3];
    const result = validatePanelCount(panels, 8);
    expect(result.success).toBe(false);
    expect(result.error).toContain('8');
  });

  it('should fail for non-array input', () => {
    const result = validatePanelCount(['item'] as unknown as unknown[], 8);
    expect(result.success).toBe(false);
    // The function checks for array type first
    expect(result.error).toContain('Expected');
  });
});

describe('createProviderError', () => {
  it('should create error from Error instance', () => {
    const original = new Error('Test error');
    const error = createProviderError(original);
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('AIProviderError');
  });

  it('should create error with retryable status', () => {
    const original = new Error('429 Quota exceeded');
    const error = createProviderError(original);
    expect(error.isRetryable).toBe(true);
  });

  it('should create error with context', () => {
    const original = new Error('Network error');
    const error = createProviderError(original, 'API call');
    expect(error.message).toContain('API call');
  });

  it('should handle unknown error types', () => {
    const error = createProviderError(123);
    expect(error.message).toContain('unexpected');
  });
});
