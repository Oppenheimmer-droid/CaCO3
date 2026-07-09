import { useEffect, useRef, useCallback } from 'react';
import { AppState, PanelData, CustomRoomData } from '../types';
import { STORAGE_KEY } from '../constants';

export interface PersistedState {
  panels: PanelData[];
  scriptText: string;
  roomCustomizations: Record<string, CustomRoomData>;
  lastSaved: string;
}

const PERSISTED_KEYS: (keyof PersistedState)[] = ['panels', 'scriptText', 'roomCustomizations'];

export function usePersistence(
  state: AppState,
  loadState: (partial: Partial<AppState>) => void
) {
  const lastSavedRef = useRef<string>('');
  const isInitialLoad = useRef(true);

  // Load persisted state on mount
  useEffect(() => {
    if (!isInitialLoad.current) return;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PersistedState;
        
        // Validate the saved data
        if (parsed.panels && Array.isArray(parsed.panels)) {
          const partial: Partial<AppState> = {
            panels: parsed.panels,
            scriptText: parsed.scriptText || '',
            isGenerated: parsed.panels.length > 0
          };

          // Load room customizations if they exist
          if (parsed.roomCustomizations && typeof parsed.roomCustomizations === 'object') {
            partial.building = {
              ...state.building,
              roomCustomizations: parsed.roomCustomizations
            };
          }

          loadState(partial);
          lastSavedRef.current = JSON.stringify(parsed);
          console.info('Loaded persisted state from localStorage');
        }
      }
    } catch (e) {
      console.warn('Failed to load persisted state:', e);
    }

    isInitialLoad.current = false;
  }, []);

  // Save state changes
  const saveState = useCallback(() => {
    try {
      const toSave: PersistedState = {
        panels: state.panels,
        scriptText: state.scriptText,
        roomCustomizations: state.building.roomCustomizations,
        lastSaved: new Date().toISOString()
      };

      const serialized = JSON.stringify(toSave);
      
      // Only save if something changed
      if (serialized !== lastSavedRef.current) {
        localStorage.setItem(STORAGE_KEY, serialized);
        lastSavedRef.current = serialized;
        console.debug('State saved to localStorage');
      }
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }, [state.panels, state.scriptText, state.building.roomCustomizations]);

  // Debounced save on state changes
  useEffect(() => {
    if (isInitialLoad.current) return;
    
    const timeoutId = setTimeout(saveState, 1000);
    return () => clearTimeout(timeoutId);
  }, [saveState]);

  // Clear persisted state
  const clearPersistedState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      lastSavedRef.current = '';
      console.info('Persisted state cleared');
    } catch (e) {
      console.warn('Failed to clear persisted state:', e);
    }
  }, []);

  // Get last saved timestamp
  const getLastSaved = useCallback((): Date | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PersistedState;
        if (parsed.lastSaved) {
          return new Date(parsed.lastSaved);
        }
      }
    } catch {
      // Ignore
    }
    return null;
  }, []);

  return {
    saveState,
    clearPersistedState,
    getLastSaved
  };
}
