import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { updateUserProfile } from './actions/user.actions'; // For saving the token

// Your web app's Firebase configuration from your .env.local file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore Database (from your original file)
const db = getFirestore(app);

// Initialize Firebase Cloud Messaging
const messaging = (typeof window !== "undefined") ? getMessaging(app) : null;

/**
 * Gets the user's FCM token and saves it to their profile on the backend.
 * This is necessary to send them push notifications.
 */
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
        console.log('FCM Token received:', currentToken);
        // Save the token to the user's profile
        await updateUserProfile({ fcmToken: currentToken });
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    }
  } catch (error) {
    console.error('An error occurred while retrieving FCM token.', error);
  }
};

/**
 * Listens for incoming push notifications when the app is in the foreground.
 * @returns A promise that resolves with the notification payload.
 */
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    }
  });

// Export both the database and the messaging instance
export { db, messaging };