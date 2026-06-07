import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import {
  debugAuthEvent,
  debugAuthError,
  isAuthTokenError,
  getAuthHostInfo,
  PUBLISHED_LOVABLE_URL,
  buildPublishedGoogleOAuthUrl,
  getAuthBridgeReturnOrigin,
  readBridgeTokensFromHash,
  buildBridgeReturnUrl,
  buildGoogleRedirectUri,
} from '@/lib/authDebug';

interface AuthContextType {
  user: User | null;
  session: Session | null;
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

function clearLocalUserCaches() {
  try {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('mm-cache-') || k.startsWith('mm-sync-queue-')) {
        localStorage.removeItem(k);
      }
    });
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    try { return localStorage.getItem(GUEST_KEY) === '1'; } catch { return false; }
  });

  const handleSignedOut = useCallback(() => {
    setSession(null);
    setUser(null);
    clearLocalUserCaches();
  }, []);

  useEffect(() => {
    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      debugAuthEvent(event, newSession);
      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
        case 'USER_UPDATED':
        case 'INITIAL_SESSION':
          setSession(newSession);
          setUser(newSession?.user ?? null);
          if (newSession?.user) {
            setIsGuest(false);
            try { localStorage.removeItem(GUEST_KEY); } catch {}
          }
          break;
        case 'SIGNED_OUT':
          handleSignedOut();
          break;
        case 'PASSWORD_RECOVERY':
          setSession(newSession);
          setUser(newSession?.user ?? null);
          break;
        default:
          setSession(newSession);
          setUser(newSession?.user ?? null);
      }
      setLoading(false);
    });

    // THEN check current session — validate with the server so expired tokens are caught
    (async () => {
      try {
        const host = getAuthHostInfo();
        if (!host.oauthSupported && window.location.pathname.startsWith('/~oauth')) {
          window.location.replace(buildPublishedGoogleOAuthUrl(window.location.origin));
          return;
        }

        const bridgeReturn = getAuthBridgeReturnOrigin();
        const bridgeTokens = readBridgeTokensFromHash();

        if (bridgeTokens) {
          const { data, error } = await supabase.auth.setSession(bridgeTokens);
          if (error) throw error;
          setSession(data.session);
          setUser(data.session?.user ?? null);

          if (bridgeReturn && data.session) {
            const params = new URLSearchParams(window.location.search);
            window.location.replace(buildBridgeReturnUrl(data.session, bridgeReturn, params.get('auth_bridge_path') || '/'));
            return;
          }

          window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
          return;
        }

        if (bridgeReturn) {
          const { data: { session: bridgeSession } } = await supabase.auth.getSession();
          if (bridgeSession) {
            const params = new URLSearchParams(window.location.search);
            window.location.replace(buildBridgeReturnUrl(bridgeSession, bridgeReturn, params.get('auth_bridge_path') || '/'));
            return;
          }
        }

        const { data: { session: existing } } = await supabase.auth.getSession();
        if (existing) {
          // Verify the session is still valid server-side
          const { data: { user: verified }, error } = await supabase.auth.getUser();
          if (error || !verified) {
            // Token invalid/expired — sign out cleanly
            await supabase.auth.signOut().catch(() => {});
            handleSignedOut();
          } else {
            setSession(existing);
            setUser(verified);
          }
        }
      } catch (e) {
        debugAuthError('initial-getUser', e);
      } finally {
        setLoading(false);
      }
    })();

    const onUnhandled = (e: PromiseRejectionEvent) => {
      if (isAuthTokenError(e.reason)) {
        debugAuthError('unhandled-token', e.reason);
        supabase.auth.signOut().catch(() => {});
        handleSignedOut();
      }
    };
    window.addEventListener('unhandledrejection', onUnhandled);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('unhandledrejection', onUnhandled);
    };
  }, [handleSignedOut]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    const host = getAuthHostInfo();
    if (!host.oauthSupported) {
      // Third-party hosts like Vercel cannot serve /~oauth/* directly. Start the
      // managed OAuth broker on the published Lovable URL, then bridge the session
      // back to this host after Google completes.
      window.location.href = buildPublishedGoogleOAuthUrl(window.location.href);
      return;
    }
    const { lovable } = await import('@/integrations/lovable/index');
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: buildGoogleRedirectUri(),
    });
    if (result.error) {
      debugAuthError('google-oauth', result.error);
      throw result.error;
    }
  };

  const logout = async () => {
    try { await supabase.auth.signOut(); } catch {}
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
    <AuthContext.Provider value={{ user, session, loading, isGuest, login, register, loginWithGoogle, logout, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
