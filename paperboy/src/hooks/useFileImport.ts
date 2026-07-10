import { useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.mjs';

export function useFileImport() {
  const processTextFile = useCallback(async (file: File): Promise<string> => {
    return await file.text();
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
      } else {
        throw new Error('Formato de archivo no soportado. Usa .txt o .pdf');
      }

      onSuccess(text);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error al leer el archivo.';
      onError(errorMessage);
    } finally {
      onProgress('');
    }
  }, [processTextFile, processPdfFile]);

  return { handleFileChange };
}
