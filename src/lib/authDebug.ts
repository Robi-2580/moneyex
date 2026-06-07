// Dev-mode auth debugging + host detection for OAuth.
// In production this stays mostly silent; in dev it prints every auth event.

import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const isDev = import.meta.env.DEV;

// Hosts where Lovable's managed OAuth broker (/~oauth/*) is proxied automatically.
// All `*.lovable.app` previews and any custom domain attached via Lovable settings work.
// Third-party hosts (e.g. *.vercel.app, *.netlify.app, *.pages.dev) are NOT proxied
// and Google login will fail there unless the user attaches the domain to Lovable
// or configures their own Google OAuth credentials.
const LOVABLE_HOST_RE = /\.lovable\.(app|dev)$/i;
const KNOWN_THIRD_PARTY_RE = /\.(vercel\.app|netlify\.app|pages\.dev|onrender\.com|fly\.dev)$/i;

export function getAuthHostInfo() {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocal = /^(localhost|127\.|0\.0\.0\.0|::1)/.test(host);
  const isLovableHost = LOVABLE_HOST_RE.test(host);
  const isKnownThirdParty = KNOWN_THIRD_PARTY_RE.test(host);
  // We assume any non-third-party, non-lovable, non-local host is a custom domain
  // (which the user is responsible for attaching to Lovable Cloud).
  const oauthSupported = isLocal || isLovableHost || !isKnownThirdParty;
  return { host, isLocal, isLovableHost, isKnownThirdParty, oauthSupported };
}

// Canonical Lovable-published URL where managed Google OAuth always works.
// Users on third-party hosts can be redirected here to complete sign-in.
export const PUBLISHED_LOVABLE_URL = 'https://moneyex.lovable.app';

export function debugAuthEvent(event: AuthChangeEvent, session: Session | null) {
  if (!isDev) return;
  const expiresIn = session?.expires_at
    ? `${Math.round(session.expires_at - Date.now() / 1000)}s`
    : 'n/a';
  // eslint-disable-next-line no-console
  console.info(
    `%c[auth] ${event}`,
    'color:#3b82f6;font-weight:bold',
    { user: session?.user?.email ?? null, expiresIn }
  );
}

export function debugAuthError(where: string, err: unknown) {
  if (!isDev) return;
  // eslint-disable-next-line no-console
  console.warn(`%c[auth:err] ${where}`, 'color:#ef4444;font-weight:bold', err);
}

export function isAuthTokenError(err: unknown): boolean {
  const msg = String((err as { message?: string })?.message || err || '');
  return /jwt|token|expired|invalid.*refresh|not.*authenticated|session.*missing/i.test(msg);
}
