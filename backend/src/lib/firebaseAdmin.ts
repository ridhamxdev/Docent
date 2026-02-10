import admin from 'firebase-admin';
import * as path from 'path';

// Check if already initialized to prevent errors during hot reload
if (!admin.apps.length) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const serviceAccount = require(path.join(process.cwd(), 'serviceAccountKey.json'));

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("✅ Firebase Admin Initialized");
    } catch (error) {
        console.error("❌ Failed to initialize Firebase Admin:", error);
    }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
