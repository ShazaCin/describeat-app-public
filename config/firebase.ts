import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// Firebase configuration — replace with your own Firebase project values.
// See the README for instructions on setting up Firebase Cloud Messaging.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export { firebaseConfig };

export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || "YOUR_VAPID_KEY";
