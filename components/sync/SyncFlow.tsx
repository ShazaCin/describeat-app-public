import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../../hooks/useStore';
import Icon from '../ui/Icon';
import { useNavigate } from 'react-router-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { Title, ClosestMatch } from '../../types';

const SyncFlow: React.FC = () => {
    const { 
        syncState, 
        cancelSync, 
        matchResult, 
        setSyncState, 
        requestPermissionAndRecord, 
        closestMatches, 
        selectSuggestion,
        titles
    } = useStore();
    const [progress, setProgress] = useState(0);
    const navigate = useNavigate();
    const modalRef = useFocusTrap<HTMLDivElement>(syncState !== 'idle');

    // Hydrate suggestions with title data from the store
    const hydratedSuggestions = useMemo(() => {
        return closestMatches.map(match => {
            const title = titles.find(t => t.titleId === match.song_name);
            return { match, title, confidencePercent: match.confidencePercent || 0 };
        }).sort((a, b) => b.confidencePercent - a.confidencePercent);
    }, [closestMatches, titles]);

const startRef = useRef<number>(0);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        if (syncState === 'recording' || syncState === 'matching') {
            const totalDuration = syncState === 'recording' ? 10000 : 4000;
            startRef.current = Date.now();
            setProgress(0);

            const updateProgress = () => {
                const elapsed = Date.now() - startRef.current;
                const pct = Math.min(100, (elapsed / totalDuration) * 100);
                setProgress(pct);
                if (pct < 100) {
                    rafRef.current = requestAnimationFrame(updateProgress);
                }
            };

            rafRef.current = requestAnimationFrame(updateProgress);
            return () => cancelAnimationFrame(rafRef.current);
        } else {
            setProgress(0);
        }
    }, [syncState]);

    const renderContent = () => {
        switch (syncState) {
            case 'permission':
                return (
                    <div className="text-center space-y-4">
                        <Icon name="info" className="w-16 h-16 text-brand-accent mx-auto" />
                        <h2 id="sync-permission-title" className="text-2xl font-bold">Almost there!</h2>
                        <p className="text-brand-text-secondary">We'll record a 10-second sample of what you're watching to identify it and sync the audio description.</p>
                        <button onClick={requestPermissionAndRecord} className="bg-brand-primary px-6 py-3 rounded-lg font-semibold hover:bg-brand-secondary transition-colors">
                            ASK PERMISSION
                        </button>
                    </div>
                );
            case 'denied':
                return (
                    <div className="text-center space-y-4">
                        <Icon name="stop" className="w-16 h-16 text-brand-secondary mx-auto" />
                        <h2 id="sync-denied-title" className="text-2xl font-bold">Microphone Access Denied</h2>
                        <p className="text-brand-text-secondary">To use the sync feature, please enable microphone access for this site in your browser settings.</p>
                        <button onClick={cancelSync} className="bg-brand-primary px-6 py-3 rounded-lg font-semibold hover:bg-brand-secondary transition-colors">
                            GOT IT
                        </button>
                    </div>
                );
            case 'recording':
            case 'matching':
                return (
                    <div className="text-center space-y-6">
                        <h2 className="text-4xl font-bold">
                            {syncState === 'recording' ? 'Recording...' : 'Finding Match'}
                        </h2>
                        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                            {/* Visualizer/Spinner would go here */}
                             <div className="absolute inset-0 border-8 border-brand-surface-light rounded-full"></div>
                             <motion.div 
                                className="absolute inset-0 border-8 border-brand-primary rounded-full"
                                style={{ clipPath: `inset(0% ${100 - progress}% 0% 0%)` }}
                                transition={{ duration: 0.1, ease: "linear" }}
                             />
                            <p className="text-3xl font-mono">{Math.floor(progress)}%</p>
                        </div>
<p className="text-brand-text-secondary">
                           {syncState === 'recording' ? 'Listening for 10 seconds...' : 'Analyzing audio signature...'}
                        </p>
                        <button onClick={cancelSync} className="bg-brand-primary/20 text-brand-text-secondary hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                            Cancel
                        </button>
                    </div>
                );
            case 'results':
                if (!matchResult) {
                    return (
                        <div className="text-center space-y-4">
                            <h2 className="text-2xl font-bold">No Match Found</h2>
                            <p className="text-brand-text-secondary">We couldn't identify the media. Please try again in a quieter environment.</p>
                            <button onClick={() => setSyncState('idle')} className="bg-brand-primary px-6 py-3 rounded-lg font-semibold w-full">
                                TRY AGAIN
                            </button>
                        </div>
                    );
                }
                return (
                    <div className="text-left space-y-4">
                        <h2 className="text-2xl font-bold text-center">Match Found!</h2>
                        <div className="p-4 bg-brand-surface-light rounded-lg">
                            <div className="flex items-start gap-4 mb-4">
                                <img src={matchResult.images.poster} alt={matchResult.title} className="w-20 h-28 object-cover rounded shadow-lg flex-shrink-0"/>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold">{matchResult.title}</h3>
                                    <p className="text-brand-text-secondary">{matchResult.year} &middot; {matchResult.rated}</p>
                                    <p className="text-sm text-brand-accent font-bold mt-1">Confirmed Match</p>
                                </div>
                            </div>
                             <button 
                                onClick={() => {
                                    // Confident matches already have syncSession initialized in useStore
                                    navigate(`/title/${matchResult.titleId}`);
                                    setSyncState('idle'); // Close the modal
                                    useStore.setState({ isSyncing: false });
                                }} 
                                className="w-full text-center bg-brand-primary py-3 rounded-lg font-bold shadow-lg transform active:scale-95 transition-transform"
                            >
                                OPEN TITLE
                            </button>
                        </div>
                        <button onClick={() => setSyncState('idle')} className="w-full text-center text-brand-text-secondary hover:text-white py-2">
                            Not what you're watching? Try Again
                        </button>
                    </div>
                );
            case 'suggestions':
                return (
                    <div className="text-left space-y-4 max-h-[70vh] flex flex-col">
                        <h2 className="text-2xl font-bold text-center flex-shrink-0">Possible Matches</h2>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                            {hydratedSuggestions.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (item.title) {
                                            selectSuggestion(item.match, item.title);
                                            navigate(`/title/${item.title.titleId}`);
                                        }
                                    }}
                                    className="w-full text-left p-3 bg-brand-surface-light rounded-lg border border-white/5 hover:border-brand-accent/30 transition-colors flex items-start gap-3 group focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                                >
                                    <img src={item.title?.images.poster || '/assets/logo.svg'} alt="" className="w-16 h-24 object-cover rounded shadow flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold truncate group-hover:text-brand-accent transition-colors">
                                            {item.title?.title || item.match.song_name}
                                        </h3>
                                        {item.title ? (
                                            <p className="text-sm text-brand-text-secondary">
                                                {item.title.year} · {item.title.rated}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-brand-accent">Title match: {item.match.song_name}</p>
                                        )}
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-xs font-bold text-brand-accent px-2 py-0.5 bg-brand-accent/10 rounded-full">
                                                {item.confidencePercent}% Match
                                            </span>
                                            <div className="bg-brand-primary px-3 py-1 rounded text-sm font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                SELECT
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => { setSyncState('idle'); requestPermissionAndRecord(); }}
                            className="w-full text-brand-text-secondary hover:text-white py-3 border-t border-white/10 font-semibold flex-shrink-0">
                            Try Again
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            {syncState !== 'idle' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={
                        syncState === 'permission' ? 'sync-permission-title' : 
                        syncState === 'denied' ? 'sync-denied-title' : undefined
                    }
                >
                    <motion.div
                        ref={modalRef}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-brand-surface p-6 rounded-xl w-[90vw] max-w-sm relative"
                    >
                         <button onClick={cancelSync} className="absolute top-3 right-3 text-brand-text-secondary" aria-label="Close sync flow">
                            <Icon name="close" className="w-6 h-6" />
                        </button>
                        {renderContent()}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SyncFlow;