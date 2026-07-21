// NotificationSettings - fixed push notification enablement
// Simplest approach: let the Firebase call itself determine if push is supported

import { useState } from 'react';
import { firebaseMessaging } from '../../services/firebaseMessaging';

interface NotificationSettingsProps {
  onPermissionChange: (permission: NotificationPermission) => void;
}

export default function NotificationSettings({ onPermissionChange }: NotificationSettingsProps) {
  const permission = typeof Notification !== 'undefined' ? Notification.permission : 'default';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  // Enabled state must reflect actual token existence, not just Notification.permission
  const [enabled, setEnabled] = useState(firebaseMessaging.getCurrentToken() !== null);

  const handleRequestPermission = async () => {
    setIsLoading(true);
    setError(null);
    setToken(null);
    setSupportError(null);
    setDisabled(false);

    try {
      // Check basic browser support first
      if (typeof Notification === 'undefined' || !('PushManager' in window)) {
        setSupportError('Push notifications not supported in this browser');
        setIsLoading(false);
        return;
      }

      const result = await Promise.race([
        firebaseMessaging.requestPermission(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out after 30s')), 30000)
        )
      ]);
      console.log('[NotificationSettings] Permission result:', result);

      if (result === 'granted') {
        // Use cached token first — avoids double-calling Firebase getToken()
        let fcmToken = firebaseMessaging.getCurrentToken();
        if (!fcmToken) {
          // Fallback: explicitly fetch if cache was empty
          fcmToken = await Promise.race([
            firebaseMessaging.getRegistrationToken(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Token request timed out — please try again')), 60000)
            )
          ]);
        }
        if (fcmToken) {
          console.log('[NotificationSettings] FCM Token obtained:', fcmToken.substring(0, 20) + '...');
          setToken(fcmToken);
          try {
            await firebaseMessaging.sendTokenToServer(fcmToken);
          } catch (serverErr) {
            console.warn('[NotificationSettings] Token send to server failed:', serverErr);
          }
          setEnabled(true);
          onPermissionChange('granted');
        } else {
          const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
          let platformHint = '';
          if (isIOS) {
            const match = navigator.userAgent.match(/OS (\d+)_(\d+)/);
            const version = match ? match[1] + '.' + match[2] : 'unknown';
            platformHint = ' (iOS ' + version + ', needs 16.4+)';
          }
          setError('Could not obtain FCM token' + platformHint + '. Check console for details.');
        }
      } else {
        setError('Permission was not granted: ' + result);
      }
    } catch (err: any) {
      console.error('[NotificationSettings] Error:', err);
      setError(err?.message || 'Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Blocked state
  if (permission === 'denied') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Push Notifications</span>
          <span className="text-xs text-red-500">Blocked</span>
        </div>
        <p className="text-xs text-brand-muted">Notifications are blocked. Please enable them in your browser settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="region" aria-label="Push notification settings">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Push Notifications</span>
        <span className="text-xs text-brand-muted">
          {disabled ? 'Disabled' : enabled ? 'Enabled' : 'Not enabled'}
        </span>
      </div>

      {supportError && (
        <p className="text-xs text-red-500" role="alert">{supportError}</p>
      )}

      {error && (
        <p className="text-xs text-red-500" role="alert">{error}</p>
      )}

      {token && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <p className="text-xs font-medium text-green-400 mb-1">FCM Token (send to admin to test push):</p>
          <p className="text-xs text-brand-muted break-all font-mono">{token}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <span className="text-xs text-brand-muted">
            {disabled ? 'Disabling...' : 'Enabling...'}
          </span>
        </div>
      ) : enabled || (token && !disabled) ? (
        <div className="space-y-3">
          <button
            onClick={handleRequestPermission}
            className="w-full py-2 px-4 rounded-lg bg-brand-primary text-white text-sm font-medium hover:bg-brand-primary/90 transition-colors"
          >
            Re-register Notifications
          </button>
          <button
            onClick={async () => {
              setIsLoading(true);
              setError(null);
              setDisabled(true);
              try {
                await firebaseMessaging.unregisterToken();
                setToken(null);
                setEnabled(false);
                setDisabled(false);
                onPermissionChange('default');
              } catch (err: any) {
                setDisabled(false);
                setError(err?.message || 'Failed to disable notifications');
              } finally {
                setIsLoading(false);
              }
            }}
            className="w-full py-2 px-4 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
          >
            Disable Notifications
          </button>
          {token && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-xs font-medium text-green-400 mb-1">FCM Token (send to admin to test push):</p>
              <p className="text-xs text-brand-muted break-all font-mono">{token}</p>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleRequestPermission}
          className="w-full py-2 px-4 rounded-lg bg-brand-primary text-white text-sm font-medium hover:bg-brand-primary/90 transition-colors"
        >
          Enable Notifications
        </button>
      )}
    </div>
  );
}