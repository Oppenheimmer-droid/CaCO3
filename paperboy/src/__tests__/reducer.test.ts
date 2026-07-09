import { describe, it, expect } from 'vitest';
import { appReducer, initialAppState } from '../hooks/useAppState';
import { PanelData } from '../types';

describe('appReducer', () => {
  describe('SET_PANELS', () => {
    it('should set panels', () => {
      const panels: PanelData[] = [
        { title: 'Test', script: 'Script', explanation: 'Exp' }
      ];
      const action = { type: 'SET_PANELS' as const, payload: panels };
      const state = appReducer(initialAppState, action);
      expect(state.panels).toEqual(panels);
    });
  });

  describe('UPDATE_PANEL', () => {
    it('should update a specific panel', () => {
      const initialPanels: PanelData[] = [
        { title: 'Original', script: 'Script', explanation: 'Exp' },
        { title: 'ToUpdate', script: 'Script', explanation: 'Exp' }
      ];
      let state = appReducer(initialAppState, { type: 'SET_PANELS', payload: initialPanels });
      
      state = appReducer(state, {
        type: 'UPDATE_PANEL',
        payload: { index: 1, panel: { title: 'Updated' } }
      });
      
      expect(state.panels[1].title).toBe('Updated');
      expect(state.panels[0].title).toBe('Original');
    });
  });

  describe('REORDER_PANELS', () => {
    it('should reorder panels', () => {
      const initialPanels: PanelData[] = [
        { title: 'First', script: 'Script', explanation: 'Exp' },
        { title: 'Second', script: 'Script', explanation: 'Exp' }
      ];
      let state = appReducer(initialAppState, { type: 'SET_PANELS', payload: initialPanels });
      
      const reordered: PanelData[] = [
        { title: 'Second', script: 'Script', explanation: 'Exp' },
        { title: 'First', script: 'Script', explanation: 'Exp' }
      ];
      state = appReducer(state, { type: 'REORDER_PANELS', payload: reordered });
      
      expect(state.panels[0].title).toBe('Second');
      expect(state.panels[1].title).toBe('First');
    });
  });

  describe('Loading states', () => {
    it('should set loading state', () => {
      const state = appReducer(initialAppState, { type: 'SET_LOADING', payload: true });
      expect(state.isLoading).toBe(true);
    });

    it('should set loading message', () => {
      const state = appReducer(initialAppState, { type: 'SET_LOADING_MESSAGE', payload: 'Processing...' });
      expect(state.loadingMessage).toBe('Processing...');
    });

    it('should set error', () => {
      const state = appReducer(initialAppState, { type: 'SET_ERROR', payload: 'Something went wrong' });
      expect(state.error).toBe('Something went wrong');
    });

    it('should clear error', () => {
      let state = appReducer(initialAppState, { type: 'SET_ERROR', payload: 'Error' });
      state = appReducer(state, { type: 'SET_ERROR', payload: null });
      expect(state.error).toBeNull();
    });
  });

  describe('Edit state', () => {
    it('should set editing panel index', () => {
      const state = appReducer(initialAppState, { type: 'SET_EDIT_PANEL_INDEX', payload: 5 });
      expect(state.edit.editingPanelIndex).toBe(5);
    });

    it('should set edited script', () => {
      const state = appReducer(initialAppState, { type: 'SET_EDITED_SCRIPT', payload: 'New script' });
      expect(state.edit.editedScript).toBe('New script');
    });

    it('should reset edit state', () => {
      let state = appReducer(initialAppState, { type: 'SET_EDIT_PANEL_INDEX', payload: 5 });
      state = appReducer(state, { type: 'SET_EDITED_SCRIPT', payload: 'Some script' });
      state = appReducer(state, { type: 'RESET_EDIT' });
      
      expect(state.edit.editingPanelIndex).toBeNull();
      expect(state.edit.editedScript).toBe('');
      expect(state.edit.editImagePrompt).toBe('');
    });
  });

  describe('Slideshow state', () => {
    it('should open slideshow', () => {
      const state = appReducer(initialAppState, { type: 'SET_SLIDESHOW_OPEN', payload: true });
      expect(state.slideshow.isOpen).toBe(true);
    });

    it('should set slideshow index', () => {
      const state = appReducer(initialAppState, { type: 'SET_SLIDESHOW_INDEX', payload: 3 });
      expect(state.slideshow.currentIndex).toBe(3);
    });
  });

  describe('AutoGen state', () => {
    it('should start auto generation', () => {
      const prompts = ['prompt1', 'prompt2'];
      const state = appReducer(initialAppState, { type: 'SET_AUTOGEN_START', payload: prompts });
      
      expect(state.autoGen.isAutoGenerating).toBe(true);
      expect(state.autoGen.prompts).toEqual(prompts);
      expect(state.autoGen.images).toEqual([]);
      expect(state.autoGen.progress).toBe(0);
    });

    it('should add auto gen image', () => {
      let state = appReducer(initialAppState, { type: 'SET_AUTOGEN_START', payload: ['p1'] });
      state = appReducer(state, { type: 'SET_AUTOGEN_IMAGE', payload: 'image1' });
      
      expect(state.autoGen.images).toContain('image1');
    });

    it('should stop auto generation', () => {
      let state = appReducer(initialAppState, { type: 'SET_AUTOGEN_START', payload: ['p1'] });
      state = appReducer(state, { type: 'SET_AUTOGEN_IMAGE', payload: 'img' });
      state = appReducer(state, { type: 'SET_AUTOGEN_STOP' });
      
      expect(state.autoGen.isAutoGenerating).toBe(false);
      expect(state.autoGen.images).toEqual([]);
    });
  });

  describe('Social export state', () => {
    it('should open social export', () => {
      const state = appReducer(initialAppState, { type: 'SET_SOCIAL_EXPORT_OPEN', payload: true });
      expect(state.socialExport.isOpen).toBe(true);
    });

    it('should set social theme', () => {
      const state = appReducer(initialAppState, { type: 'SET_SOCIAL_THEME', payload: 'light' });
      expect(state.socialExport.theme).toBe('light');
    });

    it('should set social accent color', () => {
      const state = appReducer(initialAppState, { type: 'SET_SOCIAL_ACCENT_COLOR', payload: '#ff0000' });
      expect(state.socialExport.accentColor).toBe('#ff0000');
    });

    it('should set social ratio', () => {
      const state = appReducer(initialAppState, { type: 'SET_SOCIAL_RATIO', payload: 'landscape' });
      expect(state.socialExport.ratio).toBe('landscape');
    });

    it('should set social author', () => {
      const state = appReducer(initialAppState, { type: 'SET_SOCIAL_AUTHOR', payload: '@username' });
      expect(state.socialExport.author).toBe('@username');
    });
  });

  describe('Building state', () => {
    it('should set view mode', () => {
      const state = appReducer(initialAppState, { type: 'SET_VIEW_MODE', payload: 'building' });
      expect(state.building.viewMode).toBe('building');
    });

    it('should set elevator floor', () => {
      const state = appReducer(initialAppState, { type: 'SET_ELEVATOR_FLOOR', payload: 3 });
      expect(state.building.activeElevatorFloor).toBe(3);
    });

    it('should set room customization', () => {
      const state = appReducer(initialAppState, {
        type: 'SET_ROOM_CUSTOMIZATION',
        payload: {
          roomId: 'buhardilla',
          data: { title: 'Custom Title', script: 'Custom Script' }
        }
      });
      expect(state.building.roomCustomizations.buhardilla).toEqual({
        title: 'Custom Title',
        script: 'Custom Script'
      });
    });

    it('should reset room customization', () => {
      let state = appReducer(initialAppState, {
        type: 'SET_ROOM_CUSTOMIZATION',
        payload: {
          roomId: 'buhardilla',
          data: { title: 'Custom' }
        }
      });
      state = appReducer(state, { type: 'RESET_ROOM_CUSTOMIZATION', payload: 'buhardilla' });
      expect(state.building.roomCustomizations.buhardilla).toBeUndefined();
    });

    it('should reset all room customizations', () => {
      let state = appReducer(initialAppState, {
        type: 'SET_ROOM_CUSTOMIZATION',
        payload: { roomId: 'room1', data: { title: 'A' } }
      });
      state = appReducer(state, {
        type: 'SET_ROOM_CUSTOMIZATION',
        payload: { roomId: 'room2', data: { title: 'B' } }
      });
      state = appReducer(state, { type: 'RESET_ALL_ROOM_CUSTOMIZATIONS' });
      expect(state.building.roomCustomizations).toEqual({});
    });
  });

  describe('Room lightbox state', () => {
    it('should open room lightbox', () => {
      const state = appReducer(initialAppState, { type: 'SET_ROOM_LIGHTBOX_OPEN', payload: true });
      expect(state.roomLightbox.isOpen).toBe(true);
    });

    it('should set room lightbox data', () => {
      const state = appReducer(initialAppState, {
        type: 'SET_ROOM_LIGHTBOX_DATA',
        payload: { title: 'New Title', script: 'New Script' }
      });
      expect(state.roomLightbox.title).toBe('New Title');
      expect(state.roomLightbox.script).toBe('New Script');
    });

    it('should reset room lightbox', () => {
      let state = appReducer(initialAppState, {
        type: 'SET_ROOM_LIGHTBOX_DATA',
        payload: { title: 'Title', script: 'Script', explanation: 'Exp', imageUrl: 'url', linkedPanelIndex: 2 }
      });
      state = appReducer(state, { type: 'RESET_ROOM_LIGHTBOX' });
      
      expect(state.roomLightbox.isOpen).toBe(false);
      expect(state.roomLightbox.title).toBe('');
      expect(state.roomLightbox.linkedPanelIndex).toBe(-1);
    });
  });

  describe('LOAD_STATE', () => {
    it('should load partial state', () => {
      const state = appReducer(initialAppState, {
        type: 'LOAD_STATE',
        payload: {
          panels: [{ title: 'Loaded', script: 'Script', explanation: 'Exp' }],
          scriptText: 'Loaded text'
        }
      });
      
      expect(state.panels).toHaveLength(1);
      expect(state.panels[0].title).toBe('Loaded');
      expect(state.scriptText).toBe('Loaded text');
    });
  });

  describe('Unknown action', () => {
    it('should return current state for unknown action', () => {
      const state = appReducer(initialAppState, { type: 'SET_PANELS', payload: [] });
      // @ts-ignore - testing with invalid action
      const newState = appReducer(state, { type: 'UNKNOWN_ACTION' });
      expect(newState).toEqual(state);
    });
  });
});
