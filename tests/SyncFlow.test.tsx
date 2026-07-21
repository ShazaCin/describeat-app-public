import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SyncFlow from '../components/sync/SyncFlow';
import useStore from '../hooks/useStore';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Title, ClosestMatch } from '../types';

// Mock the store
vi.mock('../hooks/useStore');

const mockUseStore = useStore as unknown as any;

describe('SyncFlow Component Type Integration', () => {
  const mockTitle: Title = {
    titleId: 'test-title-1',
    title: 'Ghostbusters',
    type: 'movie',
    synopsis: 'Bustin makes me feel good',
    year: 1984,
    categories: ['Comedy'],
    images: { poster: 'ghostbusters.jpg' }
  };

  const mockMatch: ClosestMatch = {
    song_id: 1,
    song_name: 'test-title-1',
    input_total_hashes: 100,
    fingerprinted_hashes_in_db: 1000,
    hashes_matched_in_input: 90,
    input_confidence: 0.9,
    confidence: 0.9,
    fingerprinted_confidence: 0,
    offset: 100,
    offset_seconds: 100.5,
    file_sha1: 'sha',
    confidencePercent: 90
  };

  beforeEach(() => {
    mockUseStore.mockReturnValue({
      syncState: 'idle',
      titles: [mockTitle],
      closestMatches: [],
      matchResult: null,
      setProgress: vi.fn(),
      setSyncState: vi.fn(),
      cancelSync: vi.fn(),
      requestPermissionAndRecord: vi.fn(),
      selectSuggestion: vi.fn(),
    });
  });

  it('renders suggestions correctly when syncState is suggestions', () => {
    mockUseStore.mockReturnValue({
      ...mockUseStore(),
      syncState: 'suggestions',
      closestMatches: [mockMatch],
    });

    render(
      <BrowserRouter>
        <SyncFlow />
      </BrowserRouter>
    );

    expect(screen.getByText('Ghostbusters')).toBeDefined();
    expect(screen.getByText('90% Match')).toBeDefined();
  });

  it('navigates to title details when a suggestion is clicked', () => {
    const selectSuggestion = vi.fn();
    mockUseStore.mockReturnValue({
      ...mockUseStore(),
      syncState: 'suggestions',
      closestMatches: [mockMatch],
      selectSuggestion,
    });

    render(
      <BrowserRouter>
        <SyncFlow />
      </BrowserRouter>
    );

    const suggestionCard = screen.getByRole('button', { name: /ghostbusters/i });
    fireEvent.click(suggestionCard);

    expect(selectSuggestion).toHaveBeenCalledWith(
        expect.objectContaining({ song_name: 'test-title-1' }),
        expect.objectContaining({ titleId: 'test-title-1' })
    );
  });
});
