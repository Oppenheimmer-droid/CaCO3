import { useCallback } from 'react';
import { getAIProvider, getImageProvider, FAL_API_KEY } from '../services/aiProvider';
import { PanelData, AIProviderError } from '../types';
import { parseComicPanelData, validatePanelCount, createProviderError } from '../utils/parser';
import { DEFAULT_SCRIPT_PROMPT, IMAGE_PROMPT_SUFFIX, GENERATION_DEFAULTS } from '../constants';

export interface UseComicGenerationReturn {
  generateComic: (
    scriptText: string,
    onProgress: (message: string) => void,
    onPanelUpdate: (panels: PanelData[]) => void,
    onError: (error: string) => void,
    onComplete: () => void
  ) => Promise<void>;
  
  regeneratePanel: (
    panelIndex: number,
    editedScript: string,
    currentPanels: PanelData[],
    onPanelUpdate: (panels: PanelData[]) => void,
    onError: (error: string) => void,
    onCancel: () => void
  ) => Promise<void>;
  
  editImage: (
    panelIndex: number,
    imageUrl: string,
    editPrompt: string,
    currentPanels: PanelData[],
    onPanelUpdate: (panels: PanelData[]) => void,
    onError: (error: string) => void
  ) => Promise<void>;
}

export function useComicGeneration(): UseComicGenerationReturn {
  const generateComic = useCallback(async (
    scriptText: string,
    onProgress: (message: string) => void,
    onPanelUpdate: (panels: PanelData[]) => void,
    onError: (error: string) => void,
    onComplete: () => void
  ) => {
    const provider = getAIProvider();
    const imageProvider = getImageProvider('fal', FAL_API_KEY);
    if (!imageProvider) {
      onError('Proveedor de imágenes no disponible');
      return;
    }
    const generatedPanels: PanelData[] = [];

    try {
      // Step 1: Generate script and image prompts
      onProgress('Creando el guion y las ideas para las 8 viñetas...');
      
      const promptText = `${DEFAULT_SCRIPT_PROMPT}\n\nTexto original:\n\n${scriptText}`;
      
      const scriptResponse = await provider.generateText(promptText, {
        responseMimeType: 'application/json'
      });

      // Parse the JSON response
      const parseResult = parseComicPanelData(scriptResponse.text);
      
      if (!parseResult.success) {
        throw new Error(parseResult.error || 'Error al parsear la respuesta del guion');
      }

      const panelDataFromAI = parseResult.data!;
      
      // Validate we have exactly 8 panels
      const countResult = validatePanelCount(panelDataFromAI, 8);
      if (!countResult.success) {
        throw new Error(countResult.error);
      }

      // Step 2: Generate images for each panel
      for (let i = 0; i < panelDataFromAI.length; i++) {
        const panelData = panelDataFromAI[i];
        const { title, script, explanation, imagePrompt } = panelData as {
          title: string;
          script: string;
          explanation: string;
          imagePrompt: string;
        };
        
        let imageUrl: string | undefined;
        let panelError: string | undefined;

        try {
          onProgress(`Generando imagen para Viñeta ${i + 1} de 8: "${title}"...`);
          
          // Build the full image prompt with safety rules
          const fullImagePrompt = `${imagePrompt}\n\n${IMAGE_PROMPT_SUFFIX}`;
          
          let attempts = 0;
          const maxAttempts = GENERATION_DEFAULTS.maxAttempts;
          let success = false;

          while (attempts < maxAttempts && !success) {
            try {
              const imageResult = await imageProvider.generateImage(fullImagePrompt, {
                aspectRatio: '4:3'
              });

              imageUrl = `data:${imageResult.mimeType};base64,${imageResult.base64}`;
              success = true;
            } catch (innerError) {
              attempts++;
              
              const isQuotaError = (innerError as AIProviderError).isRetryable;
              const isServerError = (innerError as AIProviderError).status === 500 ||
                                    (innerError as AIProviderError).status === 503;
              
              if ((isQuotaError || isServerError) && attempts < maxAttempts) {
                const waitTime = isQuotaError 
                  ? GENERATION_DEFAULTS.retryDelayQuota * attempts
                  : GENERATION_DEFAULTS.retryDelayServer * attempts;
                
                console.warn(`Rate limit for panel ${i + 1}. Retrying in ${waitTime}ms...`);
                onProgress(`Límite de cuota. Esperando ${waitTime / 1000}s para reintentar viñeta ${i + 1}...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
              }
              
              throw innerError;
            }
          }
        } catch (e) {
          console.error(`Failed to generate image for panel ${i + 1}:`, e);
          const err = createProviderError(e, `Viñeta ${i + 1}`);
          
          if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
            panelError = 'Límite de cuota excedido. Intenta regenerar esta viñeta más tarde.';
          } else if (err.message?.includes('Safety') || err.message?.includes('safety') || err.message?.includes('filtered')) {
            panelError = 'Imagen bloqueada por seguridad. Intenta editar y suavizar el texto.';
          } else if (err.status === 500) {
            panelError = 'Error interno del servidor (500). Intenta regenerar.';
          } else {
            panelError = 'No se pudo generar la imagen. Intenta editar el guion.';
          }
        }

        generatedPanels.push({
          title,
          script,
          explanation: explanation || "Sin explicación disponible.",
          imageUrl,
          error: panelError
        });
        
        // Update panels in real-time
        onPanelUpdate([...generatedPanels].reverse());

        // Delay between panels to respect rate limits
        if (i < panelDataFromAI.length - 1) {
          onProgress(`Pausando brevemente para proteger cuota de API...`);
          await new Promise(resolve => setTimeout(resolve, GENERATION_DEFAULTS.interPanelDelay));
        }
      }

      onComplete();
    } catch (e) {
      console.error('Comic generation error:', e);
      const err = createProviderError(e, 'Generación de cómic');
      
      let detailedError = "Hubo un error al generar el cómic. Revisa el formato del guion y tu conexión.";
      
      if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        detailedError = "Se ha alcanzado el límite de solicitudes a la API (Quota Exceeded). Intenta generar menos viñetas o espera un momento.";
      } else if (err.message) {
        detailedError = `Error: ${err.message}`;
      }
      
      onError(detailedError);
    }
  }, []);

  const regeneratePanel = useCallback(async (
    panelIndex: number,
    editedScript: string,
    currentPanels: PanelData[],
    onPanelUpdate: (panels: PanelData[]) => void,
    onError: (error: string) => void,
    onCancel: () => void
  ) => {
    const provider = getAIProvider();
    const imageProvider = getImageProvider('fal', FAL_API_KEY);
    if (!imageProvider) {
      onError('Proveedor de imágenes no disponible');
      return;
    }
    const panelToUpdateIndex = currentPanels.length - 1 - panelIndex;
    
    // Mark panel as regenerating
    const updatedPanels = currentPanels.map((p, i) =>
      i === panelToUpdateIndex ? { ...p, isRegenerating: true, error: undefined } : p
    );
    onPanelUpdate(updatedPanels);

    try {
      // Generate new image prompt from the edited script
      const promptResponse = await provider.generateText(
        `Genera un prompt de imagen EXTREMADAMENTE SEGURO para una viñeta de cómic basada en: "${editedScript}".\n\n${IMAGE_PROMPT_SUFFIX}`
      );

      const imagePrompt = promptResponse.text;

      // Wait a moment before generating image
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate the image
      const imageResult = await imageProvider.generateImage(imagePrompt, {
        aspectRatio: '4:3'
      });

      const imageUrl = `data:${imageResult.mimeType};base64,${imageResult.base64}`;

      // Update the panel with new script and image
      const finalPanels = currentPanels.map((p, i) =>
        i === panelToUpdateIndex
          ? { ...p, script: editedScript, imageUrl, isRegenerating: false, error: undefined }
          : p
      );
      onPanelUpdate(finalPanels);
      onCancel();
    } catch (e) {
      console.error('Panel regeneration error:', e);
      const err = createProviderError(e, 'Regeneración de viñeta');
      
      let errorMsg = 'No se pudo re-generar la viñeta.';
      
      if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMsg = 'Límite de cuota excedido. Espera unos segundos.';
      } else if (err.status === 500) {
        errorMsg = 'Error del servidor (500). Intenta de nuevo.';
      } else if (err.message?.includes('seguridad') || err.message?.includes('Safety')) {
        errorMsg = 'Imagen bloqueada por seguridad. Intenta un texto más abstracto.';
      }
      
      const errorPanels = currentPanels.map((p, i) =>
        i === panelToUpdateIndex
          ? { ...p, imageUrl: undefined, isRegenerating: false, error: errorMsg }
          : p
      );
      onPanelUpdate(errorPanels);
      onError(errorMsg);
      onCancel();
    }
  }, []);

  const editImage = useCallback(async (
    panelIndex: number,
    imageUrl: string,
    editPrompt: string,
    currentPanels: PanelData[],
    onPanelUpdate: (panels: PanelData[]) => void,
    onError: (error: string) => void
  ) => {
    const imageProvider = getImageProvider('fal', FAL_API_KEY);
    
    if (!imageProvider) {
      onError('Proveedor de imágenes no disponible');
      return;
    }

    const panelToUpdateIndex = currentPanels.length - 1 - panelIndex;
    
    // Mark as regenerating
    const updatedPanels = currentPanels.map((p, i) =>
      i === panelToUpdateIndex ? { ...p, isRegenerating: true, error: undefined } : p
    );
    onPanelUpdate(updatedPanels);

    try {
      // Extract base64 and mime type
      const match = imageUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
      if (!match) {
        throw new Error('Formato de imagen inválido');
      }
      const mimeType = match[1];
      const base64Data = match[2];

      // Use fal.ai for image regeneration
      const newImageResult = await imageProvider.generateImage(editPrompt, {
        aspectRatio: '4:3'
      });

      const newImageUrl = `data:${newImageResult.mimeType};base64,${newImageResult.base64}`;

      const finalPanels = currentPanels.map((p, i) =>
        i === panelToUpdateIndex
          ? { ...p, imageUrl: newImageUrl, isRegenerating: false }
          : p
      );
      onPanelUpdate(finalPanels);
    } catch (e) {
      console.error('Image edit error:', e);
      const errMsg = e instanceof Error ? e.message : 'Error al editar imagen';
      onError(errMsg);
      
      const errorPanels = currentPanels.map((p, i) =>
        i === panelToUpdateIndex
          ? { ...p, isRegenerating: false, error: errMsg }
          : p
      );
      onPanelUpdate(errorPanels);
    }
  }, []);

  return {
    generateComic,
    regeneratePanel,
    editImage
  };
}
