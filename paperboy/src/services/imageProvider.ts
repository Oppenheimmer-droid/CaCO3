// Image Generation Provider - Supports multiple backends
import { ImageGenerationOptions, ImageGenerationResult } from '../types';
import { AIProviderError } from './aiProvider';

// Base interface for image providers
export interface ImageProvider {
  name: string;
  generateImage(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult>;
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
      throw new AIProviderError('fal.ai API key is required', 'MISSING_API_KEY');
    }

    const url = 'https://queue.fal.run/fal-ai/flux';

    const payload: Record<string, unknown> = {
      prompt,
      image_size: options?.size || 'square_1_1',
      num_images: 1
    };

    // Add seed if provided for reproducibility
    if (options?.seed) {
      payload.seed = options.seed;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new AIProviderError(
        `fal.ai API error: ${response.status} - ${errorBody}`,
        undefined,
        response.status
      );
    }

    const data = await response.json() as { images?: Array<{ url: string }> };
    
    if (!data.images || data.images.length === 0) {
      throw new AIProviderError('No image generated', 'NO_IMAGE_GENERATED');
    }

    // Fetch the actual image and convert to base64
    const imageUrl = data.images[0].url;
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString('base64');
    const mimeType = 'image/png';

    return { base64, mimeType };
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
