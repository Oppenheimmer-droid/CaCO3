import { AIProviderError } from '../types';

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Robust JSON parser with multiple fallback strategies
 * @param text Raw text from AI response
 * @param expectedType Optional description of expected data type for error messages
 * @returns ParseResult with parsed data or error message
 */
export function parseJSON<T>(text: string, expectedType?: string): ParseResult<T> {
  if (!text || typeof text !== 'string') {
    return {
      success: false,
      error: 'Invalid input: expected a non-empty string'
    };
  }

  let cleanedText = text.trim();

  // Strategy 1: Direct JSON parse
  try {
    const data = JSON.parse(cleanedText) as T;
    return { success: true, data };
  } catch {
    // Continue to fallback strategies
  }

  // Strategy 2: Remove markdown code fences ```json ... ```
  const jsonFenceMatch = cleanedText.match(/^```json\s*([\s\S]*?)\s*```$/);
  if (jsonFenceMatch) {
    try {
      const data = JSON.parse(jsonFenceMatch[1].trim()) as T;
      return { success: true, data };
    } catch {
      // Continue
    }
  }

  // Strategy 3: Remove any markdown code fences ``` ... ```
  const anyFenceMatch = cleanedText.match(/^```\s*([\s\S]*?)\s*```$/);
  if (anyFenceMatch) {
    try {
      const data = JSON.parse(anyFenceMatch[1].trim()) as T;
      return { success: true, data };
    } catch {
      // Continue
    }
  }

  // Strategy 4: Find first valid JSON array or object
  const arrayMatch = cleanedText.match(/\[[\s\S]*\]/);
  const objectMatch = cleanedText.match(/\{[\s\S]*\}/);

  if (arrayMatch) {
    try {
      const data = JSON.parse(arrayMatch[0]) as T;
      return { success: true, data };
    } catch {
      // Continue
    }
  }

  if (objectMatch) {
    try {
      const data = JSON.parse(objectMatch[0]) as T;
      return { success: true, data };
    } catch {
      // Continue
    }
  }

  // All strategies failed
  const typeDesc = expectedType ? ` (expected ${expectedType})` : '';
  return {
    success: false,
    error: `Failed to parse JSON response${typeDesc}. Raw response: "${cleanedText.substring(0, 200)}${cleanedText.length > 200 ? '...' : ''}"`
  };
}

/**
 * Parse comic panel data from AI response
 */
export interface RawPanelData {
  title?: unknown;
  script?: unknown;
  explanation?: unknown;
  imagePrompt?: unknown;
}

export function parseComicPanelData(text: string): ParseResult<RawPanelData[]> {
  let rawData: unknown = null;
  
  // Strategy 1: Direct parse as array
  const directResult = parseJSON<RawPanelData[]>(text);
  if (directResult.success && Array.isArray(directResult.data)) {
    rawData = directResult.data;
  } else {
    // Strategy 2: Parse as object and extract panels
    const objResult = parseJSON<Record<string, unknown>>(text);
    if (objResult.success && objResult.data) {
      const obj = objResult.data;
      
      // Look for panels array in common keys
      const keysToTry = ['panels', 'data', 'comics', 'slides', 'items', 'results'];
      for (const key of keysToTry) {
        if (key in obj && Array.isArray(obj[key])) {
          rawData = obj[key];
          break;
        }
      }
    }
  }

  if (!rawData || !Array.isArray(rawData)) {
    return {
      success: false,
      error: 'Could not parse comic panels - expected array'
    };
  }

  // Validate each panel has required fields
  const validatedPanels: RawPanelData[] = [];
  for (let i = 0; i < rawData.length; i++) {
    const panel = rawData[i] as Record<string, unknown>;
    if (typeof panel !== 'object' || panel === null) {
      return { success: false, error: `Panel ${i + 1} is not a valid object` };
    }

    const title = typeof panel.title === 'string' ? panel.title : 
                  typeof panel.name === 'string' ? panel.name : '';
    const script = typeof panel.script === 'string' ? panel.script : 
                   typeof panel.description === 'string' ? panel.description : '';
    const explanation = typeof panel.explanation === 'string' ? panel.explanation : '';
    const imagePrompt = typeof panel.imagePrompt === 'string' ? panel.imagePrompt : '';

    if (!title && !script) {
      return { success: false, error: `Panel ${i + 1} is missing title or script` };
    }

    validatedPanels.push({ title, script, explanation, imagePrompt });
  }

  return { success: true, data: validatedPanels };
}

/**
 * Parse string array from AI response (for auto-generation prompts)
 */
export function parseStringArray(text: string): ParseResult<string[]> {
  const result = parseJSON<string[]>(text, 'array of strings');

  if (!result.success) {
    return result;
  }

  if (!Array.isArray(result.data)) {
    return {
      success: false,
      error: `Expected array of strings, got ${typeof result.data}`
    };
  }

  // Ensure all elements are strings
  const validatedStrings: string[] = [];
  for (const item of result.data) {
    if (typeof item !== 'string') {
      return {
        success: false,
        error: `Expected all items to be strings, found ${typeof item}`
      };
    }
    validatedStrings.push(item);
  }

  return { success: true, data: validatedStrings };
}

/**
 * Validate panel count matches expected
 */
export function validatePanelCount(panels: unknown[], expected: number): ParseResult<unknown[]> {
  if (!Array.isArray(panels)) {
    return {
      success: false,
      error: `Expected array, got ${typeof panels}`
    };
  }

  if (panels.length !== expected) {
    return {
      success: false,
      error: `Expected exactly ${expected} panels, got ${panels.length}`
    };
  }

  return { success: true, data: panels };
}

/**
 * Create a formatted AIProviderError from a caught error
 */
export function createProviderError(error: unknown, context?: string): AIProviderError {
  const prefix = context ? `${context}: ` : '';
  
  if (error instanceof AIProviderError) {
    return error;
  }

  if (error instanceof Error) {
    const errorRecord = error as unknown as Record<string, unknown>;
    const message = error.message || '';
    
    const isQuotaError = 
      message.includes('429') ||
      message.includes('RESOURCE_EXHAUSTED') ||
      errorRecord.status === 429 ||
      errorRecord.code === 429;

    const isServerError =
      errorRecord.status === 500 ||
      errorRecord.code === 500 ||
      message.includes('Internal error') ||
      message.includes('INTERNAL') ||
      errorRecord.status === 503 ||
      errorRecord.code === 503;

    return new AIProviderError(
      `${prefix}${error.message}`,
      errorRecord.code as string | undefined,
      errorRecord.status as number | undefined,
      isQuotaError || isServerError
    );
  }

  return new AIProviderError(
    `${prefix}An unexpected error occurred: ${String(error)}`,
    undefined,
    undefined,
    false
  );
}
