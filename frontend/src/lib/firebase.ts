import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging'; // Import MessagePayload
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
  if (!messaging) return;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY_FROM_FIREBASE_SETTINGS', // Replace this!
      });
      if (currentToken) {
        await updateUserProfile({ fcmToken: currentToken });
      }
    }
  } catch (error) {
    console.error('An error occurred while retrieving FCM token.', error);
  }
};

// --- THIS IS THE FIX ---
// We now explicitly type the Promise to return a 'MessagePayload'.
export const onMessageListener = (): Promise<MessagePayload> =>
  new Promise((resolve) => {
    if (messaging) {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    }
  });

export { db, messaging };