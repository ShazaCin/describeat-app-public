import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../hooks/useStore';
import { getTitleById, getTracksByTitleId, getTitlesByParentId } from '../services/db';
import { Title, AdTrack } from '../types';
// FIX: Import IconName type to correctly type icon properties.
import Icon, { type IconName } from '../components/ui/Icon';
import SafeImage from '../components/ui/SafeImage';
import MarqueeText from '../components/ui/MarqueeText';
import { composeShareText, urlToFile, updateSocialMetadata } from '../services/shareService';

const TitleDetailPage: React.FC = () => {
    const { titleId } = useParams<{ titleId: string }>();
    const navigate = useNavigate();
    const playTrack = useStore(s => s.playTrack);
    const openFeedback = useStore(s => s.openFeedback);
    const addToQueue = useStore(s => s.addToQueue);
    const fetchTracksByTitleId = useStore(s => s.fetchTracksByTitleId);

    const [title, setTitle] = useState<Title | null>(null);
    const [tracks, setTracks] = useState<AdTrack[]>([]);
    const [subItems, setSubItems] = useState<Title[]>([]);
const [loading, setLoading] = useState(true);
    const [justAdded, setJustAdded] = useState<string | null>(null);
    const [audioError, setAudioError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!titleId) return;
            setLoading(true);
            try {
                const titleData = await getTitleById(titleId);
                if (titleData) {
                    setTitle(titleData);
                    updateSocialMetadata(titleData);

                    const isParent = ['series', 'book'].includes(titleData.type);
                    if (isParent) {
                        const subs = await getTitlesByParentId(titleId);
                        // Sort by episode or chapter
                        subs.sort((a, b) => (a.episode || a.chapter || 0) - (b.episode || b.chapter || 0));
                        setSubItems(subs);
                        setTracks([]);
                    } else {
                        // Start with DB data
                        const dbTracks = await getTracksByTitleId(titleId);
                        const sortTracks = (ts: AdTrack[]) => [...ts].sort((a, b) =>
                            (a.trackPosition || 0) - (b.trackPosition || 0) || a.name.localeCompare(b.name)
                        );
                        setTracks(sortTracks(dbTracks));

                        // Then sync from network and update UI
                        const networkTracks = await fetchTracksByTitleId(titleId);
                        if (networkTracks.length > 0) {
                            setTracks(sortTracks(networkTracks));
                        }
                        setSubItems([]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch title details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [titleId]);

    const handleAddToQueue = (track: AdTrack) => {
        if (!title) return;
        addToQueue(title, track);
        setJustAdded(track.trackId);
        setTimeout(() => setJustAdded(null), 2000); // Reset after 2 seconds
    }

    const playOrAddSubItem = async (subItem: Title, action: 'play' | 'add') => {
        // 1. Check if we have tracks for this sub-item (try DB first, then network if needed?)
        // Ideally we should have a lightweight way to check, but for now we might need to fetch.
        // Let's rely on fetchTracksByTitleId which handles caching.

        try {
            const subTracks = await fetchTracksByTitleId(subItem.titleId);

if (subTracks.length === 0) {
                // No tracks found
                setAudioError("No audio tracks available for this item.");
                return;
            }

            if (subTracks.length === 1) {
                // Single track: Perform action immediately
                const track = subTracks[0];
                if (action === 'play') {
                    playTrack(subItem, track);
                } else {
                    handleAddToQueue(track); // Use wrapper to show feedback
                }
            } else {
                // Multiple tracks: Navigate to detail page
                navigate(`/title/${subItem.titleId}`);
            }
        } catch (error) {
            console.error("Error checking sub-item tracks:", error);
            navigate(`/title/${subItem.titleId}`); // Fallback
        }
    };

    const handleShare = async () => {
        if (!title) return;

        const shareText = composeShareText(title);
        const shareUrl = window.location.href;

        // Prepare share data
        const shareData: any = {
            title: `describeAT: ${title.title}`,
            text: shareText,
            url: shareUrl,
        };

        // Try to include the image if supported
        if (navigator.canShare && title.images.poster) {
            const fileName = `${title.title.replace(/\s+/g, '_')}_poster.jpg`;
            const imageFile = await urlToFile(title.images.poster, fileName, 'image/jpeg');

            if (imageFile && navigator.canShare({ files: [imageFile] })) {
                shareData.files = [imageFile];
            }
        }

        if (navigator.share && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    console.error('Error sharing:', error);
                }
            }
        } else {
            // Fallback: Copy to clipboard with a nice message
            try {
                const fallbackText = `${shareText}\n\nLink: ${shareUrl}`;
                await navigator.clipboard.writeText(fallbackText);
                // We'll use a simple alert for now as we don't have a toast system yet,
                // but the text is now much better.
                alert('Stunning share message copied to clipboard!');
            } catch (err) {
                console.error('Could not copy to clipboard: ', err);
            }
        }
    };
    const {
        nowPlaying,
        isPlaying,
        queue,
        downloadedTrackIds,
        downloadingTracks,
        downloadTrack,
        removeDownloadedTrack,
        isOffline,
        syncSession,
        clearSyncSession
    } = useStore();

    const isSyncActive = useMemo(() => 
        syncSession?.isActive && syncSession.titleIdFound === titleId
    , [syncSession, titleId]);

    const isTrackPlaying = (trackId: string) => nowPlaying?.track.trackId === trackId;
    const isTrackInQueue = (trackId: string) => queue.some(item => item.track.trackId === trackId) || justAdded === trackId;
    const isTrackDownloaded = (trackId: string) => downloadedTrackIds.includes(trackId);
    const getDownloadProgress = (trackId: string) => downloadingTracks[trackId];

    if (loading) return <div className="flex items-center justify-center h-full">Loading details...</div>;
    if (!title) return <div className="flex items-center justify-center h-full">Title not found.</div>;

    // FIX: Explicitly type the actionButtons array to ensure `icon` is of type `IconName`.
    const actionButtons: { name: string; icon: IconName; action: () => void | Promise<void> }[] = [
        { name: 'Report', icon: 'feedback', action: openFeedback },
        { name: 'Share', icon: 'share', action: handleShare },
        { name: 'Comment', icon: 'comment', action: () => console.log('Comment clicked') },
    ];

    return (
        <div className="w-full text-white">
            <div className="relative h-64">
                <SafeImage src={title.images.backdrop} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg to-transparent" />
                <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-10 bg-black/50 p-2 rounded-full" aria-label="Go back">
                    <Icon name="chevronLeft" className="w-6 h-6" />
                </button>
                <div className="absolute bottom-0 left-0 p-4 w-full flex items-end gap-4 overflow-hidden">
                    <SafeImage src={title.images.poster} alt={title.title} className="w-24 h-36 object-cover rounded-lg shadow-lg flex-shrink-0" />
                    <div className="flex-1 overflow-hidden">
                        <h1 className="text-2xl font-bold line-clamp-2">
                            {title.type === 'episode' && title.season !== undefined && title.episode !== undefined && (
                                <span className="text-brand-accent">S{title.season} Ep{title.episode}: </span>
                            )}
                            {title.title}
                        </h1>
                        <p className="text-brand-text-secondary">{title.year} &middot; {title.genre?.join(', ')}</p>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {isSyncActive && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-brand-accent/20 border-b border-brand-accent/30 overflow-hidden"
                    >
                        <div className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Icon name="forward" className="w-5 h-5 text-brand-accent animate-pulse" />
                                <div>
                                    <p className="text-xs font-bold text-brand-accent uppercase tracking-wider">Tap to Sync Active</p>
                                    <p className="text-sm text-white/90">Select a track below to play in sync.</p>
                                </div>
                            </div>
                            <button 
                                onClick={clearSyncSession}
                                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-colors"
                            >
                                EXIT SYNC
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-4 space-y-6">
                <div className="flex items-center gap-4 text-sm text-brand-text-secondary">
                    <span>{title.runtimeMinutes} min</span>
                    <span className="border px-2 py-0.5 rounded text-xs">{title.rated}</span>
                    <div className="flex items-center gap-1">
                        <Icon name="star" className="w-4 h-4 text-brand-accent" />
                        <span>{title.score}</span>
                    </div>
                </div>

                <p className="text-brand-text-secondary">
                    {title.type === 'episode' && title.season !== undefined && title.episode !== undefined && (
                        <span className="block font-semibold text-brand-accent mb-1 underline decoration-brand-accent/30 underline-offset-4">
                            Season {title.season}, Episode {title.episode}
                        </span>
                    )}
                    {title.type === 'chapter' && title.chapter !== undefined && (
                        <span className="block font-semibold text-brand-accent mb-1 underline decoration-brand-accent/30 underline-offset-4">
                            Chapter {title.chapter}
                        </span>
                    )}
{title.synopsis}
                </p>

                {audioError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2" role="alert">
                        <Icon name="info" className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-300">{audioError}</p>
                        <button onClick={() => setAudioError(null)} className="ml-auto p-1 text-red-400 hover:text-white" aria-label="Dismiss error">
                            <Icon name="close" className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-around py-2 bg-brand-surface-light rounded-lg">
                    {actionButtons.map(btn => (
                        <button key={btn.name} onClick={btn.action} className="flex flex-col items-center gap-1 text-brand-text-secondary hover:text-white transition-colors" aria-label={btn.name}>
                            <Icon name={btn.icon} className="w-6 h-6" />
                        </button>
                    ))}
                </div>

                <div>
                    {subItems.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-3 text-brand-accent">
                                {title.type === 'series' || title.type === 'tv-show' ? 'Episodes' : 'Chapters'}
                            </h2>
                            <div className="space-y-1">
                                {subItems.map(item => (
                                    <div key={item.titleId} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-brand-surface-light group relative">
                                        <button
                                            onClick={() => navigate(`/title/${item.titleId}`)}
                                            className="flex-1 flex items-center gap-3 text-left"
                                        >
                                            <div className="w-10 h-14 bg-brand-surface rounded overflow-hidden flex-shrink-0">
                                                <SafeImage src={item.images.poster} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-semibold text-white truncate group-hover:text-brand-primary">
                                                    {item.episode ? (
                                                        <span className="text-brand-accent mr-1">Ep {item.episode}:</span>
                                                    ) : item.chapter ? (
                                                        <span className="text-brand-accent mr-1">Ch {item.chapter}:</span>
                                                    ) : null}
                                                    {item.title}
                                                </p>
                                                <p className="text-sm text-brand-text-secondary truncate">{item.synopsis}</p>
                                            </div>
                                        </button>

                                        <div className="flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); playOrAddSubItem(item, 'add'); }}
                                                className="p-2 text-brand-text-secondary hover:text-white transition-colors"
                                                aria-label={`Add ${item.title} to queue`}
                                            >
                                                <Icon name="plus" className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); playOrAddSubItem(item, 'play'); }}
                                                className="p-2 text-brand-text-secondary hover:text-white transition-colors"
                                                aria-label={`Play ${item.title}`}
                                            >
                                                <Icon name="play" className="w-8 h-8" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tracks.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-3">Available AD Tracks</h2>
                            <div className="space-y-2">
                                {tracks.map(track => {
                                    const isPlayingThis = isTrackPlaying(track.trackId) && isPlaying;
                                    const inQueue = isTrackInQueue(track.trackId);
                                    const isDownloaded = isTrackDownloaded(track.trackId);
                                    const downloadProgress = getDownloadProgress(track.trackId);
                                    const isDownloading = downloadProgress !== undefined;

                                    const canPlay = !isOffline || isDownloaded;

                                    return (
                                        <div
                                            key={track.trackId}
                                            className={`w-full flex items-center justify-between p-2 pl-4 rounded-lg group border border-transparent transition-all ${
                                                isPlayingThis ? 'bg-brand-surface border-brand-accent/30 shadow-lg' :
                                                isSyncActive ? 'bg-brand-accent/5 border-brand-accent/10 hover:border-brand-accent/30' :
                                                'bg-brand-surface-light hover:border-brand-text-secondary/20'
                                            } ${!canPlay ? 'opacity-50 grayscale' : ''}`}
                                        >
                                            {/* iOS PWA VoiceOver rule (shazacin-product): every icon-only <button>
                                                must have a <span className="sr-only"> child — iOS WKWebView
                                                standalone mode silently drops aria-label on <button>. */}
                                            <button
                                                onClick={() => {
                                                    if (!canPlay) return;
                                                    isPlayingThis ? useStore.getState().togglePlayPause() : playTrack(title, track);
                                                }}
                                                className={`flex-1 text-left min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-md p-1 ${!canPlay ? 'cursor-not-allowed' : ''}`}
                                                aria-label={isPlayingThis ? `Pause ${track.name}` : `Play ${track.name}`}
                                            >
                                                <span className="sr-only">{isPlayingThis ? `Pause ${track.name}` : `Play ${track.name}`}</span>
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <MarqueeText
                                                        text={track.name}
                                                        className={`font-semibold flex-1 ${isPlayingThis ? 'text-brand-accent' : 'group-hover:text-brand-primary'}`}
                                                    />
                                                    {isDownloaded && <div className="p-0.5 bg-green-500 rounded flex-shrink-0 flex items-center justify-center" title="Available offline">
                                                        <Icon name="check" className="w-3 h-3 text-white" />
                                                    </div>}
                                                </div>
                                                <p className="text-sm text-brand-text-secondary">{track.narrator || 'Official Narration'}</p>
                                                {isPlayingThis ? (
                                                    <p className="text-xs text-brand-accent mt-0.5 animate-pulse">Now Playing...</p>
                                                ) : isSyncActive ? (
                                                    <p className="text-xs text-brand-accent mt-0.5 flex items-center gap-1">
                                                        <Icon name="forward" className="w-3 h-3" /> Ready to Sync
                                                    </p>
                                                ) : null}
                                                {inQueue && !isPlayingThis && <p className="text-xs text-green-400 mt-0.5">In Queue</p>}
                                                {!canPlay && <p className="text-xs text-brand-accent mt-0.5 font-bold">Online Only (Connect to play)</p>}
                                            </button>
                                            <div className="flex items-center">
                                                {!isDownloaded && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); downloadTrack(track); }}
                                                        className={`p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-full ${isDownloading ? 'animate-pulse text-brand-primary' : 'text-brand-text-secondary hover:text-white'}`}
                                                        aria-label={isDownloading ? `Downloading ${track.name}` : `Download ${track.name} for offline`}
                                                        disabled={isDownloading || isOffline}
                                                    >
                                                        <span className="sr-only">{isDownloading ? `Downloading ${track.name}` : `Download ${track.name} for offline`}</span>
                                                        <Icon name="forward" className={`w-6 h-6 rotate-90 transform ${isDownloading ? 'scale-110' : ''}`} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleAddToQueue(track)}
                                                    className={`p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-full ${inQueue ? 'text-green-400' : 'text-brand-text-secondary hover:text-white'}`}
                                                    aria-label={inQueue ? `In queue: ${track.name}` : `Add ${track.name} to queue`}
                                                    disabled={inQueue || (!canPlay && !inQueue)}
                                                >
                                                    <span className="sr-only">{inQueue ? `In queue: ${track.name}` : `Add ${track.name} to queue`}</span>
                                                    <Icon name={inQueue ? 'check' : 'plus'} className="w-6 h-6" />
                                                </button>
                                                {/* Play/Pause icon button — REMOVED (was duplicate of the
                                                    name-button above). The name-button is the canonical
                                                    play target; right-hand cluster is now Download + Queue
                                                    only, matching Spotify/Apple Music row layout. */}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2 border-t border-white/10 pt-4">
                    {title.actors && title.actors.length > 0 && (
                        <p>
                            <span className="font-semibold text-brand-accent">
                                {title.type === 'chapter' ? 'Readers:' : (title.type === 'book' ? 'Voice Actor:' : 'Actors:')}
                            </span> {title.actors.join(', ')}
                        </p>
                    )}
                    {title.directors && title.directors.length > 0 && (
                        <p><span className="font-semibold text-brand-accent">Director(s):</span> {title.directors.join(', ')}</p>
                    )}
                    {title.writers && title.writers.length > 0 && (
                        <p><span className="font-semibold text-brand-accent">Writer(s):</span> {title.writers.join(', ')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TitleDetailPage;