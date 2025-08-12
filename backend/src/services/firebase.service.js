import admin from 'firebase-admin';
import { promises as fs } from 'fs';
import path from 'path';

let isFirebaseInitialized = false;

export const initializeFirebaseAdmin = async () => {
    if (isFirebaseInitialized) return;

    try {
        const serviceAccountPath = path.resolve(process.cwd(), 'firebase-service-account.json');
        const serviceAccount = JSON.parse(await fs.readFile(serviceAccountPath, 'utf8'));

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        console.log('Firebase Admin SDK initialized successfully.');
        isFirebaseInitialized = true;
    } catch (error) {
        console.error('CRITICAL: Firebase Admin SDK initialization failed.', error.message);
    }
};

export const sendPushNotification = async (fcmToken, title, body, data = {}) => {
    if (!isFirebaseInitialized || !fcmToken) return;

    const message = { token: fcmToken, notification: { title, body }, data };

    try {
        await admin.messaging().send(message);
        console.log(`Successfully sent notification to token: ${fcmToken}`);
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
};