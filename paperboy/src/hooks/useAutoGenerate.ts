import { useEffect, useRef, useCallback } from 'react';
import { getAIProvider } from '../services/aiProvider';
import { AIProviderError } from '../types';
import { parseStringArray, createProviderError } from '../utils/parser';
import { AUTO_GENERATION_PROMPT, GENERATION_DEFAULTS } from '../constants';

export interface UseAutoGenerateReturn {
  startAutoGeneration: (
    scriptText: string,
    onProgress: (message: string) => void,
    onPromptsLoaded: (prompts: string[]) => void,
    onError: (error: string) => void,
    onLoadingChange: (loading: boolean) => void
  ) => Promise<void>;
  
  addGeneratedImage: (image: string) => void;
  incrementProgress: () => void;
  setWaiting: (waiting: boolean) => void;
  stopCurrentGeneration: () => void;
}

export function useAutoGenerate(
  isAutoGenerating: boolean,
  prompts: string[],
  progress: number,
  isWaiting: boolean,
  addGeneratedImage: (image: string) => void,
  incrementProgress: () => void,
  setWaiting: (waiting: boolean) => void,
  stopCurrentGeneration: () => void,
  setError: (error: string | null) => void
): UseAutoGenerateReturn {
  const timeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isAutoGenerating || prompts.length === 0 || progress >= prompts.length) {
      if (isAutoGenerating && prompts.length > 0 && progress >= prompts.length) {
        stopCurrentGeneration();
      }
      return;
    }

    const generateNext = async () => {
      if (!isMountedRef.current) return;

      try {
        setWaiting(false);
        const provider = getAIProvider();
        const prompt = prompts[progress];

        const imageResult = await provider.generateImage(prompt, {
          aspectRatio: '1:1'
        });

        if (!isMountedRef.current) return;

        const imageUrl = `data:${imageResult.mimeType};base64,${imageResult.base64}`;
        addGeneratedImage(imageUrl);
        incrementProgress();
      } catch (err) {
        if (!isMountedRef.current) return;

        console.error("Auto Gen Error:", err);
        const error = createProviderError(err, 'Auto-generación');
        
        const isQuotaError = error.message?.includes('429') ||
                             error.message?.includes('RESOURCE_EXHAUSTED') ||
                             error.status === 429;

        const isServerError = error.status === 500 ||
                              error.status === 503 ||
                              error.message?.includes('Internal error') ||
                              error.message?.includes('INTERNAL');
        
        if (isQuotaError || isServerError) {
          setWaiting(true);
          const waitTime = isQuotaError ? 45000 : 10000;
          console.warn(`Auto Gen Rate Limit for index ${progress}. Waiting ${waitTime / 1000}s...`);
          timeoutRef.current = window.setTimeout(generateNext, waitTime);
          return;
        }
        
        // Skip other types of persistent failures
        incrementProgress();
      }
    };

    // Initial batch delay
    const initialDelay = progress === 0 ? 0 : GENERATION_DEFAULTS.autoGenBatchDelay;
    timeoutRef.current = window.setTimeout(generateNext, initialDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAutoGenerating, prompts, progress, isWaiting, addGeneratedImage, incrementProgress, setWaiting, stopCurrentGeneration]);

  const startAutoGeneration = useCallback(async (
    scriptText: string,
    onProgress: (message: string) => void,
    onPromptsLoaded: (prompts: string[]) => void,
    onError: (error: string) => void,
    onLoadingChange: (loading: boolean) => void
  ) => {
    if (!scriptText.trim()) {
      onError('Por favor, ingresa un texto para generar.');
      return;
    }

    onLoadingChange(true);
    onProgress('Analizando texto para generar secuencia de imágenes...');
    setError(null);

    try {
      const provider = getAIProvider();
      
      const response = await provider.generateText(
        `${AUTO_GENERATION_PROMPT}\n\nTexto:\n\n${scriptText}`,
        { responseMimeType: 'application/json' }
      );

      const parseResult = parseStringArray(response.text);
      
      if (!parseResult.success) {
        throw new Error(parseResult.error || 'Error al parsear los prompts de generación');
      }

      const loadedPrompts = parseResult.data!;
      
      if (!Array.isArray(loadedPrompts) || loadedPrompts.length === 0) {
        throw new Error('No se generaron prompts de imagen');
      }

      onPromptsLoaded(loadedPrompts);
    } catch (e) {
      console.error('Auto-generation start error:', e);
      const errorMsg = e instanceof Error ? e.message : 'Error al analizar el texto para la generación automática.';
      onError(errorMsg);
      onLoadingChange(false);
    }
  }, [setError]);

  const stopCurrentGen = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    startAutoGeneration,
    addGeneratedImage,
    incrementProgress,
    setWaiting,
    stopCurrentGeneration: stopCurrentGen
  };
}
