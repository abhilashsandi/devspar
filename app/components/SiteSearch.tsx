'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

// /search-index.json is generated from every study guide (scripts: build-index).
// item = [page slug, section id, question index, section title, question, summary]
type Item = [string, string, number, string, string, string];
type SearchIndex = { pages: Record<string, string>; items: Item[] };

// When several guides carry the same question, link the most specific one.
const PRIORITY: Record<string, number> = { 'interview-prep': 2, 'system-design': 1, 'react-training': 1 };
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export default function SiteSearch() {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [failed, setFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim().length < 2 || index || failed) return;
    fetch('/search-index.json')
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => setFailed(true));
  }, [query, index, failed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing = el instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(el.tagName);
      const combo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (combo || (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        inputRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const terms = useMemo(() => query.toLowerCase().split(/\s+/).filter((t) => t.length > 1), [query]);
  const results = useMemo(() => {
    if (!index || !terms.length) return [];
    const best = new Map<string, { item: Item; score: number }>();
    for (const item of index.items) {
      const [page, , , sectionTitle, title, summary] = item;
      const hay = `${title} ${sectionTitle} ${summary}`.toLowerCase();
      if (!terms.every((t) => hay.includes(t))) continue;
      const lower = title.toLowerCase();
      const score = terms.reduce((n, t) => n + (lower.includes(t) ? 10 : 1), 0);
      const key = norm(title);
      const prev = best.get(key);
      if (!prev || (PRIORITY[page] ?? 0) < (PRIORITY[prev.item[0]] ?? 0)) best.set(key, { item, score });
    }
    return Array.from(best.values()).sort((a, b) => b.score - a.score || (PRIORITY[a.item[0]] ?? 0) - (PRIORITY[b.item[0]] ?? 0));
  }, [index, terms]);

  const active = terms.length > 0;

  return (
    <div className="w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-2" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') { setQuery(''); inputRef.current?.blur(); } }}
          placeholder="Search every guide…"
          aria-label="Search every guide"
          className="w-full rounded-xl border border-line bg-surface py-3.5 pl-12 pr-16 text-base text-ink placeholder:text-ink-2 outline-none focus:border-marker focus:ring-2 focus:ring-marker/30"
        />
        {query ? (
          <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-ink-2 hover:text-ink">
            <X className="w-4 h-4" />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-line px-2 py-0.5 text-xs text-ink-2 sm:block">/</kbd>
        )}
      </div>

      {active && (
        <div className="mt-3 rounded-xl border border-line bg-surface shadow-lg overflow-hidden text-left" role="region" aria-live="polite" aria-label="Search results">
          {failed && <p className="p-4 text-sm text-ink-2">Search is unavailable right now. Open a guide below instead.</p>}
          {!failed && !index && <p className="p-4 text-sm text-ink-2">Searching…</p>}
          {index && results.length === 0 && <p className="p-4 text-sm text-ink-2">No question matches “{query}”. Try fewer or shorter words.</p>}
          {index && results.length > 0 && (
            <>
              <p className="px-4 pt-3 pb-1 text-sm font-bold text-ink-2">
                {results.length > 12 ? `Top 12 of ${results.length} matches` : `${results.length} match${results.length === 1 ? '' : 'es'}`}
              </p>
              <ul className="divide-y divide-line max-h-[28rem] overflow-y-auto">
                {results.slice(0, 12).map(({ item }) => {
                  const [page, sid, qi, sectionTitle, title, summary] = item;
                  return (
                    <li key={`${page}:${sid}:${qi}`}>
                      <a href={`/${page}#${sid}:${qi}`} className="block px-4 py-3 hover:bg-marker-soft">
                        <span className="block text-[15px] font-bold text-ink">{title}</span>
                        <span className="block text-[13px] font-medium text-marker mt-0.5">{index.pages[page] ?? page} · {sectionTitle}</span>
                        <span className="block text-sm text-ink-2 mt-1 line-clamp-2">{summary}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
