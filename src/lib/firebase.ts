import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';

// The public Firebase web config is served by the firebase-config edge function
// (apiKey is a public identifier — security comes from Firebase authorized
// domains + Firestore security rules, not from hiding the key).
const CONFIG_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/firebase-config`;

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

let promise: Promise<FirebaseServices> | null = null;

export function getFirebase(): Promise<FirebaseServices> {
  if (!promise) {
    promise = (async () => {
      const res = await fetch(CONFIG_URL);
      if (!res.ok) throw new Error(`firebase-config fetch failed: ${res.status}`);
      const config = await res.json();
      if (!config.apiKey || !config.projectId) throw new Error('invalid firebase config');
      const app = initializeApp(config);
      const auth = getAuth(app);
      // Offline persistence: reads/writes survive without network and sync on reconnect
      const db = initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      });
      return { app, auth, db };
    })();
    promise.catch(() => { promise = null; }); // allow retry after a failed init
  }
  return promise;
}
