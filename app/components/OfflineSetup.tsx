'use client';

/* eslint-disable react-hooks/set-state-in-effect -- these pages keep everything in the reader's browser: storage and the clock only exist after hydration, so they are read in an effect (reading them during render would make the server and client HTML differ) */

import { useEffect, useState } from 'react';

// Registers the service worker (public/sw.js, built by scripts/build-sw.mjs) in production, so the guides open
// without a connection. In development it unregisters any worker it finds, so `next dev` never serves stale files.
export default function OfflineSetup() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {});
      return;
    }
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {});
  }, []);
  return null;
}

type Saved = { at: string; failed: number };
const KEY = 'study-offline-v1';

// "Save for offline" and "Install DevSpar", shown in the home page footer. Hidden where service workers are unsupported.
export function OfflineControls() {
  const [supported, setSupported] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [install, setInstall] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') return;
    setSupported(true);
    try { const raw = localStorage.getItem(KEY); if (raw) setSaved(JSON.parse(raw) as Saved); } catch { /* ignore */ }
    const onMessage = (e: MessageEvent) => {
      const d = e.data as { type?: string; done?: number; total?: number; failed?: string[] } | null;
      if (!d) return;
      if (d.type === 'warm-progress') setProgress({ done: d.done ?? 0, total: d.total ?? 0 });
      if (d.type === 'warm-done') {
        const s = { at: new Date().toISOString(), failed: d.failed?.length ?? 0 };
        setProgress(null); setSaved(s);
        try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
      }
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      const ev = e as Event & { prompt: () => Promise<void> };
      setInstall(() => () => { ev.prompt().catch(() => {}); setInstall(null); });
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => {
      navigator.serviceWorker.removeEventListener('message', onMessage);
      window.removeEventListener('beforeinstallprompt', onPrompt);
    };
  }, []);

  if (!supported) return null;
  const save = async () => {
    const reg = await navigator.serviceWorker.ready;
    setProgress({ done: 0, total: 1 });
    reg.active?.postMessage({ type: 'warm' });
  };
  return (
    <p className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm">
      <button type="button" onClick={save} disabled={!!progress} className="rounded-lg border border-line bg-surface px-3 py-1.5 font-bold text-ink hover:border-marker disabled:opacity-60">
        {progress ? `Saving… ${progress.done} of ${progress.total}` : 'Save for offline'}
      </button>
      {saved && !progress && <span>{saved.failed ? `Saved, except ${saved.failed} page${saved.failed === 1 ? '' : 's'}` : `Saved for offline on ${new Date(saved.at).toLocaleDateString()}`}</span>}
      {install && <button type="button" onClick={install} className="rounded-lg border border-line bg-surface px-3 py-1.5 font-bold text-ink hover:border-marker">Install DevSpar</button>}
    </p>
  );
}
