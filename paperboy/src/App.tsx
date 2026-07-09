import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useAppState } from './hooks/useAppState';
import { useFileImport } from './hooks/useFileImport';
import { useComicGeneration } from './hooks/useComicGeneration';
import { usePersistence } from './hooks/usePersistence';
import {
  ComicPanel,
  SlideshowModal,
  RoomLightbox,
  SocialExportModal,
  AutoGenGallery,
  BuildingView,
  SocialSlideRenderTarget
} from './components';
import {
  exportComicAsPng,
  exportComicAsPdf,
  exportSlidesAsPdf,
  exportSocialPdf,
  exportSocialZip,
  exportGalleryAsPdf
} from './services/exportService';
import { defaultScript } from './constants/defaultScript';

const App: React.FC = () => {
  const {
    state,
    setPanels,
    updatePanel,
    reorderPanels,
    setScriptText,
    setLoading,
    setLoadingMessage,
    setError,
    setFileProcessingMessage,
    setIsGenerated,
    setIsExporting,
    setEditingPanelIndex,
    setEditedScript,
    setEditImagePrompt,
    resetEdit,
    setSlideshowOpen,
    setSlideshowIndex,
    startAutoGen,
    addAutoGenImage,
    setAutoGenProgress,
    setAutoGenWaiting,
    stopAutoGen,
    setSocialExportOpen,
    setSocialTheme,
    setSocialAccentColor,
    setSocialRatio,
    setSocialAuthor,
    setSocialPreviewIndex,
    setSocialExporting,
    setSocialExportProgress,
    setSocialRenderIndex,
    setViewMode,
    setElevatorFloor,
    setRoomCustomization,
    resetRoomCustomization,
    resetAllRoomCustomizations,
    setRoomLightboxOpen,
    setRoomLightboxData,
    resetRoomLightbox,
    loadState
  } = useAppState();

  const { handleFileChange } = useFileImport();
  const { generateComic, regeneratePanel, editImage } = useComicGeneration();
  const { getLastSaved } = usePersistence(state, loadState);

  const [copiedTweetIndex, setCopiedTweetIndex] = useState<number | null>(null);

  // Computed values
  const orderedPanels = useMemo(() => [...state.panels].reverse(), [state.panels]);

  // File handler
  const onFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    handleFileChange(
      file,
      (msg) => setFileProcessingMessage(msg),
      (text) => setScriptText(text),
      (err) => setError(err)
    );
    event.target.value = '';
  }, [handleFileChange, setFileProcessingMessage, setScriptText, setError]);

  // Comic generation
  const onGenerateComic = useCallback(() => {
    generateComic(
      state.scriptText,
      (msg) => setLoadingMessage(msg),
      (panels) => setPanels(panels),
      (err) => setError(err),
      () => {
        setLoading(false);
        setIsGenerated(true);
        setLoadingMessage('');
      }
    );
  }, [generateComic, state.scriptText, setLoadingMessage, setPanels, setError, setLoading, setIsGenerated]);

  // Auto generation
  const onStartAutoGen = useCallback(() => {
    if (!state.scriptText.trim()) {
      setError('Por favor, ingresa un texto para generar.');
      return;
    }

    setLoading(true);
    setError(null);

    const provider = (async () => {
      const { getAIProvider } = await import('./services/aiProvider');
      const { parseStringArray } = await import('./utils/parser');
      const { AUTO_GENERATION_PROMPT } = await import('./constants');
      
      setLoadingMessage('Analizando texto para generar secuencia de imágenes...');
      
      try {
        const ai = getAIProvider();
        const response = await ai.generateText(
          `${AUTO_GENERATION_PROMPT}\n\nTexto:\n\n${state.scriptText}`,
          { responseMimeType: 'application/json' }
        );

        const parseResult = parseStringArray(response.text);
        
        if (!parseResult.success || !parseResult.data) {
          throw new Error(parseResult.error || 'Error al parsear los prompts');
        }

        startAutoGen(parseResult.data);
        setLoading(false);
        setLoadingMessage('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al analizar el texto');
        setLoading(false);
        setLoadingMessage('');
      }
    });

    provider();
  }, [state.scriptText, setLoading, setError, setLoadingMessage, startAutoGen]);

  // Panel regeneration
  const onRegeneratePanel = useCallback((index: number) => {
    regeneratePanel(
      index,
      state.edit.editedScript,
      state.panels,
      (panels) => setPanels(panels),
      (err) => setError(err),
      () => resetEdit()
    );
  }, [regeneratePanel, state.edit.editedScript, state.panels, setPanels, setError, resetEdit]);

  // Image edit
  const onEditImagePanel = useCallback((index: number) => {
    const panel = state.panels[state.panels.length - 1 - index];
    if (!panel?.imageUrl) return;

    editImage(
      index,
      panel.imageUrl,
      state.edit.editImagePrompt,
      state.panels,
      (panels) => setPanels(panels),
      (err) => setError(err)
    );
    resetEdit();
  }, [editImage, state.edit.editImagePrompt, state.panels, setPanels, setError, resetEdit]);

  // Edit handlers
  const onEditClick = useCallback((index: number) => {
    const panelIndex = state.panels.length - 1 - index;
    setEditingPanelIndex(index);
    setEditedScript(state.panels[panelIndex].script);
    setEditImagePrompt('');
  }, [state.panels, setEditingPanelIndex, setEditedScript]);

  const onCancelEdit = useCallback(() => {
    resetEdit();
  }, [resetEdit]);

  // Slideshow handlers
  const openSlideshow = useCallback(() => {
    if (orderedPanels.length > 0) {
      setSlideshowIndex(0);
      setSlideshowOpen(true);
    }
  }, [orderedPanels.length, setSlideshowIndex, setSlideshowOpen]);

  const closeSlideshow = useCallback(() => {
    setSlideshowOpen(false);
  }, [setSlideshowOpen]);

  const nextSlide = useCallback(() => {
    if (state.slideshow.currentIndex < orderedPanels.length - 1) {
      setSlideshowIndex(state.slideshow.currentIndex + 1);
    }
  }, [state.slideshow.currentIndex, orderedPanels.length, setSlideshowIndex]);

  const prevSlide = useCallback(() => {
    if (state.slideshow.currentIndex > 0) {
      setSlideshowIndex(state.slideshow.currentIndex - 1);
    }
  }, [state.slideshow.currentIndex, setSlideshowIndex]);

  // Export handlers
  const onExportPng = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportComicAsPng('comic-container-export');
    } catch {
      setError('No se pudo exportar el cómic.');
    } finally {
      setIsExporting(false);
    }
  }, [setIsExporting, setError]);

  const onExportPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportComicAsPdf('comic-container-export');
    } catch {
      setError('No se pudo exportar el cómic.');
    } finally {
      setIsExporting(false);
    }
  }, [setIsExporting, setError]);

  const onExportSlides = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportSlidesAsPdf(orderedPanels);
    } catch {
      setError('No se pudo exportar la presentación.');
    } finally {
      setIsExporting(false);
    }
  }, [orderedPanels, setIsExporting, setError]);

  const onExportGallery = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportGalleryAsPdf(state.autoGen.images, state.autoGen.prompts);
    } catch {
      setError('No se pudo exportar la galería.');
    } finally {
      setIsExporting(false);
    }
  }, [state.autoGen.images, state.autoGen.prompts, setIsExporting, setError]);

  // Social export handlers
  const onExportLinkedInPdf = useCallback(async () => {
    setSocialExporting(true);
    setSocialExportProgress(0);
    try {
      for (let i = 0; i < orderedPanels.length; i++) {
        setSocialExportProgress(Math.round((i / orderedPanels.length) * 100));
        setSocialRenderIndex(i);
        await new Promise(resolve => setTimeout(resolve, 400));
      }
      setSocialExportProgress(100);
      await exportSocialPdf('social-slide-render-target', orderedPanels, state.socialExport.ratio, `presentacion-linkedin-${state.socialExport.ratio}.pdf`);
    } catch (err) {
      console.error("Error al generar PDF de LinkedIn:", err);
      setError('No se pudo generar la presentación para LinkedIn.');
    } finally {
      setSocialExporting(false);
      setSocialRenderIndex(null);
    }
  }, [orderedPanels, state.socialExport.ratio, setSocialExporting, setSocialExportProgress, setSocialRenderIndex, setError]);

  const onExportXZip = useCallback(async () => {
    setSocialExporting(true);
    setSocialExportProgress(0);
    try {
      await exportSocialZip('social-slide-render-target', orderedPanels, 'presentacion-pack-x.zip');
      setSocialExportProgress(100);
    } catch (err) {
      console.error("Error al generar ZIP para X/Twitter:", err);
      setError('No se pudo generar el paquete de imágenes para X.');
    } finally {
      setSocialExporting(false);
      setSocialRenderIndex(null);
    }
  }, [orderedPanels, setSocialExporting, setSocialExportProgress, setSocialRenderIndex, setError]);

  const onCopyTweet = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedTweetIndex(index);
      setTimeout(() => setCopiedTweetIndex(null), 2000);
    }).catch(err => {
      console.error("Error al copiar al portapapeles:", err);
    });
  }, []);

  // Room lightbox handlers
  const openRoomLightbox = useCallback((roomId: string) => {
    const custom = state.building.roomCustomizations[roomId];
    const base = (() => {
      const { defaultRooms } = require('./constants');
      return defaultRooms[roomId];
    })();

    if (!base) return;

    let linkedPanel;
    let panelIndex = custom?.linkedPanelIndex !== undefined
      ? custom.linkedPanelIndex
      : base.defaultPanelIndex;

    if (panelIndex !== null && panelIndex !== undefined && panelIndex >= 0 && state.panels[panelIndex]) {
      linkedPanel = state.panels[panelIndex];
    }

    setRoomLightboxData({
      selectedRoomId: roomId,
      title: custom?.title !== undefined ? custom.title : (linkedPanel?.title || base.defaultTitle),
      script: custom?.script !== undefined ? custom.script : (linkedPanel?.script || base.defaultText),
      explanation: custom?.explanation !== undefined ? custom.explanation : (linkedPanel?.explanation || base.defaultExplanation),
      imageUrl: custom?.imageUrl !== undefined ? custom.imageUrl : (linkedPanel?.imageUrl || ''),
      linkedPanelIndex: panelIndex !== null && panelIndex !== undefined ? panelIndex : -1
    });
    setRoomLightboxOpen(true);
  }, [state.building.roomCustomizations, state.panels, setRoomLightboxData, setRoomLightboxOpen]);

  const onSaveRoomCustomization = useCallback(() => {
    if (!state.roomLightbox.selectedRoomId) return;

    setRoomCustomization(state.roomLightbox.selectedRoomId, {
      title: state.roomLightbox.title,
      script: state.roomLightbox.script,
      explanation: state.roomLightbox.explanation,
      imageUrl: state.roomLightbox.imageUrl.trim() || undefined,
      linkedPanelIndex: state.roomLightbox.linkedPanelIndex !== -1 ? state.roomLightbox.linkedPanelIndex : null
    });

    setRoomLightboxOpen(false);
    resetRoomLightbox();
  }, [state.roomLightbox, setRoomCustomization, setRoomLightboxOpen, resetRoomLightbox]);

  const onResetRoomCustomization = useCallback(() => {
    if (!state.roomLightbox.selectedRoomId) return;
    resetRoomCustomization(state.roomLightbox.selectedRoomId);
    setRoomLightboxOpen(false);
    resetRoomLightbox();
  }, [state.roomLightbox.selectedRoomId, resetRoomCustomization, setRoomLightboxOpen, resetRoomLightbox]);

  // Auto-generation loop effect
  useEffect(() => {
    if (!state.autoGen.isAutoGenerating || state.autoGen.prompts.length === 0 || state.autoGen.progress >= state.autoGen.prompts.length) {
      if (state.autoGen.isAutoGenerating && state.autoGen.prompts.length > 0 && state.autoGen.progress >= state.autoGen.prompts.length) {
        stopAutoGen();
      }
      return;
    }

    let timeout: number;
    const generateNext = async () => {
      try {
        setAutoGenWaiting(false);
        const { getAIProvider } = await import('./services/aiProvider');
        const ai = getAIProvider();
        const prompt = state.autoGen.prompts[state.autoGen.progress];

        const imageResult = await ai.generateImage(prompt, { aspectRatio: '1:1' });
        const imageUrl = `data:${imageResult.mimeType};base64,${imageResult.base64}`;
        addAutoGenImage(imageUrl);
        setAutoGenProgress(state.autoGen.progress + 1);
      } catch (err) {
        console.error("Auto Gen Error:", err);
        const errMsg = (err as Error).message || '';
        const isQuotaError = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED');
        const isServerError = (err as Record<string, unknown>).status === 500 || (err as Record<string, unknown>).status === 503;

        if (isQuotaError || isServerError) {
          setAutoGenWaiting(true);
          const waitTime = isQuotaError ? 45000 : 10000;
          console.warn(`Auto Gen Rate Limit for index ${state.autoGen.progress}. Waiting ${waitTime / 1000}s...`);
          timeout = window.setTimeout(generateNext, waitTime);
          return;
        }

        // Skip other failures
        setAutoGenProgress(state.autoGen.progress + 1);
      }
    };

    const initialDelay = state.autoGen.progress === 0 ? 0 : 5000;
    timeout = window.setTimeout(generateNext, initialDelay);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [state.autoGen.isAutoGenerating, state.autoGen.prompts, state.autoGen.progress, state.autoGen.isWaiting, addAutoGenImage, setAutoGenProgress, setAutoGenWaiting, stopAutoGen]);

  return (
    <main>
      <h1>Generador de Cómics IA</h1>
      <p>Pega un texto, sube un archivo (.txt, .pdf, audio) o carga un ejemplo. La IA lo resumirá en un guion de 8 viñetas y lo convertirá en una historieta.</p>

      {/* Script Input Area */}
      <div className="script-input-area">
        <label htmlFor="script-input">Tu Texto:</label>
        <textarea
          id="script-input"
          value={state.scriptText}
          onChange={(e) => setScriptText(e.target.value)}
          disabled={state.isLoading}
          rows={10}
          placeholder="Escribe o pega cualquier texto aquí..."
        />
        <div className="upload-area">
          <label htmlFor="file-upload" className="file-upload-label" aria-disabled={state.isLoading}>
            Subir archivo (.txt, .pdf, audio)
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={onFileChange}
            accept=".txt,.pdf,audio/*"
            style={{ display: 'none' }}
            disabled={state.isLoading}
          />
          <button
            onClick={() => setScriptText(defaultScript)}
            className="secondary-button"
            disabled={state.isLoading}
          >
            Cargar Ejemplo
          </button>
        </div>
        {state.fileProcessingMessage && <p className="file-processing-message">{state.fileProcessingMessage}</p>}
      </div>

      {/* Action Buttons */}
      <div className="actions-container">
        {!state.isLoading && (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="generate-button"
              onClick={onGenerateComic}
              disabled={state.isLoading || !state.scriptText.trim() || state.autoGen.isAutoGenerating}
            >
              Crear Cómic
            </button>
            <button
              className="generate-button"
              onClick={onStartAutoGen}
              disabled={state.isLoading || !state.scriptText.trim() || state.autoGen.isAutoGenerating}
              style={{ backgroundColor: '#10b981' }}
            >
              {state.autoGen.isAutoGenerating ? 'Generando cada 5s...' : 'Auto-Generar Imágenes'}
            </button>
          </div>
        )}

        {state.isGenerated && !state.isLoading && !state.autoGen.isAutoGenerating && (
          <>
            <button className="secondary-button" onClick={openSlideshow} disabled={state.isExporting}>
              Modo Presentación
            </button>
            <button className="export-button" onClick={onExportPng} disabled={state.isExporting}>
              {state.isExporting ? 'Exportando...' : 'Exportar PNG (Tira)'}
            </button>
            <button className="export-button" onClick={onExportPdf} disabled={state.isExporting}>
              {state.isExporting ? 'Exportando...' : 'Exportar PDF (Tira)'}
            </button>
            <button className="export-button" onClick={onExportSlides} disabled={state.isExporting}>
              {state.isExporting ? 'Exportando...' : 'Descargar Slides (PDF)'}
            </button>
            <button
              className="export-button"
              onClick={() => setSocialExportOpen(true)}
              disabled={state.isExporting || state.socialExport.isExporting}
              style={{ backgroundColor: '#0284c7', borderColor: '#0369a1', fontWeight: 'bold' }}
            >
              Publicar en Redes (LinkedIn / X) 🚀
            </button>
          </>
        )}
      </div>

      {/* Loading State */}
      {state.isLoading && (
        <div className="loader" role="status" aria-live="polite">
          <div className="spinner"></div>
          <p>{state.loadingMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {state.error && <p className="error-message">{state.error}</p>}

      {/* Auto-Generation Gallery */}
      <AutoGenGallery
        images={state.autoGen.images}
        prompts={state.autoGen.prompts}
        isAutoGenerating={state.autoGen.isAutoGenerating}
        progress={state.autoGen.progress}
        totalPrompts={state.autoGen.prompts.length}
        isWaiting={state.autoGen.isWaiting}
        onExportGallery={onExportGallery}
        isExporting={state.isExporting}
      />

      {/* Slideshow Modal */}
      <SlideshowModal
        isOpen={state.slideshow.isOpen}
        currentIndex={state.slideshow.currentIndex}
        panels={orderedPanels}
        onClose={closeSlideshow}
        onNext={nextSlide}
        onPrev={prevSlide}
      />

      {/* Social Export Offscreen Render Target */}
      <SocialSlideRenderTarget
        renderIndex={state.socialExport.renderIndex}
        panels={orderedPanels}
        state={state.socialExport}
      />

      {/* Social Export Modal */}
      <SocialExportModal
        isOpen={state.socialExport.isOpen}
        state={state.socialExport}
        panels={orderedPanels}
        copiedTweetIndex={copiedTweetIndex}
        onClose={() => setSocialExportOpen(false)}
        onThemeChange={setSocialTheme}
        onAccentColorChange={setSocialAccentColor}
        onRatioChange={setSocialRatio}
        onAuthorChange={setSocialAuthor}
        onPreviewIndexChange={setSocialPreviewIndex}
        onExportLinkedInPdf={onExportLinkedInPdf}
        onExportXZip={onExportXZip}
        onCopyTweet={onCopyTweet}
      />

      {/* View Mode Selector */}
      <div className="view-mode-selector-container" style={{ display: 'flex', width: '100%', maxWidth: '800px', margin: '1.5rem 0 0.5rem 0', justifyContent: 'center' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          width: '100%',
          backgroundColor: 'var(--surface-color)',
          padding: '0.5rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)'
        }}>
          <button
            onClick={() => setViewMode('standard')}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: state.building.viewMode === 'standard' ? 'var(--primary-color)' : 'transparent',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span>📖</span> Tiras de Cómic Estándar
          </button>
          <button
            onClick={() => setViewMode('building')}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: state.building.viewMode === 'building' ? '#10b981' : 'transparent',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span>🏢</span> Réplica 13, Rue del Percebe
          </button>
        </div>
      </div>

      {/* Standard Comic View */}
      {state.building.viewMode === 'standard' && (
        <div id="comic-container-export" style={{ width: '100%' }}>
          <div className="comic-container">
            {state.panels.map((panel, index) => {
              const reversedIndex = state.panels.length - 1 - index;
              return (
                <ComicPanel
                  key={reversedIndex}
                  panel={panel}
                  index={index}
                  reversedIndex={reversedIndex}
                  isEditing={state.edit.editingPanelIndex === reversedIndex}
                  editedScript={state.edit.editedScript}
                  editImagePrompt={state.edit.editImagePrompt}
                  isGenerated={state.isGenerated}
                  isLoading={state.isLoading}
                  onEditClick={onEditClick}
                  onScriptChange={setEditedScript}
                  onImagePromptChange={setEditImagePrompt}
                  onRegenerate={onRegeneratePanel}
                  onEditImage={onEditImagePanel}
                  onCancelEdit={onCancelEdit}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Building View */}
      {state.building.viewMode === 'building' && (
        <BuildingView
          panels={state.panels}
          activeElevatorFloor={state.building.activeElevatorFloor}
          roomCustomizations={state.building.roomCustomizations}
          isExporting={state.isExporting}
          onElevatorFloorChange={setElevatorFloor}
          onRoomClick={openRoomLightbox}
          onResetAllCustomizations={resetAllRoomCustomizations}
          onExportingChange={setIsExporting}
          onLoadingMessageChange={setLoadingMessage}
          onError={setError}
        />
      )}

      {/* Room Lightbox */}
      <RoomLightbox
        isOpen={state.roomLightbox.isOpen}
        roomData={state.roomLightbox}
        panels={state.panels}
        onClose={() => setRoomLightboxOpen(false)}
        onTitleChange={(title) => setRoomLightboxData({ title })}
        onScriptChange={(script) => setRoomLightboxData({ script })}
        onExplanationChange={(explanation) => setRoomLightboxData({ explanation })}
        onImageUrlChange={(imageUrl) => setRoomLightboxData({ imageUrl })}
        onLinkedPanelIndexChange={(linkedPanelIndex) => setRoomLightboxData({ linkedPanelIndex })}
        onSave={onSaveRoomCustomization}
        onReset={onResetRoomCustomization}
      />
    </main>
  );
};

export default App;
