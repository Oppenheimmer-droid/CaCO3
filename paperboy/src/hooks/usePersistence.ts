import { useEffect, useRef, useCallback } from 'react';
import { AppState, PanelData } from '../types';
import { STORAGE_KEY } from '../constants';

export interface PersistedState {
  panels: PanelData[];
  scriptText: string;
  lastSaved: string;
}

export function usePersistence(
  state: AppState,
  loadState: (partial: Partial<AppState>) => void
) {
  const lastSavedRef = useRef<string>('');
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!isInitialLoad.current) return;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PersistedState;
        
        if (parsed.panels && Array.isArray(parsed.panels)) {
          const partial: Partial<AppState> = {
            panels: parsed.panels,
            scriptText: parsed.scriptText || '',
            isGenerated: parsed.panels.length > 0
          };
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

  const saveState = useCallback(() => {
    try {
      const toSave: PersistedState = {
        panels: state.panels,
        scriptText: state.scriptText,
        lastSaved: new Date().toISOString()
      };

      const serialized = JSON.stringify(toSave);
      
      if (serialized !== lastSavedRef.current) {
        localStorage.setItem(STORAGE_KEY, serialized);
        lastSavedRef.current = serialized;
        console.debug('State saved to localStorage');
      }
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }, [state.panels, state.scriptText]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    const timeoutId = setTimeout(saveState, 1000);
    return () => clearTimeout(timeoutId);
  }, [saveState]);

  const clearPersistedState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      lastSavedRef.current = '';
      console.info('Persisted state cleared');
    } catch (e) {
      console.warn('Failed to clear persisted state:', e);
    }
  }, []);

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

  return { saveState, clearPersistedState, getLastSaved };
}
