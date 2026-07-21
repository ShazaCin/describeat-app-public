import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../../hooks/useStore';
// FIX: Import IconName type to correctly type icon properties.
import Icon, { type IconName } from '../ui/Icon';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { signOut } from 'aws-amplify/auth';
import { firebaseMessaging } from '../../services/firebaseMessaging';

const MainMenu: React.FC = () => {
    const {
        isMenuOpen,
        closeMenu,
        startSync,
        openPreferences,
        openFeedback,
        notifications,
        markNotificationRead,
        removeNotification,
        clearNotifications,
        menuViewState,
        openMenu,
        openNotifications
    } = useStore();
    const menuRef = useFocusTrap<HTMLDivElement>(isMenuOpen);
    const navigate = useNavigate();

    const [permissionState, setPermissionState] = React.useState<NotificationPermission>(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );
    const [token, setToken] = React.useState<string | null>(null);
    const [tokenLoading, setTokenLoading] = React.useState(false);
    const [currentView, setCurrentView] = React.useState<'menu' | 'notifications' | 'settings'>(() => {
        const stored = localStorage.getItem('menuInitialView');
        if (stored === 'notifications' || stored === 'settings') {
            localStorage.removeItem('menuInitialView');
            return stored;
        }
        return 'menu';
    });
    const [isHelpOpen, setIsHelpOpen] = React.useState(false);

    // Fetch token when settings view opens
    React.useEffect(() => {
        if (currentView === 'settings' && !token && !tokenLoading && permissionState === 'granted') {
            const fetchToken = async () => {
                setTokenLoading(true);
                try {
                    const currentToken = firebaseMessaging.getCurrentToken();
                    if (currentToken) {
                        setToken(currentToken);
                        console.log('Token retrieved:', currentToken);
                    } else {
                        // Try to fetch if not cached
                        const fetchedToken = await firebaseMessaging.fetchAndCacheToken();
                        if (fetchedToken) {
                            setToken(fetchedToken);
                            console.log('Token fetched:', fetchedToken);
                        } else {
                            console.log('No token available');
                            setToken('Push notifications couldn\'t be set up. Try again later.');
                        }
                    }
                } catch (err) {
                    console.error('Error fetching token:', err);
                    setToken('Error fetching token');
                } finally {
                    setTokenLoading(false);
                }
            };
            fetchToken();
        }
    }, [currentView, token, tokenLoading, permissionState]);

    const handleRequestPermission = async () => {
        console.log('[MainMenu] handleRequestPermission called');
        if (typeof Notification !== 'undefined') {
            try {
                console.log('[MainMenu] Notification API available');
                console.log('[MainMenu] Firebase messaging imported');
                const permission = await firebaseMessaging.requestPermission();
                console.log('[MainMenu] Permission result:', permission);
                setPermissionState(permission);
                if (permission === 'granted') {
                    const token = firebaseMessaging.getCurrentToken();
                    console.log('[MainMenu] Token retrieved:', token ? token.substring(0, 20) + '...' : 'null');
                    if (token) {
                        setToken(token);
                    }
                }
            } catch (err) {
                console.error('[MainMenu] Error requesting permission:', err);
            }
        } else {
            console.error('[MainMenu] Notification API not available');
        }
    };

    const handleItemClick = (action?: () => void) => {
        closeMenu();
        // Use a timeout to ensure the menu closing animation starts before a new modal opens.
        if (action) {
            setTimeout(action, 150);
        }
    };

    // FIX: Explicitly type the MENU_ITEMS array to ensure `icon` is of type `IconName`.
    const MENU_ITEMS: { name: string; icon: IconName; action?: () => void | Promise<void> }[] = [
        { name: 'Start Matching', icon: 'microphone', action: startSync },
        { name: 'Browse', icon: 'list', action: () => navigate('/') },
        { name: 'Notifications', icon: 'notification', action: () => setCurrentView('notifications') },
        { name: 'Settings', icon: 'info', action: () => { closeMenu(); setTimeout(openPreferences, 150); } },
        { name: 'Feedback', icon: 'feedback', action: openFeedback },
        {
            name: 'Sign out', icon: 'close', action: async () => {
                try {
                    await signOut();
                } catch (error) {
                    console.error("Error signing out:", error);
                }
            }
        },
    ];

    return (
        <AnimatePresence>
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60"
                    onClick={closeMenu}
                >
                    <motion.div
                        ref={menuRef}
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-[85vw] max-w-sm h-full bg-brand-primary text-white flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Main Menu"
                    >
                        <header className="p-6 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <img src="/assets/logo.svg" alt="describeAT" className="h-10" />
                                <span className="text-2xl font-bold tracking-tighter">describeAT</span>
                            </div>
                            <button onClick={closeMenu} aria-label="Close menu">
                                <Icon name="close" className="w-7 h-7" />
                            </button>
                        </header>
                        <nav className="flex-1 bg-white text-brand-bg p-6 rounded-tl-3xl overflow-y-auto">
                            {currentView === 'menu' ? (
                                <ul className="space-y-4">
                                    {MENU_ITEMS.map(item => (
                                        <li key={item.name}>
                                            <button
                                                onClick={async () => {
                                                    if (item.action) {
                                                        const result = item.action();
                                                        // Ensure we handle both sync and async actions correctly
                                                        if (result instanceof Promise) {
                                                            await result;
                                                        }
                                                        
                                                        // Only call handleItemClick if it's not a special case that stays open or handles navigation differently
                                                        if (item.name !== 'Notifications' && item.name !== 'Settings') {
                                                            handleItemClick();
                                                        }
                                                    }
                                                }}
                                                className="w-full flex items-center gap-4 text-lg font-medium p-3 rounded-xl hover:bg-brand-primary-light/10 focus-visible:ring-2 focus-visible:ring-brand-primary focus:outline-none transition-colors text-left"
                                            >
                                                <Icon name={item.icon} className="w-6 h-6 text-brand-primary" />
                                                <span>{item.name}</span>
                                                {item.name === 'Notifications' && notifications.filter(n => !n.read).length > 0 && (
                                                    <span className="ml-auto bg-brand-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                        {notifications.filter(n => !n.read).length}
                                                    </span>
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : currentView === 'notifications' ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <button
                                            onClick={() => setCurrentView('menu')}
                                            className="flex items-center gap-2 text-brand-primary font-medium"
                                        >
                                            <Icon name="chevronLeft" className="w-5 h-5" />
                                            Back
                                        </button>
                                        <h3 className="text-xl font-bold">Notifications</h3>
                                        <button
                                            onClick={() => setIsHelpOpen(true)}
                                            className="text-brand-primary hover:text-brand-primary/80 transition-colors"
                                            aria-label="Help with notifications"
                                        >
                                            <Icon name="info" className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {notifications.length > 0 && (
                                        <div className="flex justify-end mb-2">
                                            <button
                                                onClick={() => {
                                                    if (confirm("Clear all notifications?")) {
                                                        clearNotifications();
                                                    }
                                                }}
                                                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    )}

                                    {permissionState !== 'granted' && (
                                        <div className="bg-brand-accent/10 border border-brand-accent/20 p-4 rounded-xl mb-6">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-brand-accent/20 rounded-full mt-0.5">
                                                    <Icon name="notification" className="w-5 h-5 text-brand-accent" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-brand-bg">Notifications are off</p>
                                                    <p className="text-xs text-brand-bg/70 mt-1">Enable notifications to never miss an update when the app is in the background.</p>
                                                    {/iPad|iPhone|iPod/.test(navigator.userAgent) ? (
                                                        <div className="mt-3 space-y-2">
                                                            <p className="text-xs text-brand-bg/70 font-semibold">On iPhone:</p>
                                                            <ol className="text-xs text-brand-bg/70 list-decimal list-inside space-y-1">
                                                                <li>Add this app to your home screen</li>
                                                                <li>Open it from home screen</li>
                                                                <li>Go to Settings and enable notifications</li>
                                                            </ol>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleRequestPermission()}
                                                            className="mt-3 w-full bg-brand-accent text-brand-bg py-2 rounded-lg text-xs font-bold hover:bg-brand-accent/90 transition-colors"
                                                        >
                                                            Enable Notifications
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {notifications.length === 0 ? (
                                        <div className="text-center py-12 opacity-40">
                                            <Icon name="notification" className="w-12 h-12 mx-auto mb-2" />
                                            <p>No notifications yet.</p>
                                        </div>
                                    ) : (
                                        <ul className="space-y-3">
                                            {notifications.map(n => (
                                                <li
                                                    key={n.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    className={`p-3 rounded-lg border ${n.read ? 'bg-gray-50 border-gray-100' : 'bg-brand-primary/5 border-brand-primary/10 shadow-sm'} cursor-pointer hover:border-brand-primary/30 transition-all`}
                                                    onClick={() => markNotificationRead(n.id)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); markNotificationRead(n.id); } }}
                                                >
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className={`font-bold text-sm truncate ${n.read ? 'text-gray-700' : 'text-brand-primary'}`}>{n.title}</h4>
                                                                {!n.read && <div className="w-2 h-2 bg-brand-primary rounded-full shrink-0" />}
                                                            </div>
                                                            <p className="text-xs text-gray-600 line-clamp-2">{n.body}</p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeNotification(n.id);
                                                            }}
                                                            className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 focus:outline-none"
                                                            aria-label="Delete notification"
                                                        >
                                                            <Icon name="close" className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 mt-2 block font-medium">
                                                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.timestamp).toLocaleDateString()}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <button
                                            onClick={() => setCurrentView('menu')}
                                            className="flex items-center gap-2 text-brand-primary font-medium"
                                        >
                                            <Icon name="chevronLeft" className="w-5 h-5" />
                                            Back
                                        </button>
                                        <h3 className="text-xl font-bold">Settings</h3>
                                    </div>

                                    <div className="bg-brand-primary/5 border border-brand-primary/10 p-6 rounded-xl text-center space-y-3">
                                        <Icon name="info" className="w-8 h-8 text-brand-primary mx-auto" />
                                        <p className="text-sm text-brand-bg/70">Manage notifications and other preferences in the Preferences dialog.</p>
                                        <button
                                            onClick={() => { closeMenu(); setTimeout(openPreferences, 150); }}
                                            className="bg-brand-primary text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-brand-primary/90 transition-colors"
                                        >
                                            Open Preferences
                                        </button>
                                    </div>
                                </div>
                            )}
                        </nav>
                        <footer className="p-6 text-xs text-center opacity-80">
                            <p>&copy; 2019 - {new Date().getFullYear()} describeAT Version {import.meta.env.VITE_APP_VERSION || '3.0.2'}</p>
                            <p>by Shazacin Accessible Media</p>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
            {isHelpOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                    onClick={() => setIsHelpOpen(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-brand-bg">Enable Notifications</h3>
                            <button
                                onClick={() => setIsHelpOpen(false)}
                                className="text-brand-text-secondary hover:text-brand-bg transition-colors"
                                aria-label="Close help"
                            >
                                <Icon name="close" className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-4 text-brand-bg text-sm">
                            <div>
                                <p className="font-semibold mb-2">On Desktop/Android:</p>
                                <p className="text-brand-text-secondary">Tap "Enable Notifications" and allow the permission when prompted.</p>
                            </div>
                            <div>
                                <p className="font-semibold mb-2">On iPhone:</p>
                                <ol className="list-decimal list-inside space-y-1 text-brand-text-secondary">
                                    <li>Tap the share button (↗️) in Safari</li>
                                    <li>Select "Add to Home Screen"</li>
                                    <li>Open the app from your home screen</li>
                                    <li>Go to Notifications and tap "Enable Notifications"</li>
                                    <li>Allow the permission when prompted</li>
                                </ol>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MainMenu;
