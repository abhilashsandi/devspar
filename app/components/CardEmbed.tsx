'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

/**
 * One card of a guide, shown in its own frame: diagrams, code colours, short answers and follow-ups all
 * appear exactly as they do in the guide. The guide's solo mode (?card=sec:idx) reports its height.
 */
export default function CardEmbed({ slug, sec, idx, title }: { slug: string; sec: string; idx: number; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(160);
  const [loaded, setLoaded] = useState(false);
  const { resolvedTheme } = useTheme();
  const key = `${sec}:${idx}`;

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return;
      const d = e.data as { type?: string; card?: string; height?: number } | null;
      if (d && d.type === 'solo-height' && d.card === key && typeof d.height === 'number') setHeight(Math.max(80, d.height));
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [key]);

  useEffect(() => {
    if (!loaded || !resolvedTheme) return;
    try {
      ref.current?.contentDocument?.documentElement.setAttribute('data-theme', resolvedTheme);
    } catch {
      /* cross-origin: nothing to sync */
    }
  }, [loaded, resolvedTheme]);

  return (
    <iframe
      ref={ref}
      title={title}
      src={`/study/${slug}.html?card=${encodeURIComponent(key)}`}
      onLoad={() => setLoaded(true)}
      style={{ width: '100%', height, border: 'none', display: 'block', background: 'transparent' }}
    />
  );
}
