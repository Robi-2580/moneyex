import { useEffect, useState } from 'react';
import { Bug, X, Copy, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import {
  getAuthHostInfo,
  PUBLISHED_LOVABLE_URL,
  AUTH_BRIDGE_RETURN_PARAM,
  AUTH_BRIDGE_PATH_PARAM,
} from '@/lib/authDebug';

const LAST_REDIRECT_KEY = 'mm-auth-last-redirect';
const EVENT_LOG_KEY = 'mm-auth-event-log';
const MAX_EVENTS = 25;

type LoggedEvent = { ts: number; event: string; email: string | null; expiresIn: string };

// Public helpers used by AuthContext to feed the panel without import cycles.
export function recordAuthRedirect(url: string) {
  try { sessionStorage.setItem(LAST_REDIRECT_KEY, `${Date.now()}::${url}`); } catch {}
}
export function recordAuthEvent(event: string, email: string | null, expiresAt?: number) {
  try {
    const log: LoggedEvent[] = JSON.parse(sessionStorage.getItem(EVENT_LOG_KEY) || '[]');
    log.unshift({
      ts: Date.now(),
      event,
      email,
      expiresIn: expiresAt ? `${Math.round(expiresAt - Date.now() / 1000)}s` : 'n/a',
    });
    sessionStorage.setItem(EVENT_LOG_KEY, JSON.stringify(log.slice(0, MAX_EVENTS)));
  } catch {}
}

function isDebugEnabled() {
  if (import.meta.env.DEV) return true;
  if (typeof window === 'undefined') return false;
  if (new URLSearchParams(window.location.search).get('authdebug') === '1') {
    try { sessionStorage.setItem('mm-authdebug', '1'); } catch {}
    return true;
  }
  try { return sessionStorage.getItem('mm-authdebug') === '1'; } catch { return false; }
}

export default function AuthDebugPanel() {
  const { user, session, loading, isGuest } = useAuth();
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const [enabled] = useState(() => isDebugEnabled());

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [enabled]);

  if (!enabled) return null;

  const host = getAuthHostInfo();
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const bridgeReturn = search.get(AUTH_BRIDGE_RETURN_PARAM);
  const bridgePath = search.get(AUTH_BRIDGE_PATH_PARAM);
  const hasBridgeTokens = !!hash.get('access_token') && !!hash.get('refresh_token');
  const lastRedirectRaw = (() => {
    try { return sessionStorage.getItem(LAST_REDIRECT_KEY); } catch { return null; }
  })();
  const [lastRedirectTs, lastRedirectUrl] = lastRedirectRaw?.split('::') ?? [];
  const events: LoggedEvent[] = (() => {
    try { return JSON.parse(sessionStorage.getItem(EVENT_LOG_KEY) || '[]'); } catch { return []; }
  })();

  const expiresIn = session?.expires_at
    ? Math.round(session.expires_at - Date.now() / 1000)
    : null;
  const refreshSoon = expiresIn !== null && expiresIn < 120;

  const refreshNow = async () => {
    const { error } = await supabase.auth.refreshSession();
    if (error) recordAuthEvent('REFRESH_ERROR', error.message, undefined);
    setTick((t) => t + 1);
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const Row = ({ k, v, mono = true }: { k: string; v: React.ReactNode; mono?: boolean }) => (
    <div className="flex gap-2 py-0.5 text-[11px]">
      <span className="text-zinc-400 w-32 shrink-0">{k}</span>
      <span className={`flex-1 break-all ${mono ? 'font-mono' : ''}`}>{v}</span>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-[9999] w-11 h-11 rounded-full bg-zinc-900 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform border border-zinc-700"
        title="Auth Debug"
        aria-label="Toggle auth debug panel"
      >
        <Bug size={18} />
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 z-[9999] w-[380px] max-h-[80vh] overflow-y-auto bg-zinc-950 text-zinc-100 rounded-xl shadow-2xl border border-zinc-800 p-4 text-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bug size={14} className="text-amber-400" />
              <span className="font-bold">Auth Debug</span>
              {import.meta.env.DEV ? (
                <span className="px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-300 text-[10px]">DEV</span>
              ) : (
                <span className="px-1.5 py-0.5 rounded bg-amber-900 text-amber-300 text-[10px]">?authdebug=1</span>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white">
              <X size={14} />
            </button>
          </div>

          {/* Host */}
          <section className="mb-3 pb-3 border-b border-zinc-800">
            <h4 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Host</h4>
            <Row k="hostname" v={host.host} />
            <Row k="oauthSupported" v={
              <span className={host.oauthSupported ? 'text-emerald-400' : 'text-red-400'}>
                {String(host.oauthSupported)}
              </span>
            } />
            <Row k="isLovableHost" v={String(host.isLovableHost)} />
            <Row k="isKnownThirdParty" v={
              <span className={host.isKnownThirdParty ? 'text-amber-400' : ''}>
                {String(host.isKnownThirdParty)}
              </span>
            } />
            <Row k="publishedUrl" v={PUBLISHED_LOVABLE_URL} />
          </section>

          {/* Session */}
          <section className="mb-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[10px] uppercase tracking-wider text-zinc-500">Session</h4>
              <button onClick={refreshNow} className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <RefreshCw size={10} /> refresh now
              </button>
            </div>
            <Row k="loading" v={String(loading)} />
            <Row k="user" v={user?.email ?? <span className="text-zinc-500">null</span>} />
            <Row k="isGuest" v={String(isGuest)} />
            <Row k="provider" v={user?.app_metadata?.provider ?? '—'} />
            <Row k="expires_at" v={session?.expires_at ?? '—'} />
            <Row k="expiresIn" v={
              expiresIn === null ? '—' : (
                <span className={refreshSoon ? 'text-amber-400' : 'text-emerald-400'}>
                  {expiresIn}s {refreshSoon && '(refresh soon)'}
                </span>
              )
            } />
            <Row k="access_token" v={
              session?.access_token ? (
                <button onClick={() => copy(session.access_token)} className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">
                  {session.access_token.slice(0, 24)}… <Copy size={10} />
                </button>
              ) : '—'
            } />
          </section>

          {/* OAuth / Bridge */}
          <section className="mb-3 pb-3 border-b border-zinc-800">
            <h4 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">OAuth / Bridge</h4>
            <Row k="bridge_return" v={bridgeReturn ?? <span className="text-zinc-500">—</span>} />
            <Row k="bridge_path" v={bridgePath ?? <span className="text-zinc-500">—</span>} />
            <Row k="bridge_tokens_in_hash" v={
              <span className={hasBridgeTokens ? 'text-emerald-400' : 'text-zinc-500'}>
                {String(hasBridgeTokens)}
              </span>
            } />
            <Row k="last_redirect" v={
              lastRedirectUrl ? (
                <div className="space-y-0.5">
                  <div className="text-zinc-500 text-[10px]">
                    {lastRedirectTs ? new Date(Number(lastRedirectTs)).toLocaleTimeString() : ''}
                  </div>
                  <button onClick={() => copy(lastRedirectUrl)} className="text-blue-400 hover:text-blue-300 inline-flex items-start gap-1 text-left">
                    <span className="break-all">{lastRedirectUrl}</span>
                    <Copy size={10} className="shrink-0 mt-0.5" />
                  </button>
                </div>
              ) : <span className="text-zinc-500">—</span>
            } />
          </section>

          {/* Events */}
          <section>
            <h4 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
              Event log ({events.length})
            </h4>
            {events.length === 0 ? (
              <div className="text-zinc-500 text-[11px]">No events captured yet.</div>
            ) : (
              <div className="space-y-1">
                {events.map((e, i) => (
                  <div key={i} className="flex gap-2 text-[11px] font-mono">
                    <span className="text-zinc-500 shrink-0">{new Date(e.ts).toLocaleTimeString()}</span>
                    <span className={
                      e.event === 'SIGNED_OUT' || e.event.includes('ERROR') ? 'text-red-400' :
                      e.event === 'TOKEN_REFRESHED' ? 'text-blue-400' :
                      e.event === 'SIGNED_IN' ? 'text-emerald-400' :
                      'text-zinc-200'
                    }>
                      {e.event}
                    </span>
                    {e.email && <span className="text-zinc-400 truncate">{e.email}</span>}
                    <span className="text-zinc-500 ml-auto shrink-0">{e.expiresIn}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
