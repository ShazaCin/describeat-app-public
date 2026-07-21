import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../../hooks/useStore';
import Icon from '../ui/Icon';
import SafeImage from '../ui/SafeImage';
import MarqueeText from '../ui/MarqueeText';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { QueuedItem } from '../../types';

const formatTime = (totalSeconds: number): string => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const OptionsMenu: React.FC<{ onClose: () => void }> = React.memo(({ onClose }) => {
    const { playbackSpeed, setPlaybackSpeed, sleepTimer, setSleepTimer, closeOptions } = useStore();
    const menuRef = useFocusTrap<HTMLDivElement>(true);
    const playbackSpeeds = [0.75, 1, 1.25, 1.5, 2];
    const sleepDurations = [15, 30, 45, 60];
    const [customMin, setCustomMin] = useState('');
    const [showCustom, setShowCustom] = useState(false);
    const customInputRef = useRef<HTMLInputElement>(null);

    const handleCustom = () => {
        const val = parseInt(customMin, 10);
        if (val > 0 && val <= 999) {
            setSleepTimer(val);
            setShowCustom(false);
            setCustomMin('');
        }
    };

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
                if (info.offset.y > 100) {
                    closeOptions();
                }
            }}
            className="absolute inset-x-0 bottom-0 z-30"
            onClick={onClose}
            role="presentation"
        >
            <div
                ref={menuRef}
                className="bg-brand-surface-light rounded-t-2xl p-4 pt-2"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="options-title"
            >
                <div className="w-12 h-1.5 bg-brand-text/30 rounded-full mx-auto mb-4" aria-hidden="true" />
                <div className="space-y-6">
                    <fieldset>
                        <legend id="options-title" className="text-lg font-semibold mb-3">Playback Options</legend>
                        <div>
                            <label className="text-lg font-semibold mb-3 block">Playback Speed</label>
                            <div className="flex items-center justify-center gap-2 bg-black/20 p-1 rounded-full" role="group" aria-labelledby="speed-label">
                                <span id="speed-label" className="sr-only">Select playback speed</span>
                                {playbackSpeeds.map(speed => (
                                    <button
                                        key={speed}
                                        onClick={() => setPlaybackSpeed(speed)}
                                        className={`flex-1 px-3 py-2 text-sm font-semibold rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-brand-accent outline-none ${playbackSpeed === speed ? 'bg-brand-primary' : 'text-brand-text-secondary'}`}
                                        aria-pressed={playbackSpeed === speed}
                                        aria-label={`${speed}x speed${playbackSpeed === speed ? ', selected' : ''}`}
                                    >
                                        {speed}x
                                    </button>
                                ))}
                            </div>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend className="text-lg font-semibold mb-3">Sleep Timer</legend>
                        <div className="flex items-center justify-center gap-2 bg-black/20 p-1 rounded-full" role="group" aria-labelledby="timer-label">
                            <span id="timer-label" className="sr-only">Select sleep timer duration</span>
                            {sleepDurations.map(min => (
                                <button
                                    key={min}
                                    onClick={() => setSleepTimer(min)}
                                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-brand-accent outline-none ${sleepTimer.duration === min ? 'bg-brand-primary' : 'text-brand-text-secondary'}`}
                                    aria-pressed={sleepTimer.duration === min}
                                    aria-label={`${min} minutes${sleepTimer.duration === min ? ', selected' : ''}`}
                                >
                                    {min} min
                                </button>
                            ))}
                            <button
                                onClick={() => setSleepTimer(null)}
                                className={`flex-1 px-3 py-2 text-sm font-semibold rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-brand-accent outline-none ${sleepTimer.duration === null ? 'bg-brand-primary' : 'text-brand-text-secondary'}`}
                                aria-pressed={sleepTimer.duration === null}
                                aria-label={`Off${sleepTimer.duration === null ? ', selected' : ''}`}
                            >
                                Off
                            </button>
                        </div>
                        {showCustom ? (
                            <div className="flex items-center gap-2 mt-2" role="group" aria-label="Custom sleep timer">
                                <input
                                    ref={customInputRef}
                                    type="number"
                                    min="1"
                                    max="999"
                                    value={customMin}
                                    onChange={(e) => setCustomMin(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleCustom(); }}
                                    className="w-20 px-2 py-1 text-sm rounded bg-black/20 border border-white/10 text-white text-center"
                                    placeholder="min"
                                    aria-label="Enter custom minutes"
                                />
                                <button onClick={handleCustom} className="px-3 py-1 text-sm font-semibold bg-brand-primary rounded-full hover:bg-brand-secondary transition-colors">
                                    Set
                                </button>
                                <button onClick={() => { setShowCustom(false); setCustomMin(''); }} className="px-2 py-1 text-sm text-brand-text-secondary hover:text-white">
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => { setShowCustom(true); setTimeout(() => customInputRef.current?.focus(), 50); }} className="mt-2 w-full text-xs text-brand-text-secondary hover:text-white font-semibold py-1">
                                + Custom
                            </button>
                        )}
                    </fieldset>
                </div>
                <button onClick={onClose} className="w-full mt-6 bg-brand-primary/80 hover:bg-brand-primary transition-colors py-3 rounded-lg font-semibold focus-visible:ring-2 focus-visible:ring-brand-accent outline-none" aria-label="Close options menu">Done</button>
            </div>
        </motion.div>
    )
});

const QueueItem: React.FC<{
    item: QueuedItem;
    isNowPlaying?: boolean;
    isPlayed?: boolean;
    onPlay: (id: string) => void;
    onRemove: (id: string) => void;
}> = ({ item, isNowPlaying = false, isPlayed = false, onPlay, onRemove }) => {
    const isInteractive = !isNowPlaying;

    const handlePlay = () => {
        if (isInteractive) {
            onPlay(item.queueItemId);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handlePlay();
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove(item.queueItemId);
    };

    const getAriaLabel = () => {
        if (isNowPlaying) return `Now playing: ${item.track.name} from ${item.title.title}`;
        if (isPlayed) return `Play again: ${item.track.name} from ${item.title.title}`;
        return `Play next: ${item.track.name} from ${item.title.title}`;
    }

    return (
        <div
            className={`flex items-center gap-3 p-2 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-accent outline-none ${isInteractive ? 'hover:bg-white/10 cursor-pointer' : ''
                }`}
            role="button"
            tabIndex={isInteractive ? 0 : -1}
            onClick={handlePlay}
            onKeyDown={handleKeyDown}
            aria-label={getAriaLabel()}
        >
            <SafeImage
                src={item.title.images.poster}
                alt=""
                className="w-12 h-16 object-cover rounded flex-shrink-0"
            />
            <div className="flex-1 overflow-hidden">
                <p
                    className={`font-semibold truncate ${isNowPlaying
                        ? 'text-brand-accent'
                        : isPlayed
                            ? 'text-brand-text-secondary'
                            : 'text-white'
                        }`}
                >
                    {item.track.name}
                </p>
                <p className="text-sm text-brand-text-secondary truncate">
                    {item.title.title}
                </p>
            </div>
            {isInteractive && (
                <button
                    onClick={handleRemove}
                    aria-label={`Remove ${item.track.name} from queue`}
                    className="p-2 text-brand-text-secondary hover:text-white focus-visible:ring-2 focus-visible:ring-brand-accent rounded-full outline-none"
                >
                    <Icon name="close" className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

const QueueView: React.FC<{ onClose: () => void }> = React.memo(({ onClose }) => {
    const { queue, nowPlaying, playFromQueue, removeFromQueue, clearQueue, playedQueue, playFromHistory, closeQueue } = useStore();
    const queueRef = useFocusTrap<HTMLDivElement>(true);

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
                if (info.offset.y > 100) {
                    onClose();
                }
            }}
            className="absolute inset-0 z-20 bg-brand-surface/95 backdrop-blur-md flex flex-col"
            ref={queueRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="queue-title"
        >
            <header className="flex items-center justify-between p-4 flex-shrink-0 border-b border-white/10">
                <h2 id="queue-title" className="text-xl font-bold">Up Next</h2>
                <div className="flex items-center gap-2">
                    <button onClick={clearQueue} className="text-sm font-semibold text-brand-text-secondary hover:text-white px-3 py-1 rounded-md focus-visible:ring-2 focus-visible:ring-brand-accent outline-none" aria-label="Clear entire queue">Clear</button>
                    <button onClick={onClose} aria-label="Close queue" className="p-2 focus-visible:ring-2 focus-visible:ring-brand-accent rounded-full outline-none"><Icon name="close" /><span className="sr-only">Close queue</span></button>
                </div>
            </header>
            <div className="overflow-y-auto flex-1 p-2 space-y-4">
                {nowPlaying && (
                    <section className="px-2">
                        <h3 className="text-sm font-semibold text-brand-text-secondary mb-2">Now Playing</h3>
                        <QueueItem item={{ queueItemId: 'now-playing', title: nowPlaying.title, track: nowPlaying.track }} isNowPlaying onPlay={() => { }} onRemove={removeFromQueue} />
                    </section>
                )}
                {queue.length > 0 && (
                    <section className="px-2">
                        <h3 className="text-sm font-semibold text-brand-text-secondary mb-2">Up Next</h3>
                        <div className="space-y-1" role="list">
                            {queue.map(item => <div key={item.queueItemId} role="listitem"><QueueItem item={item} onPlay={playFromQueue} onRemove={removeFromQueue} /></div>)}
                        </div>
                    </section>
                )}
                {playedQueue.length > 0 && (
                    <section className="px-2">
                        <h3 className="text-sm font-semibold text-brand-text-secondary mb-2">History</h3>
                        <div className="space-y-1" role="list">
                            {playedQueue.map(item => <div key={item.queueItemId} role="listitem"><QueueItem item={item} isPlayed onPlay={playFromHistory} onRemove={removeFromQueue} /></div>)}
                        </div>
                    </section>
                )}
                {queue.length === 0 && playedQueue.length === 0 && !nowPlaying && (
                    <div className="text-center pt-16 text-brand-text-secondary" role="status" aria-live="polite">
                        <p>Nothing in your queue.</p>
                        <p className="text-sm">Add tracks from the title detail page.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
});

const PlayerOverlay: React.FC = () => {
    const {
        nowPlaying,
        isPlaying,
        playbackProgress,
        isPlayerExpanded,
        closePlayer,
        togglePlayPause,
        seekBy,
        seekTo,
        playNext,
        playPrevious,
        queue,
        playedQueue,
        isQueueOpen,
        isOptionsOpen,
        openQueue,
        closeQueue,
        openOptions,
        closeOptions,
        syncSession,
        isMuted,
        toggleMute,
        clearSyncSession,
    } = useStore();
    const navigate = useNavigate();

    const overlayRef = useFocusTrap<HTMLDivElement>(isPlayerExpanded && !isQueueOpen && !isOptionsOpen);

    const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const progress = parseFloat(e.target.value);
        seekTo(progress);
    };

    const handleTitleClick = () => {
        if (!nowPlaying) return;
        closePlayer();
        setTimeout(() => {
            navigate(`/title/${nowPlaying.title.titleId}`);
        }, 150);
    };

    const totalDurationSeconds = useMemo(() => (nowPlaying?.title.runtimeMinutes || 0) * 60, [nowPlaying]);
    const currentTimeSeconds = useMemo(() => playbackProgress * totalDurationSeconds, [playbackProgress, totalDurationSeconds]);

    const isSyncMode = useMemo(() => 
        syncSession?.isActive && syncSession.titleIdFound === nowPlaying?.title.titleId
    , [syncSession, nowPlaying]);

    const hasNext = queue.length > 0;
    const hasPrevious = playedQueue.length > 0;

    const showQueueDirectly = !nowPlaying;

    return (
        <motion.div
            ref={overlayRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
                if (info.offset.y > 100) {
                    closePlayer();
                }
            }}
            className="fixed inset-0 z-50 bg-brand-bg flex flex-col text-white"
            role="dialog"
            aria-modal="true"
            aria-labelledby="player-title"
        >
            <div className="absolute inset-0">
                {nowPlaying && <SafeImage src={nowPlaying.title.images.backdrop} alt="" className="w-full h-full object-cover opacity-20" />}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/80 to-transparent" />
            </div>

            <header className="relative flex-shrink-0 flex items-center justify-between p-4 z-10">
                <button onClick={closePlayer} aria-label="Collapse player" className="p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full">
                    <Icon name="chevronDown" className="w-7 h-7" />
                    <span className="sr-only">Collapse player</span>
                </button>
                <div className="text-center overflow-hidden px-2 flex-1">
                    <p className={`text-xs whitespace-nowrap ${isSyncMode ? 'text-brand-accent font-bold' : 'text-brand-text-secondary'}`}>
                        {isSyncMode ? '\u{1F517} IN SYNC' : (nowPlaying ? 'NOW PLAYING' : 'PLAYLIST')}
                    </p>
                    {nowPlaying && (
                        <MarqueeText
                            text={nowPlaying.title.title}
                            className="font-semibold"
                        />
                    )}
                </div>
                <button
                    onClick={openOptions}
                    aria-label="More options"
                    className={`p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full ${!nowPlaying ? 'opacity-0 pointer-events-none' : ''}`}
                    disabled={!nowPlaying}
                >
                    <Icon name="more-vertical" className="w-7 h-7" />
                    <span className="sr-only">More options</span>
                </button>
            </header>

            {!showQueueDirectly ? (
                <>
                    <main className="relative flex-1 flex flex-col justify-center items-center px-8 space-y-6" role="main">
                        <div className="w-full max-w-xs aspect-square shadow-2xl">
                            <SafeImage src={nowPlaying?.title.images.poster} alt={nowPlaying?.title.title} className="w-full h-full object-cover rounded-lg" />
                        </div>
                        <div className="w-full text-center overflow-hidden">
                            <button onClick={handleTitleClick} className="w-full cursor-pointer group focus-visible:ring-2 focus-visible:ring-brand-accent rounded-lg outline-none p-2" aria-label={`Go to ${nowPlaying?.title.title} details`}>
                                <MarqueeText
                                    text={nowPlaying?.track.name || ''}
                                    className="text-2xl font-bold mb-1 group-hover:underline"
                                    speed={10}
                                />
                                <MarqueeText
                                    text={nowPlaying?.title.title || ''}
                                    className="text-brand-text-secondary group-hover:underline"
                                />
                            </button>
                        </div>
                    </main>

                    <footer className="relative flex-shrink-0 p-4 space-y-4 z-10" role="region" aria-label="Player controls">
                        <div className={`w-full space-y-2 ${isSyncMode ? 'opacity-50 pointer-events-none' : ''}`}>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.001"
                                value={playbackProgress}
                                onChange={handleScrubberChange}
                                className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer range-lg accent-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-accent"
                                aria-label={isSyncMode ? "Playback progress (Locked in sync)" : "Playback progress"}
                                disabled={isSyncMode}
                            />
                            <div className="flex justify-between text-xs font-mono text-brand-text-secondary" aria-live="off">
                                <span aria-label={`Current time: ${formatTime(currentTimeSeconds)}`}>{formatTime(currentTimeSeconds)}</span>
                                <span aria-label={`Total duration: ${formatTime(totalDurationSeconds)}`}>{formatTime(totalDurationSeconds)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center justify-around w-full" role="group" aria-label="Playback controls">
                                <button onClick={playPrevious} aria-label="Previous track" className={`p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full ${isSyncMode ? 'opacity-0 pointer-events-none' : ''}`} disabled={!hasPrevious || isSyncMode}>
                                    <Icon name="skip-back" className={`w-8 h-8 ${hasPrevious ? 'opacity-80 hover:opacity-100' : 'opacity-30'}`} />
                                    <span className="sr-only">Previous track</span>
                                </button>
                                <button onClick={() => seekBy(-15)} aria-label="Rewind 15 seconds" className={`p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full ${isSyncMode ? 'opacity-0 pointer-events-none' : ''}`} disabled={isSyncMode}>
                                    <Icon name="rewind" className="w-8 h-8 opacity-80 hover:opacity-100" />
                                    <span className="sr-only">Rewind 15 seconds</span>
                                </button>
                                
                                {isSyncMode ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <button 
                                            onClick={toggleMute} 
                                            aria-label={isMuted ? 'Unmute' : 'Mute'} 
                                            className={`${isMuted ? 'bg-brand-secondary' : 'bg-white'} text-brand-bg w-20 h-20 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 active:scale-95 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent`}
                                        >
                                            <Icon name={isMuted ? 'volume-off' : 'volume-up'} className="w-12 h-12" />
                                            <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
                                        </button>
                                        <span className="text-[10px] text-brand-text-secondary/70">Tap to mute/unmute (sync mode)</span>
                                    </div>
                                ) : (
                                    <button onClick={togglePlayPause} aria-label={isPlaying ? `Pause ${nowPlaying?.track.name}` : `Play ${nowPlaying?.track.name}`} className="bg-white text-brand-bg w-20 h-20 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 active:scale-95 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent">
                                        <Icon name={isPlaying ? 'pause' : 'play'} className="w-12 h-12" />
                                        <span className="sr-only">{isPlaying ? `Pause ${nowPlaying?.track.name}` : `Play ${nowPlaying?.track.name}`}</span>
                                    </button>
                                )}

                                <button onClick={() => seekBy(30)} aria-label="Fast-forward 30 seconds" className={`p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full ${isSyncMode ? 'opacity-0 pointer-events-none' : ''}`} disabled={isSyncMode}>
                                    <Icon name="forward" className="w-8 h-8 opacity-80 hover:opacity-100" />
                                    <span className="sr-only">Fast-forward 30 seconds</span>
                                </button>
                                <button onClick={playNext} aria-label="Next track" className={`p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full ${isSyncMode ? 'opacity-0 pointer-events-none' : ''}`} disabled={!hasNext || isSyncMode}>
                                    <Icon name="skip-forward" className={`w-8 h-8 ${hasNext ? 'opacity-80 hover:opacity-100' : 'opacity-30'}`} />
                                    <span className="sr-only">Next track</span>
                                </button>
                            </div>

                            {isSyncMode && (
                                <button 
                                    onClick={clearSyncSession}
                                    className="px-4 py-1.5 bg-brand-surface-light border border-white/20 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-brand-accent outline-none"
                                    aria-label="Exit sync mode"
                                >
                                    EXIT SYNC MODE
                                </button>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-2" role="group" aria-label="Additional controls">
                            <div className="flex flex-col items-center gap-0.5">
                                <button aria-label="Shuffle (Coming soon)" className="p-2 text-brand-text-secondary/50 focus:outline-none cursor-default" disabled>
                                    <Icon name="shuffle" className="w-6 h-6" />
                                    <span className="sr-only">Shuffle (Coming soon)</span>
                                </button>
                                <span className="text-[9px] text-brand-text-secondary/40 leading-none">Coming soon</span>
                            </div>
                            <button onClick={openQueue} aria-label="Show queue" className="p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full">
                                <Icon name="list" className="w-6 h-6 opacity-80 hover:opacity-100" />
                                <span className="sr-only">Show queue</span>
                            </button>
                            <div className="flex flex-col items-center gap-0.5">
                                <button aria-label="Repeat (Coming soon)" className="p-2 text-brand-text-secondary/50 focus:outline-none cursor-default" disabled>
                                    <Icon name="repeat" className="w-6 h-6" />
                                    <span className="sr-only">Repeat (Coming soon)</span>
                                </button>
                                <span className="text-[9px] text-brand-text-secondary/40 leading-none">Coming soon</span>
                            </div>
                        </div>
                    </footer>
                </>
            ) : (
                <div className="relative flex-1 overflow-hidden">
                    <QueueView onClose={closePlayer} />
                </div>
            )}

            <AnimatePresence>
                {isQueueOpen && !showQueueDirectly && <QueueView onClose={closeQueue} />}
            </AnimatePresence>
            <AnimatePresence>
                {isOptionsOpen && <OptionsMenu onClose={closeOptions} />}
            </AnimatePresence>
        </motion.div>
    );
};

export default PlayerOverlay;