import React, { useMemo, useCallback, useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { useFileImport } from './hooks/useFileImport';
import { useComicGeneration } from './hooks/useComicGeneration';
import { usePersistence } from './hooks/usePersistence';
import { ComicPanel, SlideshowModal } from './components';
import { exportComicAsPng, exportComicAsPdf, exportSlidesAsPdf } from './services/exportService';
import { defaultScript } from './constants/defaultScript';

const App: React.FC = () => {
  const {
    state,
    setPanels,
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
    loadState
  } = useAppState();

  const { handleFileChange } = useFileImport();
  const { generateComic, regeneratePanel, editImage } = useComicGeneration();
  const { getLastSaved } = usePersistence(state, loadState);

  const orderedPanels = useMemo(() => [...state.panels].reverse(), [state.panels]);

  const onFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFileChange(file, setFileProcessingMessage, setScriptText, setError);
    event.target.value = '';
  }, [handleFileChange, setFileProcessingMessage, setScriptText, setError]);

  const onGenerateComic = useCallback(() => {
    generateComic(
      state.scriptText,
      (msg) => setLoadingMessage(msg),
      (panels) => setPanels(panels),
      (err) => setError(err),
      () => { setLoading(false); setIsGenerated(true); setLoadingMessage(''); }
    );
  }, [generateComic, state.scriptText, setLoadingMessage, setPanels, setError, setLoading, setIsGenerated]);

  const onRegeneratePanel = useCallback((index: number) => {
    regeneratePanel(index, state.edit.editedScript, state.panels, setPanels, setError, resetEdit);
  }, [regeneratePanel, state.edit.editedScript, state.panels, setPanels, setError, resetEdit]);

  const onEditImagePanel = useCallback((index: number) => {
    const panel = state.panels[state.panels.length - 1 - index];
    if (!panel?.imageUrl) return;
    editImage(index, panel.imageUrl, state.edit.editImagePrompt, state.panels, setPanels, setError);
    resetEdit();
  }, [editImage, state.edit.editImagePrompt, state.panels, setPanels, setError, resetEdit]);

  const onEditClick = useCallback((index: number) => {
    const panelIndex = state.panels.length - 1 - index;
    setEditingPanelIndex(index);
    setEditedScript(state.panels[panelIndex].script);
    setEditImagePrompt('');
  }, [state.panels, setEditingPanelIndex, setEditedScript]);

  const openSlideshow = useCallback(() => {
    if (orderedPanels.length > 0) { setSlideshowIndex(0); setSlideshowOpen(true); }
  }, [orderedPanels.length, setSlideshowIndex, setSlideshowOpen]);

  const onExportPng = useCallback(async () => {
    setIsExporting(true);
    try { await exportComicAsPng('comic-container-export'); }
    catch { setError('No se pudo exportar el cómic.'); }
    finally { setIsExporting(false); }
  }, [setIsExporting, setError]);

  const onExportPdf = useCallback(async () => {
    setIsExporting(true);
    try { await exportComicAsPdf('comic-container-export'); }
    catch { setError('No se pudo exportar el cómic.'); }
    finally { setIsExporting(false); }
  }, [setIsExporting, setError]);

  const onExportSlides = useCallback(async () => {
    setIsExporting(true);
    try { await exportSlidesAsPdf(orderedPanels); }
    catch { setError('No se pudieron exportar las diapositivas.'); }
    finally { setIsExporting(false); }
  }, [orderedPanels, setIsExporting, setError]);

  return (
    <main>
      <header>
        <h1>🎨 Generador de Cómics con IA</h1>
        <p>Convierte tu texto en un cómic de 8 viñetas</p>
      </header>

      <section className="input-section">
        <textarea
          value={state.scriptText}
          onChange={(e) => setScriptText(e.target.value)}
          placeholder="Escribe o pega aquí el texto de tu cómic..."
          rows={6}
        />
        
        <div className="button-group">
          <input type="file" accept=".txt" onChange={onFileChange} id="file-input" />
          <label htmlFor="file-input" className="secondary-button">📁 Importar TXT</label>
          
          <button onClick={onGenerateComic} disabled={state.isLoading || !state.scriptText.trim()}>
            {state.isLoading ? 'Generando...' : '🎬 Generar Cómic'}
          </button>
        </div>
      </section>

      {state.isLoading && (
        <div className="loader"><div className="spinner"></div><p>{state.loadingMessage}</p></div>
      )}
      {state.error && <p className="error-message">{state.error}</p>}

      {state.isGenerated && !state.isLoading && (
        <>
          <button className="secondary-button" onClick={openSlideshow}>📽️ Presentación</button>
          <button onClick={onExportPng} disabled={state.isExporting}>📷 PNG</button>
          <button onClick={onExportPdf} disabled={state.isExporting}>📄 PDF</button>
          <button onClick={onExportSlides} disabled={state.isExporting}>🖥️ Slides</button>
        </>
      )}

      <div id="comic-container-export">
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
                onCancelEdit={resetEdit}
              />
            );
          })}
        </div>
      </div>

      <SlideshowModal
        isOpen={state.slideshow.isOpen}
        currentIndex={state.slideshow.currentIndex}
        panels={orderedPanels}
        onClose={() => setSlideshowOpen(false)}
        onNext={() => setSlideshowIndex(state.slideshow.currentIndex + 1)}
        onPrev={() => setSlideshowIndex(state.slideshow.currentIndex - 1)}
      />
    </main>
  );
};

export default App;
