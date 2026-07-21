import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let messagingInstance: ReturnType<typeof getMessaging> | null = null;

export function initFirebaseMessaging(_swRegistration: ServiceWorkerRegistration): void {
  try {
    const app = initializeApp(firebaseConfig);
    messagingInstance = getMessaging(app);

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    
    getToken(messagingInstance, { vapidKey })
      .then((token) => {
        console.log('FCM Token:', token);
      })
      .catch((err) => {
        console.error('FCM token error:', err);
      });

    onMessage(messagingInstance, (payload) => {
      console.log('Foreground FCM message received:', payload);
    });
  } catch (error) {
    console.error('Firebase messaging initialization error:', error);
  }
}

export function getFCMToken(): Promise<string | null> {
  if (!messagingInstance) {
    console.warn('Firebase messaging not initialized');
    return Promise.resolve(null);
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  
  return getToken(messagingInstance, { vapidKey })
    .then((token) => token)
    .catch((err) => {
      console.error('Error getting FCM token:', err);
      return null;
    });
}
