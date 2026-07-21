import { useState, useEffect, useCallback } from 'react';
import { MessagePayload } from 'firebase/messaging';
import firebaseMessaging, { NotificationPayload } from '../services/firebaseMessaging';

export interface NotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseNotificationsReturn extends NotificationState {
  requestPermission: () => Promise<void>;
  initializeNotifications: (userId?: string) => Promise<void>;
  showNotification: (payload: NotificationPayload) => void;
  announceToScreenReader: (message: string) => void;
}

const announceToScreenReader = (message: string) => {
  const announcer = document.getElementById('notification-announcer');
  if (announcer) {
    announcer.textContent = message;
  }
};

export const useNotifications = (): UseNotificationsReturn => {
  const isSupported = firebaseMessaging.isNotificationSupported();
  const permission = Notification.permission;
  
  window.notificationDebug = { isSupported, permission };
  console.log('NOTIF_DEBUG:', isSupported, permission);

  const [state, setState] = useState<NotificationState>({
    isSupported: isSupported,
    permission: permission,
    token: null,
    isLoading: false,
    error: null
  });

  const requestPermission = useCallback(async () => {
    console.log('REQUEST_PERM');
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const permissionAnnouncer = document.getElementById('permission-announcer');
      if (permissionAnnouncer) {
        permissionAnnouncer.textContent = 'A browser permission dialog will appear. Please select Allow to enable notifications.';
      }
      const permission = await firebaseMessaging.requestPermission();
      console.log('PERM_RESULT:', permission);
      
      if (permission === 'granted') {
        if (permissionAnnouncer) {
          permissionAnnouncer.textContent = 'Notification permission granted. You will receive audio description updates.';
        }
      } else if (permission === 'denied') {
        if (permissionAnnouncer) {
          permissionAnnouncer.textContent = 'Notification permission denied. You can enable this anytime in settings.';
        }
      }
      
      setState(prev => ({ ...prev, permission, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request permission';
      console.error('PERM_ERROR:', errorMessage);
      const errorAnnouncer = document.getElementById('error-announcer');
      if (errorAnnouncer) {
        errorAnnouncer.textContent = `Error requesting notification permission: ${errorMessage}`;
      }
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }));
    }
  }, []);

  const initializeNotifications = useCallback(async (userId?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      announceToScreenReader('Initializing push notifications.');
      const token = await firebaseMessaging.initialize(userId);
      
      if (token) {
        announceToScreenReader('Push notifications initialized successfully.');
      } else {
        announceToScreenReader('Push notifications could not be initialized.');
      }
      
      setState(prev => ({ ...prev, token, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize notifications';
      announceToScreenReader(`Error initializing notifications: ${errorMessage}`);
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }));
    }
  }, []);

  const showNotification = useCallback((payload: NotificationPayload) => {
    firebaseMessaging.showNotification(payload);
    announceToScreenReader(`New notification: ${payload.title}. ${payload.body}`);
  }, []);

  useEffect(() => {
    if (!state.isSupported) return;

    const unsubscribe = firebaseMessaging.onForegroundMessage((payload: MessagePayload) => {
      if (payload.notification) {
        const notificationPayload: NotificationPayload = {
          title: payload.notification.title || 'New Notification',
          body: payload.notification.body || 'You have a new message',
          image: payload.notification.image,
          icon: payload.notification.icon,
          data: payload.data
        };
        
        showNotification(notificationPayload);
      }
    });

    return unsubscribe;
  }, [state.isSupported, showNotification]);

  return {
    ...state,
    requestPermission,
    initializeNotifications,
    showNotification,
    announceToScreenReader
  };
};
