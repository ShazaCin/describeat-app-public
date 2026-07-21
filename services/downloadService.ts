import db, { initDB } from './db';
import { AdTrack } from '../types';

export interface DownloadStatus {
  trackId: string;
  progress: number;
  isDownloading: boolean;
  error?: string;
}

// Download a track and save to Dexie
export const downloadTrack = async (
  track: AdTrack,
  onProgress: (progress: number) => void,
  onError?: (message: string) => void
): Promise<void> => {
  try {
    // Ensure DB is open
    await initDB();

    // Check if already downloaded to prevent redundant caching
    const alreadyDownloaded = await isTrackDownloaded(track.trackId);
    if (alreadyDownloaded) {
      console.log(`Track ${track.trackId} already downloaded, skipping.`);
      onProgress(1);
      return;
    }

    // 1. Get URL
    const url = track.url;

    // 2. Fetch with explicit no-cache to avoid stale responses
    let response: Response;
    try {
      response = await fetch(url, { cache: 'no-store' });
    } catch (fetchErr: any) {
      const msg = `Network error fetching ${url}: ${fetchErr?.message || fetchErr}`;
      console.error('[Download] Fetch failed:', msg);
      onError?.(msg);
      throw fetchErr;
    }
    if (!response.ok) {
      const msg = `HTTP ${response.status} ${response.statusText} for ${url}`;
      console.error('[Download] Bad response:', msg);
      onError?.(msg);
      throw new Error(msg);
    }
    if (!response.body) {
      // Some browsers / CORS configs return a null body even on 200.
      const msg = `Response body is null (CORS may not be exposing body for ${url})`;
      console.error('[Download] No body:', msg);
      onError?.(msg);
      throw new Error(msg);
    }

    const contentLength = response.headers.get('content-length');
    const total = parseInt(contentLength || '0', 10);
    let loaded = 0;

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      if (total) {
        onProgress(loaded / total);
      }
    }

    const blob = new Blob(chunks, { type: response.headers.get('content-type') || 'audio/mpeg' });

        // 3. Save to DB
        try {
          await db.offline_tracks.put({
            trackId: track.trackId,
            titleId: track.titleId,
            blob: blob,
            timestamp: Date.now()
          });
        } catch (dbErr: any) {
          // Most likely cause on iOS Safari: storage quota exceeded (~1GB total
          // for IndexedDB + localStorage + service worker caches combined).
          // Distinguish quota errors from other DB failures so the user knows
          // whether they need to delete downloads or there's a real bug.
          const isQuota = dbErr?.name === 'QuotaExceededError'
            || dbErr?.message?.includes('quota')
            || dbErr?.code === 22;
          const msg = isQuota
            ? `Storage quota exceeded — delete some downloaded tracks first (iOS Safari limits web storage to ~1GB)`
            : `Database write failed: ${dbErr?.message || dbErr}`;
          console.error('[Download] DB write failed:', msg, dbErr);
          onError?.(msg);
          throw dbErr;
        }

        onProgress(1); // Complete
      } catch (error) {
        console.error(`Download failed for ${track.trackId}:`, error);
        throw error;
      }
    };

// Remove a track from offline storage
export const removeDownloadedTrack = async (trackId: string): Promise<void> => {
  await initDB();
  await db.offline_tracks.delete(trackId);
};

// Check if a track is downloaded
export const isTrackDownloaded = async (trackId: string): Promise<boolean> => {
  await initDB();
  const count = await db.offline_tracks.where('trackId').equals(trackId).count();
  return count > 0;
};

// Get the blob URL for playback
export const getOfflineTrackUrl = async (trackId: string): Promise<string | null> => {
  await initDB();
  const item = await db.offline_tracks.get(trackId);
  if (item && item.blob) {
    return URL.createObjectURL(item.blob);
  }
  return null;
};
