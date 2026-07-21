import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { firebaseMessaging } from './services/firebaseMessaging';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import useStore from './hooks/useStore';
import HomePage from './pages/HomePage';
import TitleDetailPage from './pages/TitleDetailPage';
import CategoryPage from './pages/CategoryPage';
import CategoryListingsPage from './pages/CategoryListingsPage';
import Layout from './components/layout/Layout';
import PlayerOverlay from './components/player/PlayerOverlay';
import MiniPlayer from './components/player/MiniPlayer';
import SearchModal from './components/modals/SearchModal';
import MainMenu from './components/modals/MainMenu';
import SyncFlow from './components/sync/SyncFlow';
import FeedbackModal from './components/modals/FeedbackModal';
import PreferencesModal from './components/modals/PreferencesModal';
import AriaLiveRegion from './components/ui/AriaLiveRegion';
import NotificationAnnouncer from './components/ui/NotificationAnnouncer';
import { useAudioUnlock } from './hooks/useAudioUnlock';
import { initAnalytics, logPageView } from './services/analyticsService';
import LandingPage from './components/auth/LandingPage';

const throttle = (func: (...args: any[]) => void, limit: number) => {
  let inThrottle: boolean = false;
  return function (this: any, ...args: any[]) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

let lastSyncCorrection = 0;

const RouteHandler: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    logPageView(location.pathname + location.search);
  }, [location]);

  return null;
};

// Authenticated Application Component (Contains all core logic)
const AuthenticatedApp: React.FC = () => {
  useAudioUnlock();
  
  useEffect(() => {
    initAnalytics();
    
    // Initialize Firebase push notifications
    const initNotifications = async () => {
      try {
        const user = await getCurrentUser();
        if (user && firebaseMessaging.isNotificationSupported()) {
          console.log('[App] Initializing push notifications for user:', user.userId);
          await firebaseMessaging.initialize(user.userId);
        }
      } catch (error) {
        console.error('[App] Error initializing notifications:', error);
      }
    };
    
    initNotifications();
  }, []);

  const {
    fetchInitialData,
    nowPlaying,
    isPlaying,
    setPlaybackProgress,
    togglePlayPause,
    isPlayerExpanded,
    isSearchOpen,
    isMenuOpen,
    isSyncing,
    isFeedbackOpen,
    isPreferencesOpen,
    playbackProgress,
    playbackSpeed,
    lastSeekRequest,
    lastAbsoluteSeekRequest,
    isQueueOpen,
    isOptionsOpen,
    isOffline,
    setIsOffline,
    downloadedTrackIds,
    addNotification,
    closePlayer,
    closeQueue,
    closeOptions,
    closeSearch,
    closeMenu,
    closeFeedback,
    closePreferences,
    syncSession,
    isMuted,
  } = useStore();

  // Network status listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOffline]);

  // Keyboard Navigation: Esc to close overlays
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isOptionsOpen) {
          closeOptions();
        } else if (isQueueOpen) {
          closeQueue();
        } else if (isPlayerExpanded) {
          closePlayer();
        } else if (isSearchOpen) {
          closeSearch();
        } else if (isMenuOpen) {
          closeMenu();
        } else if (isFeedbackOpen) {
          closeFeedback();
        } else if (isPreferencesOpen) {
          closePreferences();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOptionsOpen, isQueueOpen, isPlayerExpanded, isSearchOpen, isMenuOpen,
    isFeedbackOpen, isPreferencesOpen, closeOptions, closeQueue, closePlayer,
    closeSearch, closeMenu, closeFeedback, closePreferences
  ]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const throttledUpdateHistory = useRef(
    throttle((titleId: string, trackId: string, progress: number) => {
      // Don't save if progress is negligible or complete
      if (progress > 0.02 && progress < 0.98) {
        useStore.getState().updatePlaybackHistory({ titleId, trackId, progress });
      }
    }, 5000) // Update database every 5 seconds
  ).current;

  // One-time effect: attach audio event listeners to the persistent
  // <audio> element mounted in JSX. These listeners stay alive for the
  // lifetime of AuthenticatedApp — they don't need to be re-attached
  // every time the track changes, because changing .src fires the same
  // events on the same element.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      const state = useStore.getState();
      const { syncSession } = state;

      // SYNC MODE: Jump to calculated position
      if (syncSession?.isActive && syncSession.titleIdFound === state.nowPlaying?.title.titleId) {
        const elapsed = (Date.now() - syncSession.recordingStart) / 1000;
        const magicAdj = state.nowPlaying?.track.magic_adjust || 0;
        const syncPosition = syncSession.apiOffsetTime + elapsed + magicAdj;
        audio.currentTime = Math.max(0, syncPosition);
        audio.muted = state.isMuted || true;
        audio.play().catch(e => console.error("Sync play failed", e));
        return;
      }

      if (state.isPlaying) {
        audio.play().catch(e => console.error("Audio play failed on load", e));
      }
    };

    const handleTimeUpdate = () => {
      if (audio.duration) {
        const currentProgress = audio.currentTime / audio.duration;
        setPlaybackProgress(currentProgress);
        const state = useStore.getState();
        const currentPlaying = state.nowPlaying;
        if (currentPlaying) {
          throttledUpdateHistory(currentPlaying.title.titleId, currentPlaying.track.trackId, currentProgress);
        }
      }
    };

    const handleEnded = () => {
      const finishedTrack = useStore.getState().nowPlaying;
      if (finishedTrack) {
        useStore.getState().updatePlaybackHistory({
          titleId: finishedTrack.title.titleId,
          trackId: finishedTrack.track.trackId,
          progress: 1
        });
      }
      useStore.getState().playNext();
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [setPlaybackProgress, throttledUpdateHistory]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Effect for switching the audio source when nowPlaying changes.
  // The <audio> element itself is mounted persistently in JSX — we only
  // change .src here. This is critical for iOS Safari, which silently
  // suspends any Audio() instance created outside a user gesture (which
  // a useEffect always is).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!nowPlaying) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      return;
    }

    // For now, only change src — the actual play() call happens in the
    // [isPlaying] effect below, which keeps it adjacent to the user
    // gesture that toggled isPlaying.
    let audioUrl = nowPlaying.track.url;

    // Use local blob if downloaded
    if (downloadedTrackIds.includes(nowPlaying.track.trackId)) {
      import('./services/downloadService').then(({ getOfflineTrackUrl }) => {
        getOfflineTrackUrl(nowPlaying.track.trackId).then((localUrl) => {
          if (localUrl && audioRef.current) {
            audioRef.current.src = localUrl;
            audioRef.current.load();
          }
        });
      });
    } else {
      audio.src = audioUrl;
      audio.load();
    }

    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [nowPlaying?.track.trackId, downloadedTrackIds]);

  // Effect for controlling play/pause state. Depends on nowPlaying as well
  // so that switching tracks (without an intermediate pause) re-fires play()
  // on the new src.
  useEffect(() => {
    if (audioRef.current) {
      const { syncSession, nowPlaying } = useStore.getState();
      const isSyncActive = syncSession?.isActive && syncSession.titleIdFound === nowPlaying?.title.titleId;

      if (isSyncActive) {
        // In sync mode, the track must always play. Only mute/unmute is allowed.
        if (audioRef.current.paused) {
          audioRef.current.play().catch(e => console.error("Sync resume failed", e));
        }
      } else {
        if (isPlaying) {
          audioRef.current.play().catch(e => console.error("Audio play failed", e));
        } else {
          audioRef.current.pause();
        }
      }
    }
  }, [isPlaying, nowPlaying?.track.trackId]);

  // Effect for controlling mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Effect for controlling playback speed
  useEffect(() => {
    if (audioRef.current) {
      if (audioRef.current.playbackRate !== playbackSpeed) {
        audioRef.current.playbackRate = playbackSpeed;
      }
    }
  }, [playbackSpeed]);

  // Effect for handling relative seek requests (skip buttons)
  useEffect(() => {
    if (audioRef.current && lastSeekRequest) {
      const newTime = audioRef.current.currentTime + lastSeekRequest.amount;
      audioRef.current.currentTime = Math.max(0, Math.min(newTime, audioRef.current.duration || Infinity));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSeekRequest]);

  // Effect for handling absolute seek requests (scrubber)
  useEffect(() => {
    if (audioRef.current && lastAbsoluteSeekRequest) {
      if (isFinite(audioRef.current.duration)) {
        audioRef.current.currentTime = lastAbsoluteSeekRequest.progress * audioRef.current.duration;
      }
    }
  }, [lastAbsoluteSeekRequest]);

  // Effect for Media Session API (System controls/notifications)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    if (nowPlaying) {
      const { title, track } = nowPlaying;

      // Update Metadata
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name,
        artist: title.title,
        album: title.year ? `${title.title} (${title.year})` : title.title,
        artwork: [
          { src: title.images.poster || '/assets/logo.svg', sizes: '96x96', type: 'image/png' },
          { src: title.images.poster || '/assets/logo.svg', sizes: '128x128', type: 'image/png' },
          { src: title.images.poster || '/assets/logo.svg', sizes: '192x192', type: 'image/png' },
          { src: title.images.poster || '/assets/logo.svg', sizes: '256x256', type: 'image/png' },
          { src: title.images.poster || '/assets/logo.svg', sizes: '384x384', type: 'image/png' },
          { src: title.images.poster || '/assets/logo.svg', sizes: '512x512', type: 'image/png' },
        ]
      });

      // Action Handlers
      const actionHandlers: [MediaSessionAction, MediaSessionActionHandler][] = [
        ['play', () => useStore.getState().togglePlayPause()],
        ['pause', () => useStore.getState().togglePlayPause()],
        ['previoustrack', () => useStore.getState().playPrevious()],
        ['nexttrack', () => useStore.getState().playNext()],
        ['seekbackward', () => useStore.getState().seekBy(-10)],
        ['seekforward', () => useStore.getState().seekBy(10)],
      ];

      for (const [action, handler] of actionHandlers) {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
        } catch (error) {
          console.warn(`The media session action "${action}" is not supported yet.`);
        }
      }

      // Handle seekto if supported
      try {
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined && audioRef.current) {
            const progress = details.seekTime / audioRef.current.duration;
            useStore.getState().seekTo(progress);
          }
        });
      } catch (error) {
        console.warn('The media session action "seekto" is not supported yet.');
      }
    } else {
      // Clear metadata when nothing is playing
      navigator.mediaSession.metadata = null;
    }
  }, [nowPlaying]);

  // Effect for Media Session Playback State
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : (nowPlaying ? 'paused' : 'none');

    // Update position state for better seekbar in notification
    if (audioRef.current && isFinite(audioRef.current.duration) && isFinite(audioRef.current.currentTime)) {
      try {
        navigator.mediaSession.setPositionState({
          duration: audioRef.current.duration,
          playbackRate: audioRef.current.playbackRate,
          position: audioRef.current.currentTime,
        });
      } catch (e) {
        // Fallback for older browsers
        console.warn("setPositionState failed", e);
      }
    }
  }, [isPlaying, nowPlaying, playbackProgress]); // playbackProgress is a proxy for currentTime updates

  // Effect to listen for Service Worker messages (Pushes when app is open)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'PUSH_RECEIVED') {
          const { title, body, icon, data, timestamp } = event.data.payload;
          addNotification({
            title,
            body,
            icon,
            data,
            timestamp,
          });
          // Optional: Show a toast here if we had a toast component
          console.log('Push received in foreground:', title);
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
    }
  }, [addNotification]);


  return (
    <Router>
      <div className="h-screen w-screen overflow-hidden font-sans">
        {/* Persistent <audio> element — mounted as part of the React tree so
            iOS Safari treats it as user-activation-eligible. The setupAudio
            effect only changes .src on this element; it never creates a
            new Audio() (which would be created outside the click gesture
            and silently suspended by iOS). */}
        <audio
          ref={audioRef}
          preload="none"
          playsInline
          aria-hidden="true"
          /* iOS Safari refuses to load or play media elements with display:none.
             Position the element offscreen with zero size so it's still in
             the layout tree (iOS considers it "visible" for autoplay purposes)
             but never rendered visually. */
          style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '1px', height: '1px', opacity: 0 }}
        />
        <AriaLiveRegion />
        <NotificationAnnouncer />
        <RouteHandler />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="category/:categorySlug" element={<CategoryPage />} />
            <Route path="category/:categorySlug/:subCategorySlug" element={<CategoryListingsPage />} />
            <Route path="title/:titleId" element={<TitleDetailPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>

        {nowPlaying && <MiniPlayer />}

        {isPlayerExpanded && <PlayerOverlay />}
        {isSearchOpen && <SearchModal />}
        {isMenuOpen && <MainMenu />}
        {isSyncing && <SyncFlow />}
        {isFeedbackOpen && <FeedbackModal />}
        {isPreferencesOpen && <PreferencesModal />}
      </div>
    </Router>
  );
};

// Main App Component with Auth Logic
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Automatic PWA Updates
  useRegisterSW({
    onRegistered(r) {
      console.log('[App] SW Registered:', r);
    },
    onRegisterError(error) {
      console.error('[App] SW registration error', error);
    },
  });

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      try {
        await getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const listener = (data: any) => {
      switch (data.payload.event) {
        case 'signIn':
          setIsAuthenticated(true);
          break;
        case 'signOut':
          setIsAuthenticated(false);
          break;
      }
    };

    const hubListener = Hub.listen('auth', listener);

    return () => hubListener();
  }, []);

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-bg text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-primary/20"></div>
          <p className="text-brand-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative">
        <LandingPage />
      </div>
    );
  }

  return <AuthenticatedApp />;
};

export default App;
