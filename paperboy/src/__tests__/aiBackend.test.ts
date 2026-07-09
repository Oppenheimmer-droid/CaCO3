import { describe, it, expect } from 'vitest';
import { resolveBackendUrl } from '../services/aiBackend';

describe('resolveBackendUrl', () => {
  it('builds a backend URL from a base path', () => {
    expect(resolveBackendUrl('http://localhost:4000')).toBe('http://localhost:4000/api');
  });

  it('keeps an already suffixed URL intact', () => {
    expect(resolveBackendUrl('https://example.com/api')).toBe('https://example.com/api');
  });

  it('normalizes a trailing slash before appending the API path', () => {
    expect(resolveBackendUrl('https://example.com/api/')).toBe('https://example.com/api');
  });
});
