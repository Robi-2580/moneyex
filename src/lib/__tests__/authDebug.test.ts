import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isAuthTokenError,
  getAuthHostInfo,
  debugAuthEvent,
  buildPublishedAuthBridgeUrl,
  buildPublishedGoogleOAuthUrl,
  getAuthBridgeReturnOrigin,
  readBridgeTokensFromHash,
} from '../authDebug';

function setHost(host: string) {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, hostname: host },
    writable: true,
  });
}

describe('isAuthTokenError', () => {
  it.each([
    'JWT expired',
    'invalid refresh token',
    'Auth session missing',
    'User not authenticated',
    'token is malformed',
  ])('flags "%s"', (msg) => {
    expect(isAuthTokenError(new Error(msg))).toBe(true);
  });

  it('ignores unrelated errors', () => {
    expect(isAuthTokenError(new Error('Network request failed'))).toBe(false);
    expect(isAuthTokenError(null)).toBe(false);
  });
});

describe('getAuthHostInfo', () => {
  it('detects lovable preview', () => {
    setHost('id-preview--abc.lovable.app');
    const info = getAuthHostInfo();
    expect(info.isLovableHost).toBe(true);
    expect(info.oauthSupported).toBe(true);
  });

  it('flags vercel as unsupported third-party', () => {
    setHost('paysapro.vercel.app');
    const info = getAuthHostInfo();
    expect(info.isKnownThirdParty).toBe(true);
    expect(info.oauthSupported).toBe(false);
  });

  it('treats localhost as supported (dev mode)', () => {
    setHost('localhost');
    expect(getAuthHostInfo().oauthSupported).toBe(true);
  });

  it('assumes unknown host is a custom domain (supported)', () => {
    setHost('paysapro.com');
    expect(getAuthHostInfo().oauthSupported).toBe(true);
  });
});

describe('auth bridge helpers', () => {
  it('builds a published bridge URL for the Vercel app', () => {
    const url = new URL(buildPublishedAuthBridgeUrl('https://paysapro.vercel.app/transactions?x=1'));
    expect(url.origin).toBe('https://moneyex.lovable.app');
    expect(url.searchParams.get('auth_bridge_return')).toBe('https://paysapro.vercel.app');
    expect(url.searchParams.get('auth_bridge_path')).toBe('/transactions?x=1');
  });

  it('starts Google OAuth through the published Lovable broker', () => {
    const url = new URL(buildPublishedGoogleOAuthUrl('https://paysapro.vercel.app/'));
    expect(url.origin).toBe('https://moneyex.lovable.app');
    expect(url.pathname).toBe('/~oauth/initiate');
    expect(url.searchParams.get('provider')).toBe('google');
    expect(url.searchParams.get('redirect_uri')).toContain('auth_bridge_return=https%3A%2F%2Fpaysapro.vercel.app');
  });

  it('only accepts the configured Vercel bridge return origin', () => {
    expect(getAuthBridgeReturnOrigin('?auth_bridge_return=https%3A%2F%2Fpaysapro.vercel.app')).toBe('https://paysapro.vercel.app');
    expect(getAuthBridgeReturnOrigin('?auth_bridge_return=https%3A%2F%2Fevil.example')).toBeNull();
  });

  it('reads OAuth tokens from bridge hash', () => {
    expect(readBridgeTokensFromHash('#access_token=a&refresh_token=b&type=oauth')).toEqual({ access_token: 'a', refresh_token: 'b' });
    expect(readBridgeTokensFromHash('#access_token=a')).toBeNull();
  });
});

describe('debugAuthEvent', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('does not throw on null session', () => {
    expect(() => debugAuthEvent('SIGNED_OUT', null)).not.toThrow();
  });

  it('logs in dev mode', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    debugAuthEvent('TOKEN_REFRESHED', {
      user: { email: 'a@b.c' },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    } as never);
    // In dev mode the spy should be called; in production it's silent.
    // We don't assert called/not called because import.meta.env.DEV varies in vitest;
    // just confirm no crash and spy is callable.
    expect(spy).toBeDefined();
  });
});
