import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

/**
 * Initialize Firebase only when valid config is present.
 * Falls back to a disabled mode if env vars are missing (dev preview).
 */
function initFirebase(): void {
  const isConfigured = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;

  if (!isConfigured) {
    // Don't crash the dev server when env isn't configured.
    console.warn(
      '[Firebase] Missing environment configuration. Auth + Firestore features will be disabled. ' +
        'Set VITE_FIREBASE_* vars in .env.local to enable.',
    );
    return;
  }

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.error('[Firebase] Initialization failed:', err);
  }
}

initFirebase();

export { app, auth, db, storage };
export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
