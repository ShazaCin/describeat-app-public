import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import useStore from '../../hooks/useStore';

const Header = React.memo(() => {
  const { openMenu, openSearch, openPlayer, openNotifications, isOffline, notifications } = useStore();
  const unreadCount = notifications.filter(n => !n.read).length;
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 h-16 bg-brand-bg/80 backdrop-blur-md border-b border-brand-surface flex items-center justify-between" role="banner">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-brand-accent rounded-md outline-none" aria-label="Go to home page">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm" aria-hidden="true">
            <img src="/assets/logo.svg" alt="" className="h-7 w-7" />
          </div>
        </Link>
        {isOffline && (
          <div className="px-2 py-0.5 bg-brand-accent text-[10px] font-bold rounded uppercase tracking-wider animate-pulse" role="status" aria-live="polite" title="Offline — only downloaded content is available">
            Offline
          </div>
        )}
      </div>
      <nav className="flex items-center gap-4" aria-label="Header navigation">
        <button onClick={openPlayer} aria-label="Open playlist" className="text-brand-text-secondary hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-brand-accent rounded-full outline-none">
          <Icon name="headphones" />
          <span className="sr-only">Open playlist</span>
        </button>
        <button onClick={() => {
          openMenu();
          localStorage.setItem('menuInitialView', 'notifications');
        }} aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`} className="relative text-brand-text-secondary hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-brand-accent rounded-full outline-none">
          <Icon name="notification" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm" aria-hidden="true">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <span className="sr-only">{`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}</span>
        </button>
        <button onClick={openSearch} aria-label="Search" className="text-brand-text-secondary hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-brand-accent rounded-full outline-none">
          <Icon name="search" />
          <span className="sr-only">Search</span>
        </button>
        <button onClick={openMenu} aria-label="Open menu" className="text-brand-text-secondary hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-brand-accent rounded-full outline-none">
          <Icon name="menu" />
          <span className="sr-only">Open menu</span>
        </button>
      </nav>
    </header>
  );
});

const BottomNav = React.memo(() => {
  const { openFeedback, openPreferences } = useStore();
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 h-20 bg-brand-bg/80 backdrop-blur-sm flex items-center justify-around" role="contentinfo">
      <button onClick={openPreferences} className="flex flex-col items-center gap-1 text-brand-text-secondary hover:text-white focus-visible:text-brand-accent transition-colors w-24 outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-lg" aria-label="Tips and information">
        <Icon name="info" className="w-7 h-7" />
        <span className="text-xs font-medium">Tips & Info</span>
      </button>
      <div className="w-24" />
      <button onClick={openFeedback} className="flex flex-col items-center gap-1 text-brand-text-secondary hover:text-white focus-visible:text-brand-accent transition-colors w-24 outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-lg" aria-label="Send feedback">
        <Icon name="feedback" className="w-7 h-7" />
        <span className="text-xs font-medium">Feedback</span>
      </button>
    </footer>
  );
});

const SyncButton = React.memo(() => {
  const { startSync, isSyncing, syncState } = useStore();
  const isRecording = isSyncing && (syncState === 'recording' || syncState === 'matching');

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <button
        onClick={startSync}
        aria-label={isRecording ? "Stop matching" : "Start matching"}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform-gpu focus-visible:ring-4 focus-visible:ring-brand-accent outline-none ${isRecording ? 'bg-brand-secondary scale-110' : 'bg-brand-accent hover:scale-110'}`}
        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
      >
        <Icon name={isRecording ? 'stop' : 'microphone'} className="w-10 h-10 text-brand-bg" />
        <span className="sr-only">{isRecording ? "Stop matching" : "Start matching"}</span>
      </button>
    </div>
  );
});

const Layout: React.FC = () => {
  const { nowPlaying } = useStore();
  const hasActivePlayer = !!nowPlaying;

  return (
    <div className="relative h-full w-full bg-brand-bg">
      <Header />
      <main className={`pt-16 ${hasActivePlayer ? 'pb-16' : 'pb-20'} h-full overflow-y-auto`} role="main">
        <Outlet />
      </main>
      {!hasActivePlayer && <SyncButton />}
      {!hasActivePlayer && <BottomNav />}
    </div>
  );
};

export default Layout;