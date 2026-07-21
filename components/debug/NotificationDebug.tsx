import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationDebug: React.FC = () => {
  const { token, permission, isSupported, requestPermission } = useNotifications();
  const [manualToken, setManualToken] = useState('');
  const [showInstructions, setShowInstructions] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const skipLinkRef = useRef<HTMLAnchorElement>(null);

  // Auto-request permission when component loads
  useEffect(() => {
    const autoRequestPermission = async () => {
      if (permission === 'default' && isSupported) {
        try {
          console.log('Auto-requesting notification permission...');
          if ('Notification' in window) {
            const result = await Notification.requestPermission();
            console.log('Auto permission result:', result);
            // Announce to screen readers
            const announcer = document.getElementById('permission-announcer');
            if (announcer) {
              announcer.textContent = `Notification permission ${result}. ${result === 'granted' ? 'You will receive notifications.' : 'You can enable notifications in settings.'}`;
            }
          }
        } catch (error) {
          console.error('Auto permission error:', error);
          const announcer = document.getElementById('error-announcer');
          if (announcer) {
            announcer.textContent = `Error requesting notification permission: ${error}`;
          }
        }
      }
    };
    
    // Delay to ensure page is loaded
    setTimeout(autoRequestPermission, 2000);
  }, [permission, isSupported]);

  // Handle skip link for keyboard navigation
  const handleSkipLink = (e: React.MouseEvent) => {
    e.preventDefault();
    if (panelRef.current) {
      panelRef.current.focus();
    }
  };

  if (!isSupported) {
    return (
      <>
        {/* Skip link for keyboard navigation */}
        <a
          ref={skipLinkRef}
          href="#notification-debug"
          onClick={handleSkipLink}
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:right-0 focus:z-50 focus:p-4 focus:bg-brand-surface focus:text-brand-text focus:rounded-b-lg"
        >
          Skip to notification settings
        </a>
        
        <div 
          id="notification-debug"
          ref={panelRef}
          role="region"
          aria-label="Push notification status panel"
          className="fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg max-w-sm z-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
          tabIndex={-1}
        >
          <h3 className="font-bold">Push Notifications Not Supported</h3>
          <p className="text-sm">Your browser doesn't support push notifications</p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Skip link for keyboard navigation */}
      <a
        ref={skipLinkRef}
        href="#notification-debug"
        onClick={handleSkipLink}
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:right-0 focus:z-50 focus:p-4 focus:bg-brand-surface focus:text-brand-text focus:rounded-b-lg"
      >
        Skip to notification settings
      </a>
      
      <div 
        id="notification-debug"
        ref={panelRef}
        role="region"
        aria-label="Push notification status panel"
        className="fixed top-4 right-4 bg-brand-surface text-brand-text p-4 rounded-lg max-w-sm shadow-lg z-50 border border-brand-surface-light focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
        tabIndex={-1}
      >
        <h1 className="font-bold mb-3 text-brand-primary">Firebase Push Notifications</h1>
        
        <div className="space-y-3 text-sm">
          <div>
            <h2 className="font-semibold">Permission Status:</h2>
            <p 
              className="text-brand-text-secondary"
              role="status"
              aria-live="polite"
            >
              {permission.toUpperCase()}
            </p>
          </div>
          
          {permission === 'granted' && token && (
            <div>
              <h2 className="font-semibold">FCM Token for Testing:</h2>
              <label htmlFor="fcm-token-display" className="sr-only">
                Firebase Cloud Messaging token for testing notifications
              </label>
              <textarea 
                id="fcm-token-display"
                value={token}
                readOnly
                className="w-full bg-brand-bg text-brand-text p-2 rounded mt-2 text-xs font-mono border border-brand-surface-light h-24 resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                aria-describedby="token-instructions"
              />
              <p id="token-instructions" className="text-xs text-brand-text-secondary mt-1">
                Copy this entire token to test Firebase notifications
              </p>
            </div>
          )}
          
          {permission !== 'granted' && (
            <div>
              <h2 className="font-semibold">Enable Notifications:</h2>
              <div className="mt-2 space-y-2">
                <p className="text-xs text-brand-text-secondary">
                  To enable notifications:
                </p>
                <ol 
                  className="list-decimal list-inside text-xs text-brand-text-secondary space-y-1"
                  role="list"
                >
                  <li role="listitem">Look for a bell icon (🔔) in your browser's address bar</li>
                  <li role="listitem">Click it and select "Allow"</li>
                  <li role="listitem">Or press F5 to refresh - browser may ask automatically</li>
                  <li role="listitem">In Chrome: Click the lock icon → Notifications → Allow</li>
                </ol>
                <p className="text-xs text-brand-text-secondary mt-2">
                  Current status: <span role="status" aria-live="polite">{permission}</span>
                </p>
              </div>
            </div>
          )}
          
          {!token && permission === 'granted' && (
            <div>
              <h2 className="font-semibold">Getting Token...</h2>
              <p className="text-xs text-brand-text-secondary">
                Please sign in to generate your FCM token
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDebug;
