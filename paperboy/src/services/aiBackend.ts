export interface BackendAIConfig {
  baseUrl?: string;
  apiKey?: string;
}

export function resolveBackendUrl(baseUrl: string): string {
  if (!baseUrl) {
    return '/api';
  }

  const trimmed = baseUrl.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

export async function callBackendAI(path: string, payload: Record<string, unknown>, baseUrl = '/api') {
  const response = await fetch(`${resolveBackendUrl(baseUrl)}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Backend request failed');
  }

  return response.json();
}
