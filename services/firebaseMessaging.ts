import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, deleteToken, onMessage, MessagePayload, Messaging } from 'firebase/messaging';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

// Compat SDK imports (used on iOS to match Firebase blog post exactly)
import firebase from 'firebase/compat/app';
import 'firebase/compat/messaging';

// Import shared Firebase configuration
import { firebaseConfig, vapidKey } from '../config/firebase';

const TOKEN_STORAGE_KEY = 'fcm_registration_token';

// Lazy initialization - modular SDK
let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

function getFirebaseMessaging(): Messaging {
  if (!app) {
    console.log('[Firebase] Lazy initializing Firebase app...');
    app = initializeApp(firebaseConfig);
  }
  if (!messaging) {
    console.log('[Firebase] Lazy initializing Firebase Messaging...');
    messaging = getMessaging(app);
  }
  return messaging;
}

// Lazy initialization - compat SDK
let compatApp: firebase.app.App | null = null;
let compatMessaging: firebase.messaging.Messaging | null = null;

function getCompatMessaging(): firebase.messaging.Messaging {
  if (!compatApp) {
    console.log('[Firebase] Lazy initializing compat Firebase app...');
    compatApp = firebase.initializeApp(firebaseConfig);
  }
  if (!compatMessaging) {
    console.log('[Firebase] Lazy initializing compat Firebase Messaging...');
    compatMessaging = compatApp.messaging();
  }
  return compatMessaging;
}

export interface NotificationPayload {
  title: string;
  body: string;
  image?: string;
  icon?: string;
  badge?: string;
  data?: {
    url?: string;
    [key: string]: any;
  };
}

class FirebaseMessagingService {
  private isSupported: boolean = false;
  private token: string | null = null;
  private isIOSBelow16: boolean = false;

  constructor() {
    this.isSupported = typeof Notification !== 'undefined';
    this.loadTokenFromStorage();
    this.isIOSBelow16 = this.checkIOSBelow16();
  }

  private checkIOSBelow16(): boolean {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    if (!isIOS) return false;
    const match = ua.match(/OS (\d+)_/);
    if (!match) return false;
    return parseInt(match[1], 10) < 16;
  }

  isUnsupportedIOS(): boolean {
    return this.isIOSBelow16;
  }

  private loadTokenFromStorage(): void {
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (stored) {
        this.token = stored;
        console.log('[Firebase] Token loaded from storage:', this.token.substring(0, 20) + '...');
      }
    } catch (error) {
      console.error('[Firebase] Error loading token from storage:', error);
    }
  }

  private saveTokenToStorage(token: string): void {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      console.log('[Firebase] Token saved to storage');
    } catch (error) {
      console.error('[Firebase] Error saving token to storage:', error);
    }
  }

  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  async requestPermission(): Promise<NotificationPermission> {
    console.log('[Firebase] requestPermission called');
    try {
      const permission = await Notification.requestPermission();
      console.log('[Firebase] Notification permission result:', permission);
      return permission;
    } catch (error) {
      console.error('[Firebase] Error requesting permission:', error);
      throw error;
    }
  }

  async getRegistrationToken(): Promise<string | null> {
    try {
      console.log('[Firebase] getRegistrationToken called');
      if (!this.isSupported) {
        console.error('[Firebase] Push notifications not supported');
        return null;
      }

      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
      console.log('[Firebase] Platform:', isIOS ? 'iOS PWA' : 'other');

      if (isIOS) {
        // iOS PWA: use compat SDK exactly as the Firebase blog post demonstrates.
        // The compat SDK's getToken() has different internal SW discovery logic
        // that works better on Safari/iOS.
        console.log('[Firebase] iOS: using compat SDK (matching Firebase blog post)');
        const msg = getCompatMessaging();

        // Brief wait for SW
        try {
          await Promise.race([
            navigator.serviceWorker.ready,
            new Promise(r => setTimeout(r, 5000))
          ]);
        } catch (_) {}

        for (let attempt = 1; attempt <= 10; attempt++) {
          try {
            console.log(`[Firebase] iOS compat getToken attempt ${attempt}...`);
            // compat API: messaging.getToken({ vapidKey }) returns Promise<string>
            const t = await msg.getToken({ vapidKey });
            if (t) {
              console.log('[Firebase] iOS got token:', t.substring(0, 30) + '...');
              this.token = t;
              this.saveTokenToStorage(t);
              return t;
            }
            console.log(`[Firebase] iOS compat getToken attempt ${attempt} returned null`);
          } catch (e: any) {
            console.error(`[Firebase] iOS compat getToken attempt ${attempt} error:`, e?.code, e?.message);
          }
          if (attempt < 10) {
            await new Promise(r => setTimeout(r, 3000));
          }
        }
        console.log('[Firebase] iOS: all 10 compat getToken attempts exhausted');
        return null;
      }

      // Non-iOS: modular SDK approach
      const msgMod = getFirebaseMessaging();

      let swReg: ServiceWorkerRegistration | undefined;
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          swReg = reg;
        } catch (_) {}
      }

      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          const t = await getToken(msgMod, { vapidKey, serviceWorkerRegistration: swReg });
          if (t) {
            this.token = t;
            this.saveTokenToStorage(t);
            return t;
          }
        } catch (e) {
          console.warn(`[Firebase] getToken attempt ${attempt}:`, e);
        }
        if (attempt < 5) await new Promise(r => setTimeout(r, 1000));
      }

      console.log('[Firebase] No registration token available');
      return null;
    } catch (error) {
      console.error('[Firebase] Error getting registration token:', error);
      return null;
    }
  }

  getCurrentToken(): string | null {
    console.log('[Firebase] getCurrentToken called, returning:', this.token ? this.token.substring(0, 20) + '...' : 'null');
    return this.token;
  }

  async fetchAndCacheToken(): Promise<string | null> {
    console.log('[Firebase] fetchAndCacheToken called');
    if (Notification.permission === 'granted') {
      console.log('[Firebase] Permission is granted, calling getRegistrationToken');
      return this.getRegistrationToken();
    } else {
      console.log('[Firebase] Permission not granted:', Notification.permission);
      return null;
    }
  }

  onForegroundMessage(callback: (payload: MessagePayload) => void): () => void {
    try {
      const msg = getFirebaseMessaging();
      return onMessage(msg, (payload) => {
        console.log('[Firebase] Foreground message received:', payload);
        callback(payload);
      });
    } catch (error) {
      console.warn('[Firebase] Cannot listen for foreground messages:', error);
      return () => {};
    }
  }

  showNotification(payload: NotificationPayload): void {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return;
    }
    const options: NotificationOptions & Record<string, any> = {
      body: payload.body,
      icon: payload.icon || '/assets/logo.svg',
      badge: payload.badge || '/assets/logo.svg',
      image: payload.image as string | undefined,
      data: payload.data,
      requireInteraction: true,
      actions: [
        { action: 'open', title: 'Open App' },
        { action: 'close', title: 'Close' }
      ]
    };
    const notification = new Notification(payload.title, options);
    notification.onclick = () => {
      window.focus();
      if (payload.data?.url) {
        window.location.href = payload.data.url;
      }
      notification.close();
    };
  }

  async sendTokenToServer(token: string, userId?: string): Promise<void> {
    try {
      await getCurrentUser();
      const session = await fetchAuthSession();
      const cognitoToken = session?.tokens?.idToken?.toString() || 'jwt-token-placeholder';
      console.log('[Firebase] Sending token to server:', { token: token.substring(0, 20) + '...', userId });
      const response = await fetch('https://5iub6lxbcf.execute-api.eu-west-1.amazonaws.com/prod/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cognitoToken}`
        },
        body: JSON.stringify({
          token,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: this.getPlatform(),
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timestamp: Date.now()
          }
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('[Firebase] Token registered successfully:', result);
    } catch (error) {
      console.error('[Firebase] Error sending token to server:', error);
      localStorage.setItem('pendingFCMToken', JSON.stringify({ token, userId, timestamp: Date.now() }));
    }
  }

  private async getCognitoToken(): Promise<string> {
    try {
      await getCurrentUser();
      const session = await fetchAuthSession();
      const token = session?.tokens?.idToken?.toString() || 'jwt-token-placeholder';
      return token;
    } catch (error) {
      console.error('[Firebase] Error getting Cognito token:', error);
      return 'jwt-token-placeholder';
    }
  }

  private getPlatform(): string {
    const userAgent = navigator.userAgent;
    if (/Android/i.test(userAgent)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
    if (/Windows/i.test(userAgent)) return 'Windows';
    if (/Mac/i.test(userAgent)) return 'macOS';
    if (/Linux/i.test(userAgent)) return 'Linux';
    return 'Web';
  }

  async retryPendingTokenRegistration(): Promise<void> {
    try {
      const pending = localStorage.getItem('pendingFCMToken');
      if (pending) {
        const { token, userId } = JSON.parse(pending);
        await this.sendTokenToServer(token, userId);
        localStorage.removeItem('pendingFCMToken');
      }
    } catch (error) {
      console.error('[Firebase] Error retrying token registration:', error);
    }
  }

  async initialize(userId?: string): Promise<string | null> {
    try {
      const token = await this.getRegistrationToken();
      if (token && userId) {
        await this.sendTokenToServer(token, userId);
      }
      return token;
    } catch (error) {
      console.error('[Firebase] Error initializing push notifications:', error);
      return null;
    }
  }

  async unregisterToken(): Promise<void> {
    try {
      if (!messaging) {
        this.token = null;
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        console.log('[Firebase] No messaging instance, cleared local state');
        return;
      }
      const tokenToDelete = this.token || localStorage.getItem(TOKEN_STORAGE_KEY);
      if (tokenToDelete) {
        console.log('[Firebase] Unregistering token:', tokenToDelete.substring(0, 20) + '...');
        try {
          const cognitoToken = await this.getCognitoToken();
          await fetch('https://fwdfav6nx7suulfqwtwetagswu0yqfmt.lambda-url.eu-west-1.on.aws/register', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${cognitoToken}`
            },
            body: JSON.stringify({ token: tokenToDelete })
          });
          console.log('[Firebase] Token deleted from server');
        } catch (e) {
          console.error('[Firebase] Error deleting token from server:', e);
        }
        await deleteToken(messaging);
        this.token = null;
        messaging = null;
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        console.log('[Firebase] Token deleted from Firebase and local storage');
      }
    } catch (error) {
      console.error('[Firebase] Error unregistering token:', error);
    }
  }
}

export const firebaseMessaging = new FirebaseMessagingService();
export default firebaseMessaging;