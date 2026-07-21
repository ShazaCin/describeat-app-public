export interface PlaybackHistoryEntry {
  titleId: string;
  trackId: string;
  progress: number; // 0 to 1
  lastPlayed: number; // timestamp
}

export type TitleType = 'movie' | 'book' | 'tour' | 'tv-show' | 'podcast' | 'series' | 'episode' | 'chapter';

export interface Title {
  titleId: string;
  title: string;
  type: TitleType;
  synopsis: string;
  year: number;
  runtimeMinutes?: number;
  rated?: string;
  score?: number;
  actors?: string[];
  directors?: string[];
  writers?: string[];
  genre?: string[];
  categories: string[];
  images: {
    poster?: string;
    backdrop?: string;
  };
  parentId?: string;
  season?: number;
  episode?: number;
  chapter?: number;
}

export interface AdTrack {
  trackId: string;
  titleId: string;
  name: string;
  narrator?: string;
  narratedLanguage: string;
  url: string;
  trackPosition?: number;
  magic_adjust?: number; // Fine-tunes sync offset (seconds) per-track
}

export interface T2SSyncSession {
  recordingStart: number;       // Date.now() when recording began — THE ANCHOR
  recordingEnd: number;         // Date.now() when recording stopped
  apiOffsetTime: number;        // offset_seconds from the T2S backend
  titleIdFound: string | null;  // titleId of the matched title
  isActive: boolean;            // true while user is in sync-playback mode
}

export interface ClosestMatch {
  song_id: number;
  song_name: string;            // titleId
  input_total_hashes: number;
  fingerprinted_hashes_in_db: number;
  hashes_matched_in_input: number;
  input_confidence: number;
  confidence: number;           // Alias for input_confidence used in some logic
  fingerprinted_confidence: number;
  offset: number;
  offset_seconds: number;
  file_sha1: string | null;
  confidencePercent?: number;   // Calculated field for UI
}

export interface Category {
  id: string;
  name: string;
  titles: Title[];
}

export interface QueuedItem {
  queueItemId: string;
  title: Title;
  track: AdTrack;
}

export type SyncState = 'idle' | 'permission' | 'recording' | 'matching' | 'results' | 'suggestions' | 'denied';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  icon?: string;
  data?: any;
  timestamp: number;
  read: boolean;
}

export interface AppState {
  // Data
  titles: Title[];
  adTracks: AdTrack[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  playbackHistory: PlaybackHistoryEntry[];
  recentSearches: string[];
  downloadedTrackIds: string[];
  downloadingTracks: Record<string, number>; // trackId -> progress (0-1)
  notifications: NotificationItem[];

  // UI State
  isMenuOpen: boolean;
  isSearchOpen: boolean;
  isPlayerExpanded: boolean;
  isSyncing: boolean;
  isFeedbackOpen: boolean;
  isPreferencesOpen: boolean;
  isQueueOpen: boolean;
  isOptionsOpen: boolean;
  announcement: string | null;
  viewMode: 'grid' | 'list';
  activeMediaType: TitleType | 'all';
  homeScrollPosition: number;
  isOffline: boolean;
  menuViewState: 'menu' | 'notifications';

  // Playback State
  nowPlaying: { title: Title; track: AdTrack } | null;
  isPlaying: boolean;
  isMuted: boolean;
  playbackProgress: number; // 0 to 1
  playbackSpeed: number; // e.g., 1, 1.25, 1.5
  lastSeekRequest: { time: number; amount: number } | null;
  lastAbsoluteSeekRequest: { time: number; progress: number } | null;
  sleepTimer: { id: number | null; endTime: number | null; duration: number | null };
  queue: QueuedItem[];
  playedQueue: QueuedItem[];

  // Sync Flow State
  syncState: SyncState;
  matchResult: Title | null;
  matchOffset: number | null;
  syncSession: T2SSyncSession | null;
  closestMatches: ClosestMatch[];
  confidenceCheckValue: number;

  // Actions
  fetchInitialData: () => Promise<void>;
  updatePlaybackHistory: (entry: Omit<PlaybackHistoryEntry, 'lastPlayed'>) => Promise<void>;
  removePlaybackHistory: (titleId: string) => Promise<void>;
  addRecentSearch: (term: string) => void;
  fetchTracksByTitleId: (titleId: string) => Promise<AdTrack[]>;

  openMenu: () => void;
  closeMenu: () => void;
  openNotifications: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openPlayer: () => void;
  closePlayer: () => void;
  openFeedback: () => void;
  closeFeedback: () => void;
  openPreferences: () => void;
  closePreferences: () => void;
  setAnnouncement: (message: string | null) => void;
  toggleViewMode: () => void;
  setActiveMediaType: (type: TitleType | 'all') => void;
  setHomeScrollPosition: (position: number) => void;
  openQueue: () => void;
  closeQueue: () => void;
  openOptions: () => void;
  closeOptions: () => void;
  setIsOffline: (isOffline: boolean) => void;

  playTrack: (title: Title, track: AdTrack, startTime?: number) => void;
  stopTrack: () => void;
  togglePlayPause: () => void;
  toggleMute: () => void;
  setPlaybackProgress: (progress: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setSleepTimer: (minutes: number | null) => void;
  seekBy: (seconds: number) => void;
  seekTo: (progress: number) => void;

  // Queue Actions
  addToQueue: (title: Title, track: AdTrack) => void;
  removeFromQueue: (queueItemId: string) => void;
  playFromQueue: (queueItemId: string) => void;
  playFromHistory: (queueItemId: string) => void;
  playNext: () => void;
  playPrevious: () => void;
  clearQueue: () => void;

  startSync: () => void;
  requestPermissionAndRecord: () => Promise<void>;
  cancelSync: () => void;
  setSyncState: (state: SyncState) => void;
  setMatchResult: (title: Title | null) => void;
  selectSuggestion: (match: ClosestMatch, title: Title) => void;
  clearSyncSession: () => void;

  // Download Actions
  downloadTrack: (track: AdTrack) => Promise<void>;
  removeDownloadedTrack: (trackId: string) => Promise<void>;
  removeAllDownloadedTracks: () => Promise<void>;

  // Notification Actions
  addNotification: (notification: Omit<NotificationItem, 'id' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}