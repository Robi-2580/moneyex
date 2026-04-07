import { db, auth } from './firebase';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';

// Each user's data is stored as a single document: users/{uid}/data/state
function getUserDocRef() {
  const user = auth.currentUser;
  if (!user) return null;
  return doc(db, 'users', user.uid, 'data', 'state');
}

export async function saveStateToFirestore(state: any) {
  const ref = getUserDocRef();
  if (!ref) return;
  try {
    await setDoc(ref, {
      ...state,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Firestore save error:', e);
  }
}

export async function loadStateFromFirestore(): Promise<any | null> {
  const ref = getUserDocRef();
  if (!ref) return null;
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      // Remove Firestore-specific fields
      const { updatedAt, ...state } = data;
      return state;
    }
    return null;
  } catch (e) {
    console.error('Firestore load error:', e);
    return null;
  }
}

export function subscribeToFirestore(callback: (state: any) => void): Unsubscribe | null {
  const ref = getUserDocRef();
  if (!ref) return null;
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const { updatedAt, ...state } = snap.data();
      callback(state);
    }
  });
}
