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
  const result = parseJSON<RawPanelData[]>(text, 'array of panel objects');

  if (!result.success) {
    return result;
  }

  // Validate structure
  const data = result.data!;
  if (!Array.isArray(data)) {
    return {
      success: false,
      error: `Expected array of panels, got ${typeof data}`
    };
  }

  // Validate each panel has required fields
  for (let i = 0; i < data.length; i++) {
    const panel = data[i];
    if (typeof panel !== 'object' || panel === null) {
      return {
        success: false,
        error: `Panel ${i + 1} is not a valid object`
      };
    }

    const typedPanel = panel as Record<string, unknown>;
    if (typeof typedPanel.title !== 'string') {
      return {
        success: false,
        error: `Panel ${i + 1} is missing valid "title" field`
      };
    }
    if (typeof typedPanel.script !== 'string') {
      return {
        success: false,
        error: `Panel ${i + 1} is missing valid "script" field`
      };
    }
  }

  return { success: true, data };
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
