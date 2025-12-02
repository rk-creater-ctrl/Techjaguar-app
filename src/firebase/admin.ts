import * as admin from 'firebase-admin';

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  
  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
    throw new Error('Could not initialize Firebase Admin SDK. Please check server logs and environment variables.');
  }
}

let adminDbInstance: admin.firestore.Firestore | null = null;

export function getAdminDb() {
  if (!adminDbInstance) {
    initializeAdminApp();
    adminDbInstance = admin.firestore();
  }
  return adminDbInstance;
}
