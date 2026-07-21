import Dexie, { type Table } from 'dexie';
import { Title, AdTrack, PlaybackHistoryEntry } from '../types';

// Initialize Dexie without subclassing to avoid potential TypeScript module resolution issues.
// We cast the instance to define the table properties for type safety.
const db = new Dexie('describeATDB') as Dexie & {
  titles: Table<Title, string>;
  adTracks: Table<AdTrack, string>;
  playbackHistory: Table<PlaybackHistoryEntry, string>;
  offline_tracks: Table<{ trackId: string, titleId: string, blob: Blob, timestamp: number }, string>;
};

// Define database schema versions. Dexie requires redefining all tables for each version.
db.version(1).stores({
  titles: 'titleId, title, type, *categories, *genre, year',
  adTracks: 'trackId, titleId',
});
db.version(4).stores({
  titles: 'titleId, title, type, *categories, *genre, year, parentId',
  adTracks: 'trackId, titleId',
  playbackHistory: 'titleId, lastPlayed',
  offline_tracks: 'trackId, titleId',
});
db.version(5).stores({
  titles: 'titleId, title, type, *categories, *genre, year, parentId',
  adTracks: 'trackId, titleId',
  playbackHistory: 'trackId, titleId, lastPlayed',
  offline_tracks: 'trackId, titleId',
});

export const initDB = async () => {
  await db.open();
};

export const getAllTitles = () => db.titles.toArray();
export const getTitleById = (titleId: string) => db.titles.get(titleId);
export const getTitlesByParentId = (parentId: string) => db.titles.where('parentId').equals(parentId).toArray();
export const bulkPutTitles = (titles: Title[]) => db.titles.bulkPut(titles);
export const saveTitles = bulkPutTitles;

export const getAllAdTracks = () => db.adTracks.toArray();
export const getTracksByTitleId = (titleId: string) => db.adTracks.where('titleId').equals(titleId).toArray();
export const bulkPutAdTracks = (adTracks: AdTrack[]) => db.adTracks.bulkPut(adTracks);
export const saveAdTracks = bulkPutAdTracks;

export const getPlaybackHistory = () => db.playbackHistory.orderBy('lastPlayed').reverse().toArray();
export const upsertPlaybackHistory = (entry: PlaybackHistoryEntry) => db.playbackHistory.put(entry);
export const deletePlaybackHistoryEntry = (titleId: string) => db.playbackHistory.where('titleId').equals(titleId).delete();

export const getAllOfflineTrackIds = () => db.offline_tracks.toCollection().primaryKeys();


export default db;
