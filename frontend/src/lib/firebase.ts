import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { updateUserProfile } from './actions/user.actions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const messaging = (typeof window !== "undefined") ? getMessaging(app) : null;

export const initializeFirebaseMessaging = async () => {
  if (typeof window === 'undefined' || !messaging) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, {
        // IMPORTANT: Replace this with your VAPID key from the Firebase Console
        vapidKey: 'YOUR_VAPID_KEY_FROM_FIREBASE_SETTINGS',
      });
      if (currentToken) {
        console.log('FCM Token received, saving to profile...');
        // --- THIS IS THE FIX ---
        // Save the token to the user's profile on the backend
        await updateUserProfile({ fcmToken: currentToken });
      } else {
        console.log('No registration token available.');
      }
    }
  } catch (error) {
    console.error('An error occurred while retrieving FCM token.', error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    }
  });

export { db, messaging };