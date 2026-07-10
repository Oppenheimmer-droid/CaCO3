// Image Generation Provider - Supports multiple backends
import type { GenerationOptions } from '../types';

export interface ImageGenerationOptions extends GenerationOptions {
  aspectRatio?: '1:1' | '4:3' | '16:9' | '9:16';
}

export interface ImageGenerationResult {
  base64: string;
  mimeType: string;
}

export class ImageProviderError extends Error {
  isRetryable: boolean;
  status?: number;

  constructor(message: string, isRetryable = false, status?: number) {
    super(message);
    this.name = 'ImageProviderError';
    this.isRetryable = isRetryable;
    this.status = status;
  }
}

// Base interface for image providers
export interface ImageProvider {
  name: string;
  generateImage(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult>;
  generateText?(prompt: string, options?: { responseMimeType?: string }): Promise<{ text: string }>;
}

// fal.ai Provider
export class FalImageProvider implements ImageProvider {
  readonly name = 'fal';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'fal-ai/flux') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateImage(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult> {
    if (!this.apiKey) {
      throw new ImageProviderError('fal.ai API key is required', false);
    }

    // Map aspect ratio to fal.ai image size
    const sizeMap: Record<string, string> = {
      '1:1': 'square',
      '4:3': 'landscape_4_3',
      '16:9': 'landscape_16_9',
      '9:16': 'portrait_16_9'
    };
    const imageSize = options?.aspectRatio ? sizeMap[options.aspectRatio] || 'square' : 'square';

    // Use Flux 2 Pro with sync_mode for immediate response
    const response = await fetch('https://fal.run/fal-ai/flux-2-pro', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        image_size: imageSize,
        output_format: 'png',
        sync_mode: true
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new ImageProviderError(
        `fal.ai API error: ${response.status} - ${errorBody}`,
        response.status === 429 || response.status >= 500,
        response.status
      );
    }

    const data = await response.json() as { images?: Array<{ url: string }> };
    
    if (!data.images || data.images.length === 0) {
      throw new ImageProviderError('No image generated', false);
    }

    const imageUrl = data.images[0].url;
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString('base64');
    
    return { base64, mimeType: 'image/png' };
  }

  // FAL.AI no soporta texto - usar GroqProvider para texto
  generateText(_prompt: string, _options?: { responseMimeType?: string }): Promise<{ text: string }> {
    return Promise.reject(new ImageProviderError(
      'Text generation via FAL.AI is not supported. Use Groq provider.',
      false
    ));
  }
}

// Factory function to get the appropriate image provider
export function getImageProvider(
  provider: string,
  apiKey?: string,
  model?: string
): ImageProvider | null {
  switch (provider) {
    case 'fal':
      return new FalImageProvider(apiKey || '', model);
    default:
      return null;
  }
}
