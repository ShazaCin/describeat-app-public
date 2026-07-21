import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../../hooks/useStore';
import Icon from '../ui/Icon';
import SafeImage from '../ui/SafeImage';

const MiniPlayer: React.FC = () => {
    const { nowPlaying, isPlaying, openPlayer, togglePlayPause, isPlayerExpanded, stopTrack, syncSession, isMuted, toggleMute } = useStore();

    if (!nowPlaying || isPlayerExpanded) return null;

    const isSyncMode = syncSession?.isActive && syncSession.titleIdFound === nowPlaying.title.titleId;

    const { title, track } = nowPlaying;

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50"
            role="region"
            aria-label="Mini player"
        >
            <div
                className="w-full h-16 bg-brand-primary flex items-center justify-between pl-4 pr-2 text-white shadow-lg"
                role="toolbar"
                aria-label="Playback controls"
            >
                <button
                    onClick={openPlayer}
                    className="flex items-center gap-3 overflow-hidden flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-md p-1"
                    aria-label={`Now playing: ${track.name} from ${title.title}${isSyncMode ? ' (Synced playback)' : ''}. Tap to expand player.`}
                    aria-pressed="false"
                >
                    <SafeImage src={title.images.poster} alt="" className="w-10 h-10 rounded-md object-cover" />
                    <div className="text-left whitespace-nowrap overflow-hidden">
                        <div className="flex items-center gap-1.5">
                            {isSyncMode && (
                                <Icon name="forward" className="w-4 h-4 text-brand-accent animate-pulse" aria-hidden="true" />
                            )}
                            <p className="font-semibold truncate">{title.title}</p>
                        </div>
                        <p className={`text-sm ${isSyncMode ? 'text-brand-accent font-bold' : 'opacity-80'}`}>
                            {isSyncMode ? 'Synced Playback' : 'Playing now...'}
                        </p>
                    </div>
                    <span className="sr-only">{`Now playing: ${track.name} from ${title.title}${isSyncMode ? ' (Synced playback)' : ''}. Tap to expand player.`}</span>
                </button>
                <div className="flex items-center" role="group" aria-label="Player actions">
                    {isSyncMode ? (
                        <button 
                            onClick={(e) => { e.stopPropagation(); toggleMute(); }} 
                            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'} 
                            className="p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-full"
                            aria-pressed={isMuted}
                        >
                            <Icon name={isMuted ? 'volume-off' : 'volume-up'} className="w-8 h-8" />
                            <span className="sr-only">{isMuted ? 'Unmute audio' : 'Mute audio'}</span>
                        </button>
                    ) : (
                        <button 
                            onClick={(e) => { e.stopPropagation(); togglePlayPause(); }} 
                            aria-label={isPlaying ? `Pause ${track.name}` : `Play ${track.name}`} 
                            className="p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-full"
                            aria-pressed={isPlaying}
                        >
                            <Icon name={isPlaying ? 'pause' : 'play'} className="w-8 h-8" />
                            <span className="sr-only">{isPlaying ? `Pause ${track.name}` : `Play ${track.name}`}</span>
                        </button>
                    )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); stopTrack(); }} 
                        aria-label="Stop playback and close player" 
                        className="p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-full"
                    >
                        <Icon name="close" className="w-7 h-7" />
                        <span className="sr-only">Stop playback and close player</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default MiniPlayer;