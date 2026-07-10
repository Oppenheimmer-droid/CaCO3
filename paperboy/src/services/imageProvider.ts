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
      '1:1': 'square_1_1',
      '4:3': 'landscape_4_3',
      '16:9': 'landscape_16_9',
      '9:16': 'portrait_9_16'
    };
    const imageSize = options?.aspectRatio ? sizeMap[options.aspectRatio] || 'square_1_1' : 'square_1_1';

    const response = await fetch('https://queue.fal.run/fal-ai/flux-pro', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        image_size: imageSize,
        num_images: 1
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

    // fal.ai returns a request ID that we need to poll
    const data = await response.json() as { request_id: string };
    
    if (!data.request_id) {
      throw new ImageProviderError('No request ID returned', false);
    }

    // Poll for the result
    const result = await this.pollForResult(data.request_id);
    
    return result;
  }

  // FAL.AI no soporta texto - usar GroqProvider para texto
  generateText(_prompt: string, _options?: { responseMimeType?: string }): Promise<{ text: string }> {
    return Promise.reject(new ImageProviderError(
      'Text generation via FAL.AI is not supported. Use Groq provider.',
      false
    ));
  }

  private async pollForResult(requestId: string, maxAttempts = 30): Promise<ImageGenerationResult> {
    const pollUrl = `https://queue.fal.run/fal-ai/flux-pro/requests/${requestId}`;
    
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch(pollUrl, {
        headers: {
          'Authorization': `Key ${this.apiKey}`
        }
      });
      
      const data = await response.json() as { status: string; images?: Array<{ url: string }> };
      
      if (data.status === 'completed' && data.images && data.images.length > 0) {
        // Fetch the actual image and convert to base64
        const imageUrl = data.images[0].url;
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString('base64');
        
        return { base64, mimeType: 'image/png' };
      }
      
      if (data.status === 'failed') {
        throw new ImageProviderError('Image generation failed', false);
      }
    }
    
    throw new ImageProviderError('Timeout waiting for image', true);
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
