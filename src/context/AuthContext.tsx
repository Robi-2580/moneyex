import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirebase } from '@/lib/firebase';

// Minimal user shape that mirrors what the UI already consumes
// (user.id, user.email, user.user_metadata.full_name).
export interface AppUser {
  id: string;
  email: string | null;
  user_metadata: { full_name?: string; name?: string; avatar_url?: string };
  app_metadata: { provider?: string; providers: string[]; email_verified: boolean };
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const GUEST_KEY = 'mm-guest-mode';

function mapUser(u: FirebaseUser | null): AppUser | null {
  if (!u) return null;
  return {
    id: u.uid,
    email: u.email,
    user_metadata: { full_name: u.displayName || undefined, name: u.displayName || undefined },
  };
}

function clearLocalUserCaches() {
  try {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('mm-cache-') || k.startsWith('mm-sync-queue-')) {
        localStorage.removeItem(k);
      }
    });
  } catch {}
}

/** Translate Firebase auth error codes into friendly Bengali messages. */
function friendlyError(err: any): Error {
  const code = err?.code || '';
  const map: Record<string, string> = {
    'auth/invalid-credential': 'ইমেইল বা পাসওয়ার্ড ভুল হয়েছে',
    'auth/wrong-password': 'পাসওয়ার্ড ভুল হয়েছে',
    'auth/user-not-found': 'এই ইমেইলে কোনো অ্যাকাউন্ট নেই',
    'auth/email-already-in-use': 'এই ইমেইলে আগেই অ্যাকাউন্ট আছে, সাইন ইন করুন',
    'auth/weak-password': 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে',
    'auth/invalid-email': 'ইমেইল ঠিকানা সঠিক নয়',
    'auth/popup-closed-by-user': 'লগইন উইন্ডো বন্ধ হয়ে গেছে',
    'auth/cancelled-popup-request': '',
    'auth/popup-blocked': 'ব্রাউজার পপ-আপ ব্লক করেছে — পপ-আপ allow করুন',
    'auth/unauthorized-domain': 'এই ডোমেইন Firebase-এ authorized নয় — Firebase Console-এ যোগ করুন',
    'auth/network-request-failed': 'ইন্টারনেট সংযোগ নেই',
    'auth/too-many-requests': 'অনেকবার চেষ্টা হয়েছে, কিছুক্ষণ পর আবার করুন',
  };
  if (code === 'auth/cancelled-popup-request') return new Error('');
  return new Error(map[code] || err?.message || 'কিছু একটা ভুল হয়েছে');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    try { return localStorage.getItem(GUEST_KEY) === '1'; } catch { return false; }
  });

  const handleSignedOut = useCallback(() => {
    setUser(null);
    clearLocalUserCaches();
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        const { auth } = await getFirebase();
        if (cancelled) return;
        // Firebase persists the session in IndexedDB by default, so returning
        // users are restored automatically. Token refresh is handled by the SDK.
        unsubscribe = onAuthStateChanged(auth, (fbUser) => {
          const mapped = mapUser(fbUser);
          setUser(mapped);
          if (mapped) {
            setIsGuest(false);
            try { localStorage.removeItem(GUEST_KEY); } catch {}
          } else {
            clearLocalUserCaches();
          }
          setLoading(false);
        });
      } catch (e) {
        console.error('[auth] firebase init failed', e);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { auth } = await getFirebase();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      throw friendlyError(e);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { auth } = await getFirebase();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() }).catch(() => {});
        setUser(mapUser(auth.currentUser));
      }
    } catch (e) {
      throw friendlyError(e);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { auth } = await getFirebase();
      const provider = new GoogleAuthProvider();
      // Popup flow works on ANY authorized domain — Vercel, Lovable, custom — no bridge needed.
      await signInWithPopup(auth, provider);
    } catch (e) {
      const err = friendlyError(e);
      if (err.message) throw err; // empty message = cancelled popup, stay silent
    }
  };

  const logout = async () => {
    try {
      const { auth } = await getFirebase();
      await signOut(auth);
    } catch {}
    handleSignedOut();
    setIsGuest(false);
    try { localStorage.removeItem(GUEST_KEY); } catch {}
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setLoading(false);
    try { localStorage.setItem(GUEST_KEY, '1'); } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, login, register, loginWithGoogle, logout, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
