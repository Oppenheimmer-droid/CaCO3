// Core type definitions for Paperboy

export interface PanelData {
  title: string;
  script: string;
  explanation: string;
  imageUrl?: string;
  isRegenerating?: boolean;
  error?: string;
}

export interface CustomRoomData {
  title?: string;
  script?: string;
  explanation?: string;
  imageUrl?: string;
  linkedPanelIndex?: number | null;
}

export interface DefaultRoomInfo {
  name: string;
  defaultTitle: string;
  defaultText: string;
  defaultExplanation: string;
  bgColor: string;
  defaultPanelIndex: number | null;
  defaultImage: string;
}

export interface RoomData extends DefaultRoomInfo {
  id: string;
  title: string;
  script: string;
  explanation: string;
  imageUrl?: string;
  linkedPanelIndex: number | null;
}

export interface ComicData {
  panels: PanelData[];
  scriptText: string;
  isGenerated: boolean;
}

export interface AutoGenState {
  isAutoGenerating: boolean;
  prompts: string[];
  images: string[];
  progress: number;
  isWaiting: boolean;
}

export interface SocialExportState {
  isOpen: boolean;
  theme: 'dark' | 'light';
  accentColor: string;
  ratio: 'square' | 'landscape';
  author: string;
  previewIndex: number;
  isExporting: boolean;
  progress: number;
  renderIndex: number | null;
}

export interface BuildingState {
  viewMode: 'standard' | 'building';
  activeElevatorFloor: number;
  roomCustomizations: Record<string, CustomRoomData>;
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

export interface RoomLightboxState {
  isOpen: boolean;
  selectedRoomId: string | null;
  title: string;
  script: string;
  explanation: string;
  imageUrl: string;
  linkedPanelIndex: number;
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
  autoGen: AutoGenState;
  socialExport: SocialExportState;
  building: BuildingState;
  roomLightbox: RoomLightboxState;
}

export type AppAction =
  | { type: 'SET_PANELS'; payload: PanelData[] }
  | { type: 'UPDATE_PANEL'; payload: { index: number; panel: Partial<PanelData> } }
  | { type: 'ADD_PANEL'; payload: PanelData }
  | { type: 'REMOVE_PANEL'; payload: number }
  | { type: 'REORDER_PANELS'; payload: PanelData[] }
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
  | { type: 'SET_AUTOGEN_START'; payload: string[] }
  | { type: 'SET_AUTOGEN_IMAGE'; payload: string }
  | { type: 'SET_AUTOGEN_PROGRESS'; payload: number }
  | { type: 'SET_AUTOGEN_WAITING'; payload: boolean }
  | { type: 'SET_AUTOGEN_STOP' }
  | { type: 'SET_SOCIAL_EXPORT_OPEN'; payload: boolean }
  | { type: 'SET_SOCIAL_THEME'; payload: 'dark' | 'light' }
  | { type: 'SET_SOCIAL_ACCENT_COLOR'; payload: string }
  | { type: 'SET_SOCIAL_RATIO'; payload: 'square' | 'landscape' }
  | { type: 'SET_SOCIAL_AUTHOR'; payload: string }
  | { type: 'SET_SOCIAL_PREVIEW_INDEX'; payload: number }
  | { type: 'SET_SOCIAL_EXPORTING'; payload: boolean }
  | { type: 'SET_SOCIAL_EXPORT_PROGRESS'; payload: number }
  | { type: 'SET_SOCIAL_RENDER_INDEX'; payload: number | null }
  | { type: 'SET_VIEW_MODE'; payload: 'standard' | 'building' }
  | { type: 'SET_ELEVATOR_FLOOR'; payload: number }
  | { type: 'SET_ROOM_CUSTOMIZATION'; payload: { roomId: string; data: CustomRoomData } }
  | { type: 'RESET_ROOM_CUSTOMIZATION'; payload: string }
  | { type: 'RESET_ALL_ROOM_CUSTOMIZATIONS' }
  | { type: 'SET_ROOM_LIGHTBOX_OPEN'; payload: boolean }
  | { type: 'SET_ROOM_LIGHTBOX_DATA'; payload: Partial<RoomLightboxState> }
  | { type: 'RESET_ROOM_LIGHTBOX' }
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
  autoGen: {
    isAutoGenerating: false,
    prompts: [],
    images: [],
    progress: 0,
    isWaiting: false,
  },
  socialExport: {
    isOpen: false,
    theme: 'dark',
    accentColor: '#10b981',
    ratio: 'square',
    author: '',
    previewIndex: 0,
    isExporting: false,
    progress: 0,
    renderIndex: null,
  },
  building: {
    viewMode: 'standard',
    activeElevatorFloor: 0,
    roomCustomizations: {},
  },
  roomLightbox: {
    isOpen: false,
    selectedRoomId: null,
    title: '',
    script: '',
    explanation: '',
    imageUrl: '',
    linkedPanelIndex: -1,
  },
};

export type AIProviderType = 'gemini' | 'ollama';

export interface AIProviderConfig {
  type: AIProviderType;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

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
