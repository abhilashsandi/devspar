'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

export default function StaticPrepClient({
  html,
  src,
  title,
  loadingLabel,
}: {
  /** Full HTML for an iframe srcDoc (used for the decrypted private page). */
  html?: string;
  /** A same-origin static file to load instead (used for the public guides). */
  src?: string;
  title: string;
  loadingLabel?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    function sendHash() {
      const hash = window.location.hash.replace(/^#/, '');
      if (!hash) return;
      // "#weak" opens the weak-cards flashcard deck; otherwise the format is "<sectionId>" or
      // "<sectionId>:<questionIndex>" for a direct link to one card.
      const message =
        hash === 'weak'
          ? { type: 'start-weak-deck' }
          : (() => {
              const [id, qIdxRaw] = hash.split(':');
              return { type: 'goto-section', id, qIdx: qIdxRaw !== undefined ? Number(qIdxRaw) : undefined };
            })();
      // The iframe's own 'load' event isn't a reliable signal here, so retry posting for a
      // couple of seconds until the inner script's listener picks it up.
      let attempts = 0;
      const timer = setInterval(() => {
        iframeRef.current?.contentWindow?.postMessage(message, '*');
        attempts += 1;
        if (attempts >= 20) clearInterval(timer);
      }, 150);
      return () => clearInterval(timer);
    }
    // On mount (a fresh page load, or navigating here from elsewhere) and on a same-page hash
    // change (e.g. clicking the homepage's "review weak cards" link while already on that guide,
    // where Next.js updates the URL without remounting this component).
    const cleanupMount = sendHash();
    const onHashChange = () => sendHash();
    window.addEventListener('hashchange', onHashChange);
    return () => {
      cleanupMount?.();
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  // Keep the guide's own light/dark styling in sync with the site's theme toggle. The guide's
  // CSS reads a data-theme attribute on its own document root (falling back to the OS setting
  // when unset); the iframe is same-origin (srcDoc, or a static file on this site), so we can
  // set that attribute directly instead of round-tripping through postMessage.
  useEffect(() => {
    if (!loaded || !resolvedTheme) return;
    iframeRef.current?.contentDocument?.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [loaded, resolvedTheme]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#F1F2F6' }}>
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'monospace',
            color: '#666',
          }}
        >
          {loadingLabel ?? 'Loading…'}
        </div>
      )}
      <iframe
        ref={iframeRef}
        title={title}
        src={src}
        srcDoc={html}
        onLoad={() => setLoaded(true)}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    </div>
  );
}
