import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, Title, AdTrack, Category, PlaybackHistoryEntry, QueuedItem, TitleType, SyncState } from '../types';
import { generateClient } from 'aws-amplify/api';
import { listShazacinMetadataTitles, listShazacinMetadataAdTracks } from '../src/graphql/queries';
import * as db from '../services/db';
import * as audioService from '../services/audioService';
import { resolveS3Url } from '../services/storageService';
import * as downloadService from '../services/downloadService';
import * as t2sService from '../services/t2sService';

// Helper to create categories from a flat list of titles
const groupTitlesIntoCategories = (titles: Title[]): Category[] => {
    const categoryMap: { [key: string]: Title[] } = {};
    const titleCategoryCounts: { [titleId: string]: number } = {};

    // First pass: Build maps and counts
    titles.forEach(title => {
        (title.categories || []).forEach(catName => {
            if (!categoryMap[catName]) categoryMap[catName] = [];
            categoryMap[catName].push(title);
            titleCategoryCounts[title.titleId] = (titleCategoryCounts[title.titleId] || 0) + 1;
        });
    });

    // Second pass: Filter and refine
    return Object.entries(categoryMap)
        .map(([name, categoryTitles]) => {
            // Sort titles within category (e.g. by year descending)
            const sortedTitles = [...categoryTitles].sort((a, b) => (b.year || 0) - (a.year || 0));
            return {
                id: name.toLowerCase().replace(/\s+/g, '-'),
                name,
                titles: sortedTitles,
            };
        })
        .filter(cat => {
            // Rule 1: Always keep large categories
            if (cat.titles.length >= 3) return true;

            // Rule 2: If a category is small (1 or 2 items), check if they are "redundant"
            // (i.e. if these titles already appear in other categories)
            const redundantCount = cat.titles.filter(t => titleCategoryCounts[t.titleId] > 1).length;

            // If ALL titles in a small category are available elsewhere, hide this "lonely" category
            if (cat.titles.length <= 1 && redundantCount === cat.titles.length) {
                return false;
            }

            // Otherwise keep it
            return true;
        })
        .sort((a, b) => {
            // Rule: "Featured" always comes first
            const isAFeatured = a.name.toLowerCase().includes('featured');
            const isBFeatured = b.name.toLowerCase().includes('featured');
            if (isAFeatured && !isBFeatured) return -1;
            if (!isAFeatured && isBFeatured) return 1;

            // Otherwise sort by title count descending
            return b.titles.length - a.titles.length;
        });
};

// Module-level variable to tracked active fetch promise and prevent redundant calls
let fetchInitialDataPromise: Promise<void> | null = null;
const trackFetchPromises = new Map<string, Promise<AdTrack[]>>();

const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Data
            titles: [],
            adTracks: [],
            categories: [],
            loading: true,
            error: null,
            playbackHistory: [],
            recentSearches: ['Kandasamys', 'Beyond the River'],
            downloadedTrackIds: [],
            downloadingTracks: {},
            notifications: [],

            // UI State
            isMenuOpen: false,
            isSearchOpen: false,
            isPlayerExpanded: false,
            isSyncing: false,
            isFeedbackOpen: false,
            isPreferencesOpen: false,
            isQueueOpen: false,
            isOptionsOpen: false,
            announcement: null,
            viewMode: 'grid',
            activeMediaType: 'movie',
            homeScrollPosition: 0,
            isOffline: !navigator.onLine,
            menuViewState: 'menu',
            useSimplifiedLayout: false,

            // Playback State
            nowPlaying: null,
            isPlaying: false,
            playbackProgress: 0,
            playbackSpeed: 1,
            lastSeekRequest: null,
            lastAbsoluteSeekRequest: null,
            sleepTimer: { id: null, endTime: null, duration: null },
            queue: [],
            playedQueue: [],

            // Sync Flow State
            syncState: 'idle',
            matchResult: null,
            matchOffset: null,
            syncSession: null,
            closestMatches: [],
            confidenceCheckValue: 0,
            isMuted: false,

            // Actions
            fetchInitialData: async () => {
                // Return existing promise if a fetch is already in progress
                if (fetchInitialDataPromise) return fetchInitialDataPromise;

                fetchInitialDataPromise = (async () => {
                    set({ error: null });
                    // Ensure loading is true initially (matching default state but good for clarity)
                    set({ loading: true });

                    try {
                        await db.initDB();

                        // 1. Try to load from DB first for immediate UI responsiveness
                        const [dbTitles, dbHistory, offlineIds, dbTracks] = await Promise.all([
                            db.getAllTitles(),
                            db.getPlaybackHistory(),
                            db.getAllOfflineTrackIds(),
                            db.getAllAdTracks(),
                        ]);

                        if (dbTitles.length > 0 || dbTracks.length > 0) {
                            set({
                                titles: dbTitles,
                                adTracks: dbTracks,
                                categories: groupTitlesIntoCategories(dbTitles),
                                playbackHistory: dbHistory,
                                downloadedTrackIds: offlineIds,
                                loading: false, // Turn off loading now so user sees cached data
                            });
                            console.log('Data loaded from DB, starting background sync...');
                        }

                        // 2. Fetch from network to ensure data is up-to-date
                        const client = generateClient();

                        // Fetch Titles
                        const titleResult = await client.graphql({
                            query: listShazacinMetadataTitles,
                            variables: { limit: 1000 }
                        }) as any;

                        const rawTitles = titleResult.data.listShazacinMetadataTitles.items;
                        const networkTitles: Title[] = rawTitles.map((t: any) => {
                            let poster = '/assets/logo.svg';
                            let backdrop = '/assets/logo.svg';

                            let images = t.images;
                            if (typeof images === 'string') {
                                try { images = JSON.parse(images); } catch (e) { images = [images]; }
                            }

                            if (Array.isArray(images) && images.length > 0) {
                                poster = resolveS3Url(images[0]) || poster;
                                backdrop = resolveS3Url(images[1]) || resolveS3Url(images[0]) || backdrop;
                            }

                            return {
                                titleId: t.titleId,
                                title: t.title,
                                synopsis: t.synopsis || '',
                                images: { poster, backdrop },
                                genre: t.genre ? (Array.isArray(t.genre) ? t.genre : [t.genre]) : [],
                                categories: t.categories || [],
                                directors: t.directors || [],
                                writers: t.writers || [],
                                type: t.type as TitleType,
                                year: t.year,
                                runtimeMinutes: t.runtimeMinutes,
                                rated: t.rated,
                                score: t.score,
                                parentId: t.parentId,
                                season: t.season,
                                episode: t.episode,
                                chapter: t.chapter,
                            } as Title;
                        });

                        // 3. Update state and sync back to DB
                        set({
                            titles: networkTitles,
                            categories: groupTitlesIntoCategories(networkTitles),
                            loading: false,
                        });

                        // Sync to IndexedDB (asynchronous background task)
                        db.saveTitles(networkTitles).catch(e => console.error("Failed to sync titles to DB:", e));

                        console.log('Sync complete.');
                    } catch (e: any) {
                        console.error("Failed to fetch initial data:", e);
                        // Only show error screen if we have absolutely no data (not even from DB)
                        if (get().titles.length === 0) {
                            set({
                                loading: false,
                                error: "Failed to load data. Please check your connection."
                            });
} else {
                            // If we have DB data, just clear loading state
                            // TODO: Show a 'showing cached data' banner when offline data is stale
                            set({ loading: false });
                        }
                    } finally {
                        // Reset the promise after completion so future calls can re-sync if needed
                        fetchInitialDataPromise = null;
                    }
                })();

                return fetchInitialDataPromise;
            },
            fetchTracksByTitleId: async (titleId: string) => {
                const existingPromise = trackFetchPromises.get(titleId);
                if (existingPromise) return existingPromise;

                const fetchPromise = (async () => {
                    try {
                        const client = generateClient();
                        const filter = {
                            titleId: { eq: titleId },
                            publicEnabled: { eq: 1 }
                        };

                        let allRawTracks: any[] = [];
                        let nextToken: string | null = null;
                        let pageCount = 0;

                        do {
                            const result = await client.graphql({
                                query: listShazacinMetadataAdTracks,
                                variables: { filter, limit: 100, nextToken }
                            }) as any;

                            const data = result.data.listShazacinMetadataAdTracks;
                            allRawTracks = [...allRawTracks, ...(data.items || [])];
                            nextToken = data.nextToken;
                            pageCount++;

                            // Safety limit to prevent infinite loops (though unlikely with sane limit/data)
                            if (pageCount > 20) break;
                        } while (nextToken);

                        const networkTracks: AdTrack[] = allRawTracks.map((t: any) => {
                            const url = `${import.meta.env.VITE_CDN_DOMAIN || 'https://your-cdn-domain.com'}/adtracks/${t.titleId}/${t.trackId}.mp3`;
                            return {
                                trackId: t.trackId,
                                titleId: t.titleId,
                                name: t.name,
                                narrator: t.narrator,
                                narratedLanguage: t.narratedLanguage || 'English',
                                url: url,
                                trackPosition: t.trackPosition,
                                magic_adjust: t.magic_adjust || 0,
                            };
                        });

                        // Update state - merge with existing tracks but prioritize network results for this title
                        set(state => ({
                            adTracks: [
                                ...state.adTracks.filter(at => at.titleId !== titleId),
                                ...networkTracks
                            ]
                        }));

                        // Persist to DB
                        if (networkTracks.length > 0) {
                            await db.saveAdTracks(networkTracks);
                        }

                        return networkTracks;
                    } catch (error) {
                        console.error("Failed to fetch tracks for title", titleId, error);
                        // Fallback to DB if network fails
                        return db.getTracksByTitleId(titleId);
                    } finally {
                        trackFetchPromises.delete(titleId);
                    }
                })();

                trackFetchPromises.set(titleId, fetchPromise);
                return fetchPromise;
            },
            updatePlaybackHistory: async (entry) => {
                const newEntry: PlaybackHistoryEntry = { ...entry, lastPlayed: Date.now() };
                await db.upsertPlaybackHistory(newEntry);
                set(state => ({
                    playbackHistory: [
                        newEntry,
                        ...state.playbackHistory.filter(h => h.trackId !== entry.trackId),
                    ],
                }));
            },
            removePlaybackHistory: async (titleId) => {
                await db.deletePlaybackHistoryEntry(titleId);
                set(state => ({
                    playbackHistory: state.playbackHistory.filter(h => h.titleId !== titleId),
                }));
            },
            addRecentSearch: (term) => {
                set(state => ({
                    recentSearches: [
                        term,
                        ...state.recentSearches.filter(t => t.toLowerCase() !== term.toLowerCase())
                    ].slice(0, 10),
                }));
            },

            openMenu: () => set({ isMenuOpen: true, menuViewState: 'menu' }),
            closeMenu: () => set({ isMenuOpen: false }),
            openNotifications: () => set({ isMenuOpen: true, menuViewState: 'notifications' }),
            openSearch: () => set({ isSearchOpen: true }),
            closeSearch: () => set({ isSearchOpen: false }),
            openPlayer: () => set({ isPlayerExpanded: true }),
            closePlayer: () => set({ isPlayerExpanded: false }),
            openFeedback: () => set({ isFeedbackOpen: true }),
            closeFeedback: () => set({ isFeedbackOpen: false }),
            openPreferences: () => set({ isPreferencesOpen: true }),
            closePreferences: () => set({ isPreferencesOpen: false }),
            setAnnouncement: (message) => set({ announcement: message }),
            toggleSimplifiedLayout: () => set(state => ({ useSimplifiedLayout: !state.useSimplifiedLayout })),
            setActiveMediaType: (type) => set({ activeMediaType: type }),
            setHomeScrollPosition: (position) => set({ homeScrollPosition: position }),
            openQueue: () => set({ isQueueOpen: true }),
            closeQueue: () => set({ isQueueOpen: false }),
            openOptions: () => set({ isOptionsOpen: true }),
            closeOptions: () => set({ isOptionsOpen: false }),
            setIsOffline: (isOffline) => set({ isOffline }),

            playTrack: (title, track, startTime) => {
                const { syncSession } = get();
                let effectiveStartTime = startTime;

                // Sync Mode: calculate correct start position if sync is active for this title
                if (syncSession?.isActive && syncSession.titleIdFound === title.titleId && effectiveStartTime === undefined) {
                    const elapsedSinceRecording = (Date.now() - syncSession.recordingStart) / 1000;
                    effectiveStartTime = syncSession.apiOffsetTime + elapsedSinceRecording + (track.magic_adjust || 0);
                    console.log(`[SYNC] Calculated start position: ${effectiveStartTime.toFixed(2)}s`);
                }

                const history = get().playbackHistory.find(h => h.trackId === track.trackId);
                let progress = 0;

                if (effectiveStartTime !== undefined && effectiveStartTime !== null) {
                    set({ lastSeekRequest: { time: Date.now(), amount: effectiveStartTime } });
                } else if (history && history.progress < 0.98) {
                    progress = history.progress;
                }

                set(state => {
                    const newPlayedQueue = [...state.playedQueue];
                    if (state.nowPlaying) {
                        newPlayedQueue.unshift({
                            queueItemId: `${Date.now()}-${state.nowPlaying.track.trackId}`,
                            title: state.nowPlaying.title,
                            track: state.nowPlaying.track
                        });
                    }

                    return {
                        nowPlaying: { title, track },
                        isPlaying: true,
                        isPlayerExpanded: true,
                        playbackProgress: progress,
                        queue: [], // Start a new session
                        playedQueue: newPlayedQueue.slice(0, 50),
                    }
                });
                get().setAnnouncement(`Now playing: ${track.name}`);
            },
            stopTrack: () => {
                get().clearSyncSession();
                const stoppedTrack = get().nowPlaying;
                set(state => {
                    const newPlayedQueue = [...state.playedQueue];
                    if (state.nowPlaying) {
                        newPlayedQueue.unshift({
                            queueItemId: `${Date.now()}-${state.nowPlaying.track.trackId}`,
                            title: state.nowPlaying.title,
                            track: state.nowPlaying.track
                        });
                    }
                    return {
                        nowPlaying: null,
                        isPlaying: false,
                        playbackProgress: 0,
                        playedQueue: newPlayedQueue.slice(0, 50)
                    };
                });
                if (stoppedTrack) {
                    get().setAnnouncement(`Playback stopped for ${stoppedTrack.track.name}.`);
                }
            },
            togglePlayPause: () => {
                const { syncSession, nowPlaying } = get();
                // If sync is active, we don't pause/play, we mute/unmute
                if (syncSession?.isActive && syncSession.titleIdFound === nowPlaying?.title.titleId) {
                    get().toggleMute();
                    return;
                }

                const currentNowPlaying = get().nowPlaying;
                const wasPlaying = get().isPlaying;
                set(state => ({ isPlaying: !state.isPlaying }));
                if (currentNowPlaying) {
                    get().setAnnouncement(wasPlaying ? `Playback paused: ${currentNowPlaying.track.name}` : `Resumed: ${currentNowPlaying.track.name}`);
                } else {
                    get().setAnnouncement(wasPlaying ? 'Playback paused' : 'Playback resumed');
                }
            },
            toggleMute: () => {
                const newMuted = !get().isMuted;
                set({ isMuted: newMuted });
                get().setAnnouncement(newMuted ? 'Muted' : 'Unmuted');
            },
            setPlaybackProgress: (progress) => set({ playbackProgress: progress }),
            setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
            setSleepTimer: (minutes) => {
                const currentTimer = get().sleepTimer.id;
                if (currentTimer) {
                    clearTimeout(currentTimer);
                }
                if (minutes === null) {
                    set({ sleepTimer: { id: null, endTime: null, duration: null } });
                    return;
                }
                const endTime = Date.now() + minutes * 60 * 1000;
                const timerId = window.setTimeout(() => {
                    const { isPlaying, togglePlayPause } = get();
                    if (isPlaying) {
                        togglePlayPause();
                    }
                    set({ sleepTimer: { id: null, endTime: null, duration: null } });
                }, minutes * 60 * 1000);
                set({ sleepTimer: { id: timerId, endTime, duration: minutes } });
            },
            seekBy: (seconds) => set({ lastSeekRequest: { time: Date.now(), amount: seconds } }),
            seekTo: (progress) => set({ lastAbsoluteSeekRequest: { time: Date.now(), progress } }),

            addToQueue: (title, track) => {
                const { nowPlaying, queue } = get();

                // Deduplication: Check if it's already playing
                if (nowPlaying?.track.trackId === track.trackId) {
                    get().setAnnouncement(`${track.name} is already playing.`);
                    return;
                }

                // If in queue, move to front
                const existingIndex = queue.findIndex(item => item.track.trackId === track.trackId);
                if (existingIndex !== -1) {
                    const existingItem = queue[existingIndex];
                    set(state => ({
                        queue: [existingItem, ...state.queue.filter((_, i) => i !== existingIndex)]
                    }));
                    get().setAnnouncement(`${track.name} moved to front of playlist.`);
                    return;
                }

                const newItem: QueuedItem = { queueItemId: `${Date.now()}-${track.trackId}`, title, track };

                if (!nowPlaying) {
                    // Player is closed. Prime it with the new track, but don't play.
                    const history = get().playbackHistory.find(h => h.trackId === track.trackId);
                    const progress = (history && history.progress < 0.98) ? history.progress : 0;

                    set({
                        nowPlaying: { title, track },
                        isPlaying: false,
                        isPlayerExpanded: false, // Ensure mini player is shown
                        playbackProgress: progress,
                    });
                    get().setAnnouncement(`${track.name} is ready to play.`);
                } else {
                    // Player is already open. Just add to the queue.
                    set(state => ({ queue: [...state.queue, newItem] }));
                    get().setAnnouncement(`${track.name} added to queue.`);
                }
            },
            removeFromQueue: (queueItemId) => set(state => ({
                queue: state.queue.filter(item => item.queueItemId !== queueItemId),
                playedQueue: state.playedQueue.filter(item => item.queueItemId !== queueItemId)
            })),
            playFromQueue: (queueItemId) => {
                const { queue } = get();
                const itemToPlayIndex = queue.findIndex(item => item.queueItemId === queueItemId);

                if (itemToPlayIndex !== -1) {
                    const itemToPlay = itemToPlayIndex !== -1 ? queue[itemToPlayIndex] : null;
                    if (!itemToPlay) return;

                    const precedingItems = queue.slice(0, itemToPlayIndex);
                    const succeedingItems = queue.slice(itemToPlayIndex + 1);

                    set(state => {
                        const history = state.playbackHistory.find(h => h.trackId === itemToPlay.track.trackId);
                        const progress = (history && history.progress < 0.98) ? history.progress : 0;
                        const newPlayedQueue = [...state.playedQueue];
                        if (state.nowPlaying) {
                            newPlayedQueue.unshift({ queueItemId: `${Date.now()}-${state.nowPlaying.track.trackId}`, title: state.nowPlaying.title, track: state.nowPlaying.track });
                        }
                        newPlayedQueue.unshift(...precedingItems);

                        return {
                            playedQueue: newPlayedQueue.slice(0, 50),
                            queue: succeedingItems,
                            nowPlaying: { title: itemToPlay.title, track: itemToPlay.track },
                            isPlaying: true,
                            isPlayerExpanded: true,
                            playbackProgress: progress,
                        }
                    });
                    get().setAnnouncement(`Now playing: ${itemToPlay.track.name}`);
                }
            },
            playFromHistory: (queueItemId) => {
                const { playedQueue } = get();
                const itemToPlayIndex = playedQueue.findIndex(item => item.queueItemId === queueItemId);

                if (itemToPlayIndex === -1) return; // Item not found

                const itemToPlay = playedQueue[itemToPlayIndex];

                set(state => {
                    const history = state.playbackHistory.find(h => h.trackId === itemToPlay.track.trackId);
                    const progress = (history && history.progress < 0.98) ? history.progress : 0;

                    const newPlayedQueue = [...state.playedQueue];
                    newPlayedQueue.splice(itemToPlayIndex, 1);

                    if (state.nowPlaying) {
                        newPlayedQueue.unshift({
                            queueItemId: `${Date.now()}-${state.nowPlaying.track.trackId}`,
                            title: state.nowPlaying.title,
                            track: state.nowPlaying.track,
                        });
                    }

                    return {
                        nowPlaying: { title: itemToPlay.title, track: itemToPlay.track },
                        isPlaying: true,
                        isPlayerExpanded: true,
                        playbackProgress: progress,
                        playedQueue: newPlayedQueue.slice(0, 50),
                    };
                });
                get().setAnnouncement(`Now playing: ${itemToPlay.track.name}`);
            },
            playNext: () => {
                const { queue, nowPlaying } = get();
                const nextItem = queue[0];
                if (nextItem) {
                    set(state => {
                        const history = state.playbackHistory.find(h => h.trackId === nextItem.track.trackId);
                        const progress = (history && history.progress < 0.98) ? history.progress : 0;
                        const newPlayedQueue = [...state.playedQueue];
                        if (state.nowPlaying) {
                            newPlayedQueue.unshift({ queueItemId: `${Date.now()}-${state.nowPlaying.track.trackId}`, title: state.nowPlaying.title, track: state.nowPlaying.track });
                        }

                        return {
                            queue: state.queue.slice(1),
                            playedQueue: newPlayedQueue.slice(0, 50),
                            nowPlaying: { title: nextItem.title, track: nextItem.track },
                            isPlaying: true,
                            playbackProgress: progress,
                        };
                    });
                    get().setAnnouncement(`Now playing: ${nextItem.track.name}`);
                } else {
                    const currentTrack = nowPlaying;
                    if (currentTrack) {
                        set(state => ({
                            playedQueue: [{ queueItemId: `${Date.now()}-${currentTrack.track.trackId}`, title: currentTrack.title, track: currentTrack.track }, ...state.playedQueue].slice(0, 50),
                            nowPlaying: null,
                            isPlaying: false
                        }));
                        get().setAnnouncement(`Queue finished. Playback stopped.`);
                    }
                }
            },
            playPrevious: () => {
                const { playedQueue, nowPlaying } = get();
                const prevItem = playedQueue[0];
                if (prevItem) {
                    set(state => {
                        const history = state.playbackHistory.find(h => h.trackId === prevItem.track.trackId);
                        const progress = (history && history.progress < 0.98) ? history.progress : 0;
                        const newQueue = [...state.queue];
                        if (state.nowPlaying) {
                            newQueue.unshift({ queueItemId: `${Date.now()}-${state.nowPlaying.track.trackId}`, title: state.nowPlaying.title, track: state.nowPlaying.track });
                        }

                        return {
                            playedQueue: state.playedQueue.slice(1),
                            queue: newQueue,
                            nowPlaying: { title: prevItem.title, track: prevItem.track },
                            isPlaying: true,
                            playbackProgress: progress,
                        };
                    });
                    get().setAnnouncement(`Now playing: ${prevItem.track.name}`);
                }
            },
            clearQueue: () => set({ queue: [] }),

startSync: async () => {
                // Check connectivity first — don't waste user's time if offline
                if (!navigator.onLine) {
                    get().setAnnouncement("Sync requires an internet connection.");
                    set({ isSyncing: false });
                    return;
                }
                get().setAnnouncement("Starting sync...");
                set({ isSyncing: true, matchResult: null, matchOffset: null });
                try {
                    const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
                    if (permissionStatus.state === 'granted') {
                        // Permission already granted, proceed to recording
                        get().requestPermissionAndRecord();
                    } else if (permissionStatus.state === 'prompt') {
                        // Need to ask for permission. Show the pre-prompt UI.
                        set({ syncState: 'permission' });
                    } else { // 'denied'
                        // Permission was denied. Show an informative UI.
                        set({ syncState: 'denied' });
                    }
                } catch (error) {
                    console.error("Permission query API not supported, falling back:", error);
                    // Fallback for browsers that don't support permission query API
                    set({ syncState: 'permission' });
                }
            },

            requestPermissionAndRecord: async () => {
                try {
                    await audioService.startAudioRecording();
                    const recordingStart = Date.now();
                    set({ syncState: 'recording' });

                    // Record for 10 seconds (matching old app default)
                    setTimeout(async () => {
                        if (get().syncState !== 'recording') return; // User cancelled

                        const recordingEnd = Date.now();
                        set({ syncState: 'matching' });

                        try {
                            const blob = await audioService.stopAudioRecording();
                            const result = await t2sService.findMatch(blob);

                            console.log("T2S Result:", result);

                            if (result.status === 'SUCCESS' && typeof result.message === 'object' && 'match' in result.message && result.message.match) {
                                const match = result.message.match;
                                const titleId = match.song_name;
                                const matchedTitle = get().titles.find(t => t.titleId === titleId);

                                if (matchedTitle) {
                                    set({
                                        matchResult: matchedTitle,
                                        matchOffset: match.offset_seconds,
                                        syncSession: {
                                            recordingStart,
                                            recordingEnd,
                                            apiOffsetTime: match.offset_seconds,
                                            titleIdFound: titleId,
                                            isActive: true,
                                        },
                                        syncState: 'results',
                                        confidenceCheckValue: result.message.confidence_check_value || 0.85,
                                    });
                                } else {
                                    console.warn("Matched title not found in local store:", titleId);
                                    set({ syncState: 'idle', isSyncing: false });
                                    get().setAnnouncement("Match found but title details missing.");
                                }
                            } else if (typeof result.message === 'object' && 'closest_matches' in result.message && Array.isArray(result.message.closest_matches) && result.message.closest_matches.length > 0) {
                                const confidenceCheckValue = result.message.confidence_check_value || 0.85;
                                const closestMatchesWithHydration: ClosestMatch[] = result.message.closest_matches.map(m => {
                                    const confidence = m.confidence ?? m.input_confidence ?? 0.1;
                                    const confidencePercent = Math.min(100, Math.trunc((confidence / confidenceCheckValue) * 100));
                                    return { 
                                        ...m, 
                                        confidence, 
                                        confidencePercent,
                                        input_confidence: m.input_confidence ?? confidence,
                                    };
                                });

                                // Hydrate missing titles in background
                                closestMatchesWithHydration.forEach(async m => {
                                    const titleId = m.song_name;
                                    if (!get().titles.find(t => t.titleId === titleId)) {
                                        try {
                                          const title = await db.getTitleById(titleId);
                                          if (title) {
                                            set(state => ({ titles: [...state.titles, title] }));
                                          } else {
                                            // Optional: Fetch from Amplify if not in DB
                                          }
                                        } catch (e) {
                                          console.error("Hydration error for title", titleId, e);
                                        }
                                    }
                                });

                                // Partial matches - show suggestions
                                set({
                                    closestMatches: closestMatchesWithHydration,
                                    confidenceCheckValue,
                                    syncSession: {
                                        recordingStart,
                                        recordingEnd,
                                        apiOffsetTime: 0,
                                        titleIdFound: null,
                                        isActive: false,
                                    },
                                    syncState: 'suggestions',
                                });
                            } else {
                                // No match
                                set({ syncState: 'results', matchResult: null });
                            }
                        } catch (err) {
                            console.error("Matching process failed:", err);
                            set({ syncState: 'idle', isSyncing: false });
                            get().setAnnouncement("Error finding match.");
                        }
                    }, 10000); // 10 seconds recording
                } catch (error) {
                    console.error("Sync failed:", error);
                    set({ syncState: 'denied', isSyncing: true });
                }
            },
            selectSuggestion: (match, title) => {
                set(state => ({
                    matchResult: title,
                    matchOffset: match.offset_seconds,
                    syncSession: state.syncSession ? {
                        ...state.syncSession,
                        apiOffsetTime: match.offset_seconds,
                        titleIdFound: match.song_name,
                        isActive: true,
                    } : null,
                    syncState: 'idle',
                    isSyncing: false,
                    closestMatches: [],
                }));
            },
            clearSyncSession: () => set({
                syncSession: null,
                matchResult: null,
                matchOffset: null,
                closestMatches: [],
                confidenceCheckValue: 0
            }),

cancelSync: () => {
                audioService.stopAudioRecording();
                set({ isSyncing: false, syncState: 'idle', matchResult: null, matchOffset: null, syncSession: null, closestMatches: [] });
                get().setAnnouncement("Sync cancelled");
            },
            setSyncState: (state: SyncState) => set({ syncState: state }),
            setMatchResult: (title) => set({ matchResult: title }),

            downloadTrack: async (track: AdTrack) => {
                const { downloadedTrackIds, downloadingTracks } = get();
                if (downloadedTrackIds.includes(track.trackId) || downloadingTracks[track.trackId]) return;

                set(state => ({
                    downloadingTracks: { ...state.downloadingTracks, [track.trackId]: 0 }
                }));

                try {
                                    await downloadService.downloadTrack(track,
                                        (progress) => {
                                            set(state => ({
                                                downloadingTracks: { ...state.downloadingTracks, [track.trackId]: progress }
                                            }));
                                        },
                                        (errorMsg) => {
                                            get().setAnnouncement(`Download failed: ${errorMsg}`);
                                        }
                                    );

                    set(state => {
                        const newDownloading = { ...state.downloadingTracks };
                        delete newDownloading[track.trackId];
                        return {
                            downloadingTracks: newDownloading,
                            downloadedTrackIds: [...state.downloadedTrackIds, track.trackId]
                        };
                    });
                } catch (error) {
                    console.error("Download failed", error);
                    set(state => {
                        const newDownloading = { ...state.downloadingTracks };
                        delete newDownloading[track.trackId];
                        return { downloadingTracks: newDownloading };
                    });
                    get().setAnnouncement(`Failed to download ${track.name}`);
                }
            },

            removeDownloadedTrack: async (trackId: string) => {
                try {
                    await downloadService.removeDownloadedTrack(trackId);
                    set(state => ({
                        downloadedTrackIds: state.downloadedTrackIds.filter(id => id !== trackId)
                    }));
                } catch (error) {
                    console.error("Failed to remove track", error);
                }
            },

            removeAllDownloadedTracks: async () => {
                const { downloadedTrackIds } = get();
                try {
                    // Parallel removal for speed
                    await Promise.all(downloadedTrackIds.map(id => downloadService.removeDownloadedTrack(id)));
                    set({ downloadedTrackIds: [] });
                } catch (error) {
                    console.error("Failed to remove all tracks", error);
                }
            },

            addNotification: (notification) => {
                set(state => ({
                    notifications: [
                        { ...notification, id: Date.now().toString(), read: false },
                        ...state.notifications
                    ].slice(0, 50) // Keep last 50
                }));
            },
            markNotificationRead: (id) => {
                set(state => ({
                    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
                }));
            },
            removeNotification: (id) => {
                set(state => ({
                    notifications: state.notifications.filter(n => n.id !== id)
                }));
            },
            clearNotifications: () => set({ notifications: [] }),
        }),
        {
                    name: 'shazacin-storage',
                    storage: createJSONStorage(() => localStorage),
                    // Only persist user preferences. nowPlaying, isPlaying, and
                    // playbackProgress must NOT persist — auto-resuming playback on
                    // page reload (a) surprises users, (b) breaks iOS Safari where
                    // setting audio.currentTime before the buffer is ready bricks
                    // the audio element (loadeddata never fires).
                    partialize: (state) => ({
                        recentSearches: state.recentSearches,
                        playbackSpeed: state.playbackSpeed,
                        viewMode: state.viewMode,
                        activeMediaType: state.activeMediaType,
                        homeScrollPosition: state.homeScrollPosition,
                        useSimplifiedLayout: state.useSimplifiedLayout,
                    }),
                }
    )
);

export default useStore;