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
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') { setQuery(''); inputRef.current?.blur(); } }}
          placeholder="Search every guide…"
          aria-label="Search every guide"
          className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 py-4 pl-12 pr-24 text-base text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
        />
        {query ? (
          <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 dark:border-white/10 px-2 py-0.5 text-xs text-slate-400 sm:block">/</kbd>
        )}
      </div>

      {active && (
        <div className="mt-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 shadow-lg overflow-hidden text-left" role="region" aria-live="polite" aria-label="Search results">
          {failed && <p className="p-4 text-sm text-slate-500">Search is unavailable right now. Open a guide below instead.</p>}
          {!failed && !index && <p className="p-4 text-sm text-slate-500">Searching…</p>}
          {index && results.length === 0 && <p className="p-4 text-sm text-slate-500">No question matches “{query}”. Try fewer or shorter words.</p>}
          {index && results.length > 0 && (
            <>
              <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {results.length > 12 ? `Top 12 of ${results.length} matches` : `${results.length} match${results.length === 1 ? '' : 'es'}`}
              </p>
              <ul className="divide-y divide-slate-100 dark:divide-white/5 max-h-[28rem] overflow-y-auto">
                {results.slice(0, 12).map(({ item }) => {
                  const [page, sid, qi, sectionTitle, title, summary] = item;
                  return (
                    <li key={`${page}:${sid}:${qi}`}>
                      <a href={`/${page}#${sid}:${qi}`} className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5">
                        <span className="block text-sm font-semibold text-slate-900 dark:text-white">{title}</span>
                        <span className="block text-xs font-medium text-indigo-600 dark:text-indigo-300 mt-0.5">{index.pages[page] ?? page} · {sectionTitle}</span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{summary}</span>
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
