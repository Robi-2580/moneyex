import { useEffect } from 'react';
import { toast } from 'sonner';
import { BRIDGE_VERSION, getAuthHostInfo } from '@/lib/authDebug';

// Where the third-party deploy lives. Health check pings its deploy-version.json
// and warns if the deployed bridge code is older than the canonical source.
const VERCEL_DEPLOY_URL = 'https://paysapro.vercel.app';
const HEALTHCHECK_SESSION_KEY = 'deploy-healthcheck-done';

type DeployVersionPayload = {
  bridgeVersion?: string;
  feature?: string;
  notes?: string;
};

async function fetchDeployVersion(origin: string): Promise<DeployVersionPayload | null> {
  try {
    const url = `${origin.replace(/\/$/, '')}/deploy-version.json?t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store', mode: 'cors' });
    if (!res.ok) return null;
    return (await res.json()) as DeployVersionPayload;
  } catch {
    return null;
  }
}

export default function DeployHealthCheck() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forced = params.get('deploycheck') === '1';
    const { isLovableHost, isLocal } = getAuthHostInfo();

    // Run on dev, Lovable preview/published host, or when forced via ?deploycheck=1.
    // Do NOT run on the Vercel host itself (it would self-check trivially).
    if (!forced && !isLovableHost && !isLocal && !import.meta.env.DEV) return;
    if (window.location.hostname === 'paysapro.vercel.app') return;

    if (!forced && sessionStorage.getItem(HEALTHCHECK_SESSION_KEY)) return;
    sessionStorage.setItem(HEALTHCHECK_SESSION_KEY, '1');

    (async () => {
      const remote = await fetchDeployVersion(VERCEL_DEPLOY_URL);
      const expected = BRIDGE_VERSION;

      if (!remote) {
        // eslint-disable-next-line no-console
        console.warn(
          `%c[deploy-health] ❌ Could not reach ${VERCEL_DEPLOY_URL}/deploy-version.json`,
          'color:#ef4444;font-weight:bold'
        );
        toast.error('Vercel deploy health check failed', {
          description: `${VERCEL_DEPLOY_URL} unreachable or missing deploy-version.json. Redeploy needed.`,
          duration: 10000,
        });
        return;
      }

      const deployed = remote.bridgeVersion ?? 'unknown';
      if (deployed !== expected) {
        // eslint-disable-next-line no-console
        console.warn(
          `%c[deploy-health] ⚠️ Vercel bridge OUTDATED`,
          'color:#f59e0b;font-weight:bold',
          { expected, deployed, host: VERCEL_DEPLOY_URL }
        );
        toast.warning('Vercel deploy is outdated', {
          description: `Expected bridge ${expected}, found ${deployed}. Redeploy paysapro.vercel.app to apply the latest OAuth bridge fix.`,
          duration: 15000,
        });
      } else {
        // eslint-disable-next-line no-console
        console.info(
          `%c[deploy-health] ✅ Vercel bridge up-to-date (${deployed})`,
          'color:#22c55e;font-weight:bold'
        );
        if (forced) {
          toast.success('Vercel deploy is up-to-date', {
            description: `Bridge version ${deployed} matches source.`,
          });
        }
      }
    })();
  }, []);

  return null;
}
