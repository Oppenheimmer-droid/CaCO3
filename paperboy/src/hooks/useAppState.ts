import { useReducer, useCallback } from 'react';
import { AppState, AppAction, initialAppState, PanelData, CustomRoomData } from '../types';

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

    case 'ADD_PANEL':
      return { ...state, panels: [...state.panels, action.payload] };

    case 'REMOVE_PANEL':
      return {
        ...state,
        panels: state.panels.filter((_, i) => i !== action.payload)
      };

    case 'REORDER_PANELS':
      return { ...state, panels: action.payload };

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
      return {
        ...state,
        edit: { ...state.edit, editingPanelIndex: action.payload }
      };

    case 'SET_EDITED_SCRIPT':
      return {
        ...state,
        edit: { ...state.edit, editedScript: action.payload }
      };

    case 'SET_EDIT_IMAGE_PROMPT':
      return {
        ...state,
        edit: { ...state.edit, editImagePrompt: action.payload }
      };

    case 'RESET_EDIT':
      return {
        ...state,
        edit: {
          editingPanelIndex: null,
          editedScript: '',
          editImagePrompt: ''
        }
      };

    case 'SET_SLIDESHOW_OPEN':
      return {
        ...state,
        slideshow: { ...state.slideshow, isOpen: action.payload }
      };

    case 'SET_SLIDESHOW_INDEX':
      return {
        ...state,
        slideshow: { ...state.slideshow, currentIndex: action.payload }
      };

    case 'SET_AUTOGEN_START':
      return {
        ...state,
        autoGen: {
          isAutoGenerating: true,
          prompts: action.payload,
          images: [],
          progress: 0,
          isWaiting: false
        }
      };

    case 'SET_AUTOGEN_IMAGE':
      return {
        ...state,
        autoGen: {
          ...state.autoGen,
          images: [...state.autoGen.images, action.payload]
        }
      };

    case 'SET_AUTOGEN_PROGRESS':
      return {
        ...state,
        autoGen: { ...state.autoGen, progress: action.payload }
      };

    case 'SET_AUTOGEN_WAITING':
      return {
        ...state,
        autoGen: { ...state.autoGen, isWaiting: action.payload }
      };

    case 'SET_AUTOGEN_STOP':
      return {
        ...state,
        autoGen: {
          isAutoGenerating: false,
          prompts: [],
          images: [],
          progress: 0,
          isWaiting: false
        }
      };

    case 'SET_SOCIAL_EXPORT_OPEN':
      return {
        ...state,
        socialExport: { ...state.socialExport, isOpen: action.payload }
      };

    case 'SET_SOCIAL_THEME':
      return {
        ...state,
        socialExport: { ...state.socialExport, theme: action.payload }
      };

    case 'SET_SOCIAL_ACCENT_COLOR':
      return {
        ...state,
        socialExport: { ...state.socialExport, accentColor: action.payload }
      };

    case 'SET_SOCIAL_RATIO':
      return {
        ...state,
        socialExport: { ...state.socialExport, ratio: action.payload }
      };

    case 'SET_SOCIAL_AUTHOR':
      return {
        ...state,
        socialExport: { ...state.socialExport, author: action.payload }
      };

    case 'SET_SOCIAL_PREVIEW_INDEX':
      return {
        ...state,
        socialExport: { ...state.socialExport, previewIndex: action.payload }
      };

    case 'SET_SOCIAL_EXPORTING':
      return {
        ...state,
        socialExport: { ...state.socialExport, isExporting: action.payload }
      };

    case 'SET_SOCIAL_EXPORT_PROGRESS':
      return {
        ...state,
        socialExport: { ...state.socialExport, progress: action.payload }
      };

    case 'SET_SOCIAL_RENDER_INDEX':
      return {
        ...state,
        socialExport: { ...state.socialExport, renderIndex: action.payload }
      };

    case 'SET_VIEW_MODE':
      return {
        ...state,
        building: { ...state.building, viewMode: action.payload }
      };

    case 'SET_ELEVATOR_FLOOR':
      return {
        ...state,
        building: { ...state.building, activeElevatorFloor: action.payload }
      };

    case 'SET_ROOM_CUSTOMIZATION':
      return {
        ...state,
        building: {
          ...state.building,
          roomCustomizations: {
            ...state.building.roomCustomizations,
            [action.payload.roomId]: action.payload.data
          }
        }
      };

    case 'RESET_ROOM_CUSTOMIZATION':
      return {
        ...state,
        building: {
          ...state.building,
          roomCustomizations: Object.fromEntries(
            Object.entries(state.building.roomCustomizations).filter(
              ([key]) => key !== action.payload
            )
          )
        }
      };

    case 'RESET_ALL_ROOM_CUSTOMIZATIONS':
      return {
        ...state,
        building: {
          ...state.building,
          roomCustomizations: {}
        }
      };

    case 'SET_ROOM_LIGHTBOX_OPEN':
      return {
        ...state,
        roomLightbox: { ...state.roomLightbox, isOpen: action.payload }
      };

    case 'SET_ROOM_LIGHTBOX_DATA':
      return {
        ...state,
        roomLightbox: { ...state.roomLightbox, ...action.payload }
      };

    case 'RESET_ROOM_LIGHTBOX':
      return {
        ...state,
        roomLightbox: {
          isOpen: false,
          selectedRoomId: null,
          title: '',
          script: '',
          explanation: '',
          imageUrl: '',
          linkedPanelIndex: -1
        }
      };

    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  // Panel actions
  const setPanels = useCallback((panels: PanelData[]) => {
    dispatch({ type: 'SET_PANELS', payload: panels });
  }, []);

  const updatePanel = useCallback((index: number, panel: Partial<PanelData>) => {
    dispatch({ type: 'UPDATE_PANEL', payload: { index, panel } });
  }, []);

  const reorderPanels = useCallback((panels: PanelData[]) => {
    dispatch({ type: 'REORDER_PANELS', payload: panels });
  }, []);

  // Script actions
  const setScriptText = useCallback((text: string) => {
    dispatch({ type: 'SET_SCRIPT_TEXT', payload: text });
  }, []);

  // Loading actions
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

  // Edit actions
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

  // Slideshow actions
  const setSlideshowOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_SLIDESHOW_OPEN', payload: open });
  }, []);

  const setSlideshowIndex = useCallback((index: number) => {
    dispatch({ type: 'SET_SLIDESHOW_INDEX', payload: index });
  }, []);

  // Auto-gen actions
  const startAutoGen = useCallback((prompts: string[]) => {
    dispatch({ type: 'SET_AUTOGEN_START', payload: prompts });
  }, []);

  const addAutoGenImage = useCallback((image: string) => {
    dispatch({ type: 'SET_AUTOGEN_IMAGE', payload: image });
  }, []);

  const setAutoGenProgress = useCallback((progress: number) => {
    dispatch({ type: 'SET_AUTOGEN_PROGRESS', payload: progress });
  }, []);

  const setAutoGenWaiting = useCallback((waiting: boolean) => {
    dispatch({ type: 'SET_AUTOGEN_WAITING', payload: waiting });
  }, []);

  const stopAutoGen = useCallback(() => {
    dispatch({ type: 'SET_AUTOGEN_STOP' });
  }, []);

  // Social export actions
  const setSocialExportOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_SOCIAL_EXPORT_OPEN', payload: open });
  }, []);

  const setSocialTheme = useCallback((theme: 'dark' | 'light') => {
    dispatch({ type: 'SET_SOCIAL_THEME', payload: theme });
  }, []);

  const setSocialAccentColor = useCallback((color: string) => {
    dispatch({ type: 'SET_SOCIAL_ACCENT_COLOR', payload: color });
  }, []);

  const setSocialRatio = useCallback((ratio: 'square' | 'landscape') => {
    dispatch({ type: 'SET_SOCIAL_RATIO', payload: ratio });
  }, []);

  const setSocialAuthor = useCallback((author: string) => {
    dispatch({ type: 'SET_SOCIAL_AUTHOR', payload: author });
  }, []);

  const setSocialPreviewIndex = useCallback((index: number) => {
    dispatch({ type: 'SET_SOCIAL_PREVIEW_INDEX', payload: index });
  }, []);

  const setSocialExporting = useCallback((exporting: boolean) => {
    dispatch({ type: 'SET_SOCIAL_EXPORTING', payload: exporting });
  }, []);

  const setSocialExportProgress = useCallback((progress: number) => {
    dispatch({ type: 'SET_SOCIAL_EXPORT_PROGRESS', payload: progress });
  }, []);

  const setSocialRenderIndex = useCallback((index: number | null) => {
    dispatch({ type: 'SET_SOCIAL_RENDER_INDEX', payload: index });
  }, []);

  // Building actions
  const setViewMode = useCallback((mode: 'standard' | 'building') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const setElevatorFloor = useCallback((floor: number) => {
    dispatch({ type: 'SET_ELEVATOR_FLOOR', payload: floor });
  }, []);

  const setRoomCustomization = useCallback((roomId: string, data: CustomRoomData) => {
    dispatch({ type: 'SET_ROOM_CUSTOMIZATION', payload: { roomId, data } });
  }, []);

  const resetRoomCustomization = useCallback((roomId: string) => {
    dispatch({ type: 'RESET_ROOM_CUSTOMIZATION', payload: roomId });
  }, []);

  const resetAllRoomCustomizations = useCallback(() => {
    dispatch({ type: 'RESET_ALL_ROOM_CUSTOMIZATIONS' });
  }, []);

  // Room lightbox actions
  const setRoomLightboxOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_ROOM_LIGHTBOX_OPEN', payload: open });
  }, []);

  const setRoomLightboxData = useCallback((data: Partial<typeof state.roomLightbox>) => {
    dispatch({ type: 'SET_ROOM_LIGHTBOX_DATA', payload: data });
  }, []);

  const resetRoomLightbox = useCallback(() => {
    dispatch({ type: 'RESET_ROOM_LIGHTBOX' });
  }, []);

  // State loading
  const loadState = useCallback((partialState: Partial<AppState>) => {
    dispatch({ type: 'LOAD_STATE', payload: partialState });
  }, []);

  return {
    state,
    dispatch,
    // Panel
    setPanels,
    updatePanel,
    reorderPanels,
    // Script
    setScriptText,
    // Loading
    setLoading,
    setLoadingMessage,
    setError,
    setFileProcessingMessage,
    setIsGenerated,
    setIsExporting,
    // Edit
    setEditingPanelIndex,
    setEditedScript,
    setEditImagePrompt,
    resetEdit,
    // Slideshow
    setSlideshowOpen,
    setSlideshowIndex,
    // Auto-gen
    startAutoGen,
    addAutoGenImage,
    setAutoGenProgress,
    setAutoGenWaiting,
    stopAutoGen,
    // Social export
    setSocialExportOpen,
    setSocialTheme,
    setSocialAccentColor,
    setSocialRatio,
    setSocialAuthor,
    setSocialPreviewIndex,
    setSocialExporting,
    setSocialExportProgress,
    setSocialRenderIndex,
    // Building
    setViewMode,
    setElevatorFloor,
    setRoomCustomization,
    resetRoomCustomization,
    resetAllRoomCustomizations,
    // Room lightbox
    setRoomLightboxOpen,
    setRoomLightboxData,
    resetRoomLightbox,
    // State
    loadState
  };
}

export type UseAppStateReturn = ReturnType<typeof useAppState>;
