// Core type definitions for Comic Generator

export interface PanelData {
  title: string;
  script: string;
  explanation: string;
  imageUrl?: string;
  isRegenerating?: boolean;
  error?: string;
}

export interface EditState {
  editingPanelIndex: number | null;
  editedScript: string;
  editImagePrompt: string;
}

export interface SlideshowState {
  isOpen: boolean;
  currentIndex: number;
}

export interface AppState {
  panels: PanelData[];
  scriptText: string;
  isLoading: boolean;
  isGenerated: boolean;
  isExporting: boolean;
  loadingMessage: string;
  error: string | null;
  fileProcessingMessage: string;
  edit: EditState;
  slideshow: SlideshowState;
}

export type AppAction =
  | { type: 'SET_PANELS'; payload: PanelData[] }
  | { type: 'UPDATE_PANEL'; payload: { index: number; panel: Partial<PanelData> } }
  | { type: 'SET_SCRIPT_TEXT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_MESSAGE'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILE_PROCESSING_MESSAGE'; payload: string }
  | { type: 'SET_GENERATED'; payload: boolean }
  | { type: 'SET_EXPORTING'; payload: boolean }
  | { type: 'SET_EDIT_PANEL_INDEX'; payload: number | null }
  | { type: 'SET_EDITED_SCRIPT'; payload: string }
  | { type: 'SET_EDIT_IMAGE_PROMPT'; payload: string }
  | { type: 'RESET_EDIT' }
  | { type: 'SET_SLIDESHOW_OPEN'; payload: boolean }
  | { type: 'SET_SLIDESHOW_INDEX'; payload: number }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

export const initialAppState: AppState = {
  panels: [],
  scriptText: '',
  isLoading: false,
  isGenerated: false,
  isExporting: false,
  loadingMessage: '',
  error: null,
  fileProcessingMessage: '',
  edit: {
    editingPanelIndex: null,
    editedScript: '',
    editImagePrompt: '',
  },
  slideshow: {
    isOpen: false,
    currentIndex: 0,
  },
};

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
    public readonly isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export interface GenerationOptions {
  maxAttempts?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface ImageGenerationOptions extends GenerationOptions {
  aspectRatio?: '1:1' | '4:3' | '16:9' | '9:16';
}

export interface TextGenerationOptions extends GenerationOptions {
  model?: string;
  responseMimeType?: string;
  responseSchema?: Record<string, unknown>;
}
