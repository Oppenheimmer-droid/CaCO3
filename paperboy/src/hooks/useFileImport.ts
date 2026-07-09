import { useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { AIProviderError } from '../types';
import { getAIProvider } from '../services/aiProvider';
import { TRANSCRIPTION_PROMPT } from '../constants';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.mjs';

export function useFileImport() {
  const processTextFile = useCallback(async (file: File): Promise<string> => {
    const text = await file.text();
    return text;
  }, []);

  const processPdfFile = useCallback(async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => 'str' in item ? item.str : '')
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  }, []);

  const processAudioFile = useCallback(async (file: File): Promise<string> => {
    const provider = getAIProvider();
    
    if (!provider.supportsTranscription) {
      throw new AIProviderError(
        'El proveedor de IA actual no soporta transcripción de audio. ' +
        'Usa Gemini como proveedor o proporciona un archivo de texto/PDF.',
        'TRANSCRIPTION_UNSUPPORTED'
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Convert to base64
    let binary = '';
    for (let i = 0; i < buffer.byteLength; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    const base64Audio = btoa(binary);

    const result = await provider.transcribeAudio(base64Audio, file.type);
    
    if (!result.text) {
      throw new AIProviderError('No se pudo transcribir el audio. Inténtalo con otro archivo.');
    }

    return result.text;
  }, []);

  const handleFileChange = useCallback(async (
    file: File,
    onProgress: (message: string) => void,
    onSuccess: (text: string) => void,
    onError: (error: string) => void
  ) => {
    onProgress('Procesando archivo...');
    
    try {
      let text: string;
      
      if (file.type === 'text/plain') {
        text = await processTextFile(file);
      } else if (file.type === 'application/pdf') {
        text = await processPdfFile(file);
      } else if (file.type.startsWith('audio/')) {
        onProgress('Transcribiendo audio... Esto puede tardar un momento.');
        text = await processAudioFile(file);
      } else {
        throw new Error('Formato de archivo no soportado. Por favor, sube un .txt, .pdf o un archivo de audio.');
      }

      onSuccess(text);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error al leer el archivo.';
      onError(errorMessage);
    } finally {
      onProgress('');
    }
  }, [processTextFile, processPdfFile, processAudioFile]);

  return {
    handleFileChange,
    processTextFile,
    processPdfFile,
    processAudioFile
  };
}
