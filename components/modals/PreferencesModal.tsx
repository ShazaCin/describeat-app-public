import React from 'react';
import Modal from '../ui/Modal';
import useStore from '../../hooks/useStore';
import NotificationSettings from '../notifications/NotificationSettings';

const PreferencesModal: React.FC = () => {
    const { isPreferencesOpen, closePreferences, viewMode, toggleViewMode, downloadedTrackIds, removeAllDownloadedTracks } = useStore();

    const handlePermissionChange = (permission: NotificationPermission) => {
        console.log('[Settings] Notification permission changed to:', permission);
    };

    return (
        <Modal
            isOpen={isPreferencesOpen}
            onClose={closePreferences}
            title="Settings"
            ariaLabelledBy="preferences-modal-title"
        >
            <div className="space-y-6 px-1">
                {/* --- APPEARANCE --- */}
                <section>
                    <h3 className="text-lg font-bold text-brand-primary flex items-center gap-2 mb-3">
                        Appearance
                    </h3>
                    <div className="bg-brand-surface-light p-4 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Home View Mode</p>
                                <p className="text-sm text-brand-text-secondary">Choose how you browse titles</p>
                            </div>
                            <div className="flex bg-brand-bg p-1 rounded-xl" role="radiogroup" aria-label="Home view mode">
                                <button
                                    onClick={() => viewMode !== 'grid' && toggleViewMode()}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text-secondary'}`}
                                    role="radio"
                                    aria-checked={viewMode === 'grid'}
                                    tabIndex={viewMode === 'grid' ? 0 : -1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                                            e.preventDefault();
                                            toggleViewMode();
                                        }
                                    }}
                                >
                                    Grid
                                </button>
                                <button
                                    onClick={() => viewMode !== 'list' && toggleViewMode()}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text-secondary'}`}
                                    role="radio"
                                    aria-checked={viewMode === 'list'}
                                    tabIndex={viewMode === 'list' ? 0 : -1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                                            e.preventDefault();
                                            toggleViewMode();
                                        }
                                    }}
                                >
                                    List
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- NOTIFICATIONS --- */}
                <section>
                    <h3 className="text-lg font-bold text-brand-primary flex items-center gap-2 mb-3">
                        Push Notifications
                    </h3>
                    <div className="bg-brand-surface-light p-4 rounded-2xl">
                        <NotificationSettings onPermissionChange={handlePermissionChange} />
                    </div>
                </section>

                {/* --- DOWNLOADS --- */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-brand-primary flex items-center gap-2">
                            Offline Content
                        </h3>
                        {downloadedTrackIds.length > 0 && (
                            <button
                                onClick={() => {
                                    if (confirm("Remove all downloaded tracks?")) {
                                        removeAllDownloadedTracks();
                                    }
                                }}
                                className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors bg-red-400/10 px-2 py-1 rounded-md"
                            >
                                Empty Cache
                            </button>
                        )}
                    </div>
                    <div className="bg-brand-surface-light p-4 rounded-2xl">
                        <p className="text-sm text-brand-text-secondary">
                            {downloadedTrackIds.length === 0
                                ? 'No tracks downloaded yet.'
                                : `${downloadedTrackIds.length} tracks saved.`}
                        </p>
                    </div>
                </section>

                {/* --- HELP --- */}
                <section>
                    <h3 className="text-lg font-bold text-brand-primary flex items-center gap-2 mb-3">
                        Help & Info
                    </h3>
                    <div className="bg-brand-surface-light p-4 rounded-2xl">
                        <p className="text-sm text-brand-text-secondary">Version {import.meta.env.VITE_APP_VERSION || '3.0.2'}</p>
                    </div>
                </section>

                <div className="text-right pt-4">
                    <button
                        onClick={closePreferences}
                        className="w-full bg-brand-primary py-3 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PreferencesModal;