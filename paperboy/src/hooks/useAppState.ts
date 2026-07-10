import { useReducer, useCallback } from 'react';
import { AppState, AppAction, initialAppState, PanelData } from '../types';

export { initialAppState };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PANELS':
      return { ...state, panels: action.payload };
    case 'UPDATE_PANEL':
      return {
        ...state,
        panels: state.panels.map((p, i) =>
          i === action.payload.index ? { ...p, ...action.payload.panel } : p
        )
      };
    case 'SET_SCRIPT_TEXT':
      return { ...state, scriptText: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_LOADING_MESSAGE':
      return { ...state, loadingMessage: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_FILE_PROCESSING_MESSAGE':
      return { ...state, fileProcessingMessage: action.payload };
    case 'SET_GENERATED':
      return { ...state, isGenerated: action.payload };
    case 'SET_EXPORTING':
      return { ...state, isExporting: action.payload };
    case 'SET_EDIT_PANEL_INDEX':
      return { ...state, edit: { ...state.edit, editingPanelIndex: action.payload } };
    case 'SET_EDITED_SCRIPT':
      return { ...state, edit: { ...state.edit, editedScript: action.payload } };
    case 'SET_EDIT_IMAGE_PROMPT':
      return { ...state, edit: { ...state.edit, editImagePrompt: action.payload } };
    case 'RESET_EDIT':
      return { ...state, edit: { editingPanelIndex: null, editedScript: '', editImagePrompt: '' } };
    case 'SET_SLIDESHOW_OPEN':
      return { ...state, slideshow: { ...state.slideshow, isOpen: action.payload } };
    case 'SET_SLIDESHOW_INDEX':
      return { ...state, slideshow: { ...state.slideshow, currentIndex: action.payload } };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  const setPanels = useCallback((panels: PanelData[]) => {
    dispatch({ type: 'SET_PANELS', payload: panels });
  }, []);

  const setScriptText = useCallback((text: string) => {
    dispatch({ type: 'SET_SCRIPT_TEXT', payload: text });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setLoadingMessage = useCallback((message: string) => {
    dispatch({ type: 'SET_LOADING_MESSAGE', payload: message });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setFileProcessingMessage = useCallback((message: string) => {
    dispatch({ type: 'SET_FILE_PROCESSING_MESSAGE', payload: message });
  }, []);

  const setIsGenerated = useCallback((generated: boolean) => {
    dispatch({ type: 'SET_GENERATED', payload: generated });
  }, []);

  const setIsExporting = useCallback((exporting: boolean) => {
    dispatch({ type: 'SET_EXPORTING', payload: exporting });
  }, []);

  const setEditingPanelIndex = useCallback((index: number | null) => {
    dispatch({ type: 'SET_EDIT_PANEL_INDEX', payload: index });
  }, []);

  const setEditedScript = useCallback((script: string) => {
    dispatch({ type: 'SET_EDITED_SCRIPT', payload: script });
  }, []);

  const setEditImagePrompt = useCallback((prompt: string) => {
    dispatch({ type: 'SET_EDIT_IMAGE_PROMPT', payload: prompt });
  }, []);

  const resetEdit = useCallback(() => {
    dispatch({ type: 'RESET_EDIT' });
  }, []);

  const setSlideshowOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_SLIDESHOW_OPEN', payload: open });
  }, []);

  const setSlideshowIndex = useCallback((index: number) => {
    dispatch({ type: 'SET_SLIDESHOW_INDEX', payload: index });
  }, []);

  const loadState = useCallback((partialState: Partial<AppState>) => {
    dispatch({ type: 'LOAD_STATE', payload: partialState });
  }, []);

  return {
    state,
    dispatch,
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
  };
}

export type UseAppStateReturn = ReturnType<typeof useAppState>;
