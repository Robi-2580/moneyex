import { useCallback, useEffect, useRef, useState } from "react";

// Show one ad every 30 minutes; the timer is stored locally so it survives reloads.
const AD_INTERVAL_MS = 30 * 60 * 1000;
const FIRST_AD_DELAY_MS = 10 * 1000; // first ad shortly after entering the app
const STORAGE_KEY = "paysapro_last_ad_at";

const POPUNDER_SRC =
  "https://pl32146925.profitableratecpmnetwork.com/c6/41/4e/c6414ec4c502d7f873ddf84bcded781d.js";

const BANNER_KEY = "a6ea7d23766d999048c63ed40826b24a";
const BANNER_SRC = `https://www.highrevenueformat.com/${BANNER_KEY}/invoke.js`;

// Popunder network script — loaded once per page load.
function injectPopunder() {
  if (document.querySelector(`script[src="${POPUNDER_SRC}"]`)) return;
  const s = document.createElement("script");
  s.src = POPUNDER_SRC;
  s.async = true;
  document.body.appendChild(s);
}

// The banner network script uses document.write + window.atOptions,
// so it must be written into a fresh iframe document.
function buildBanner(container: HTMLElement) {
  container.innerHTML = "";
  const iframe = document.createElement("iframe");
  iframe.width = "320";
  iframe.height = "50";
  iframe.style.border = "0";
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute("title", "advertisement");
  container.appendChild(iframe);
  const doc = iframe.contentDocument;
  if (!doc) return;
  doc.open();
  doc.write(
    `<script>atOptions = { 'key': '${BANNER_KEY}', 'format': 'iframe', 'height': 50, 'width': 320, 'params': {} };<\/script>` +
      `<script src="${BANNER_SRC}"><\/script>`
  );
  doc.close();
}

const AdSystem = () => {
  const [visible, setVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  const showAd = useCallback(() => {
    injectPopunder();
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setVisible(true);
  }, []);

  useEffect(() => {
    const last = Number(localStorage.getItem(STORAGE_KEY) || 0);
    const elapsed = Date.now() - last;
    const firstDelay = last === 0 ? FIRST_AD_DELAY_MS : Math.max(0, AD_INTERVAL_MS - elapsed);
    const timer = setTimeout(showAd, firstDelay);
    const interval = setInterval(showAd, AD_INTERVAL_MS);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [showAd]);

  useEffect(() => {
    if (visible && bannerRef.current) buildBanner(bannerRef.current);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 md:bottom-4 md:left-auto md:right-4 md:translate-x-0 z-50">
      <div className="relative rounded-lg border bg-card p-1 shadow-lg">
        <button
          onClick={() => setVisible(false)}
          aria-label="Close ad"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full border bg-background text-foreground text-xs leading-none flex items-center justify-center shadow"
        >
          ✕
        </button>
        <div ref={bannerRef} className="overflow-hidden rounded" />
      </div>
    </div>
  );
};

export default AdSystem;
