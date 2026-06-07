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
export const AUTH_BRIDGE_RETURN_PARAM = 'auth_bridge_return';
export const AUTH_BRIDGE_PATH_PARAM = 'auth_bridge_path';

const AUTH_BRIDGE_ALLOWED_ORIGINS = ['https://paysapro.vercel.app'];

function getOrigin(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.origin : null;
  } catch {
    return null;
  }
}

export function isAllowedAuthBridgeReturn(value: string | null | undefined) {
  const origin = getOrigin(value);
  return !!origin && AUTH_BRIDGE_ALLOWED_ORIGINS.includes(origin);
}

export function getAuthBridgeReturnOrigin(search = typeof window !== 'undefined' ? window.location.search : '') {
  const params = new URLSearchParams(search);
  const rawReturn = params.get(AUTH_BRIDGE_RETURN_PARAM);
  return isAllowedAuthBridgeReturn(rawReturn) ? getOrigin(rawReturn) : null;
}

export function buildPublishedAuthBridgeUrl(returnUrl: string) {
  const source = new URL(returnUrl);
  const target = new URL(PUBLISHED_LOVABLE_URL);
  target.searchParams.set(AUTH_BRIDGE_RETURN_PARAM, source.origin);
  target.searchParams.set(AUTH_BRIDGE_PATH_PARAM, `${source.pathname}${source.search}`);
  return target.toString();
}

export function buildGoogleRedirectUri() {
  const bridgeReturn = getAuthBridgeReturnOrigin();
  if (typeof window === 'undefined') return PUBLISHED_LOVABLE_URL;
  if (!bridgeReturn) return window.location.origin;

  const redirect = new URL('/', window.location.origin);
  redirect.searchParams.set(AUTH_BRIDGE_RETURN_PARAM, bridgeReturn);
  const path = new URLSearchParams(window.location.search).get(AUTH_BRIDGE_PATH_PARAM);
  if (path) redirect.searchParams.set(AUTH_BRIDGE_PATH_PARAM, path);
  return redirect.toString();
}

export function readBridgeTokensFromHash(hash = typeof window !== 'undefined' ? window.location.hash : '') {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (!access_token || !refresh_token) return null;
  return { access_token, refresh_token };
}

export function buildBridgeReturnUrl(session: Session, returnOrigin: string, returnPath = '/') {
  const target = new URL(returnPath.startsWith('/') ? returnPath : '/', returnOrigin);
  const hash = new URLSearchParams({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    token_type: session.token_type || 'bearer',
    expires_at: String(session.expires_at || ''),
    expires_in: String(Math.max(0, Math.round((session.expires_at || 0) - Date.now() / 1000))),
    type: 'oauth',
    auth_bridge: '1',
  });
  target.hash = hash.toString();
  return target.toString();
}

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
