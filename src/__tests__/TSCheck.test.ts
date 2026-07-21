import { describe, it, expect, vi } from 'vitest';
import useStore from '../../hooks/useStore';
import { AppState, T2SSyncSession } from '../../types';

// Mocking some external services to allow store to be tested in isolation
vi.mock('../../services/db', () => ({
  initDB: vi.fn(),
  getAllTitles: vi.fn(),
  getPlaybackHistory: vi.fn(),
  getAllOfflineTrackIds: vi.fn(),
  getAllAdTracks: vi.fn(),
  saveTitles: vi.fn(),
  saveAdTracks: vi.fn(),
  upsertPlaybackHistory: vi.fn(),
  deletePlaybackHistoryEntry: vi.fn(),
}));

vi.mock('../../services/audioService', () => ({
  startAudioRecording: vi.fn(),
  stopAudioRecording: vi.fn(),
}));

vi.mock('../../services/t2sService', () => ({
  findMatch: vi.fn(),
}));

describe('useStore Type and Logic Check', () => {
  it('should initialize with correct default state', () => {
    const state = useStore.getState();
    
    // Check required AppState properties exist
    expect(state.titles).toBeInstanceOf(Array);
    expect(state.adTracks).toBeInstanceOf(Array);
    expect(state.loading).toBe(true);
    expect(state.isPlaying).toBe(false);
    expect(state.activeMediaType).toBe('movie');
    expect(state.syncState).toBe('idle');
  });

  it('should handle "all" media type', () => {
    const { setActiveMediaType } = useStore.getState();
    setActiveMediaType('all');
    expect(useStore.getState().activeMediaType).toBe('all');
  });

  it('should correctly handle sync session state structure', () => {
    const syncSession: T2SSyncSession = {
        recordingStart: 1000,
        recordingEnd: 2000,
        apiOffsetTime: 5.5,
        titleIdFound: 'test-title',
        isActive: true,
    };
    
    // This is a compile-time check primarily, 
    // but ensures we haven't broken the interface in useStore.ts
    const state = useStore.getState();
    // Note: In real use, we'd use set({ syncSession }) in an action, 
    // but here we just verify the type is assignable
    const testSession: T2SSyncSession | null = state.syncSession;
    expect(testSession).toBeNull(); // Default is null
  });
});
