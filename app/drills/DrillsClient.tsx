'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { seedFrom } from '../lib/bank.mjs';
import { TEMPLATES, makeSession, grade, formatAmount, readStats, recordResult } from '../lib/drills.mjs';

type Drill = ReturnType<typeof makeSession>[number];
type Grade = 'exact' | 'close' | 'off' | 'invalid';
type Done = { id: string; grade: Grade; seconds: number };

const TARGET_SECONDS = 90;
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const MESSAGES = (answer: number, unit: string): Record<Grade, string> => ({
  exact: 'Right.',
  close: `Close enough for an interview: the exact figure is ${formatAmount(answer)} ${unit}.`,
  off: `Off: the answer is ${formatAmount(answer)} ${unit}.`,
  invalid: 'Enter a number, for example 6900 or 6.9k.',
});

function NumbersToKnow() {
  return (
    <details className="mt-8 rounded-2xl border border-line bg-surface p-4">
      <summary className="cursor-pointer font-bold text-ink">Numbers to know</summary>
      <div className="mt-3 space-y-2 text-[15px] text-ink-2">
        <p>A day is 86,400 seconds (about 10^5), a 30-day month 43,200 minutes, a year 525,600 minutes. Units here are decimal: 1 KB is 1,000 bytes.</p>
        <p>Latency ladder, each step roughly ten times slower: L1 cache about 1 ns, RAM about 100 ns, SSD random read about 150 µs, Redis round trip about 0.5 ms, same-region hop about 1 ms, indexed database query 1 to 10 ms, cross-continent round trip about 120 ms.</p>
        <p>
          <Link href="/performance-optimization#reference:0" className="font-bold text-marker underline-offset-2 hover:underline">The latency numbers card</Link>
          {' · '}
          <Link href="/system-design-scale#framing:1" className="font-bold text-marker underline-offset-2 hover:underline">Back-of-envelope sizing</Link>
        </p>
      </div>
    </details>
  );
}

export default function DrillsClient() {
  const [session, setSession] = useState<Drill[] | null>(null);
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [graded, setGraded] = useState<Grade | null>(null);
  const [results, setResults] = useState<Done[]>([]);
  const [now, setNow] = useState(0);
  const startedAt = useRef(0);
  const input = useRef<HTMLInputElement>(null);

  const begin = (seedText?: string | null) => {
    let s = {};
    try { s = readStats(localStorage); } catch { /* storage unavailable */ }
    const t = Date.now();
    const seed = seedText ? seedFrom(seedText) : (t ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    setSession(makeSession(seed, s));
    setI(0); setText(''); setGraded(null); setResults([]);
    startedAt.current = t; setNow(t);
  };
  useEffect(() => {
    begin(new URLSearchParams(window.location.search).get('seed'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const finished = !!session && i >= session.length;
  useEffect(() => {
    if (!session || finished || graded) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [session, finished, graded, i]);
  useEffect(() => { if (!graded) input.current?.focus(); }, [i, graded, session]);

  if (!session) return <p className="text-ink-2">Loading…</p>;

  if (finished) {
    const count = (g: Grade) => results.filter((r) => r.grade === g).length;
    const slowest = results.reduce((a, r) => (r.seconds > a.seconds ? r : a), results[0]);
    const title = (id: string) => TEMPLATES.find((t: { id: string }) => t.id === id)?.title ?? id;
    const all = readStats(typeof localStorage === 'undefined' ? { getItem: () => null } : localStorage);
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <p className="font-display text-3xl font-extrabold text-ink" data-testid="summary">{count('exact')} right, {count('close')} close, {count('off')} off</p>
          {slowest && <p className="mt-2 text-ink-2">Slowest: {title(slowest.id)}, {mmss(slowest.seconds)}.</p>}
        </div>
        <section aria-label="Your record by template">
          <h2 className="font-display text-lg font-bold text-ink">Your record</h2>
          <ul className="mt-2 space-y-1 text-ink-2">
            {results.map((r) => {
              const s = (all as Record<string, { seen: number; exact: number }>)[r.id];
              return <li key={r.id}>{title(r.id)}: {s ? `${s.exact} of ${s.seen} right so far` : 'new'}</li>;
            })}
          </ul>
        </section>
        <button type="button" onClick={() => begin(null)} className="rounded-xl bg-marker px-5 py-3 font-bold text-marker-ink hover:brightness-110">Another session</button>
        <NumbersToKnow />
      </div>
    );
  }

  const d = session[i];
  const elapsed = Math.max(0, Math.round((now - startedAt.current) / 1000));
  const submit = () => {
    if (graded) {
      // a second Enter moves on, and never grades twice
      setI((n) => n + 1); setText(''); setGraded(null);
      startedAt.current = Date.now(); setNow(startedAt.current);
      return;
    }
    const g = grade(text, d) as Grade;
    if (g === 'invalid') { setGraded('invalid'); return; }
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    try { recordResult(localStorage, d.id, g); } catch { /* storage unavailable */ }
    setResults((r) => [...r, { id: d.id, grade: g, seconds }]);
    setGraded(g);
  };
  const message = graded ? MESSAGES(d.answer, d.unit)[graded] : '';
  const wasGraded = graded && graded !== 'invalid';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-bold text-ink">Drill {i + 1} of 8</h2>
        <p className="text-sm text-ink-2" role="timer" aria-label="Time on this drill">
          <span className="font-bold text-ink">{mmss(wasGraded ? results[results.length - 1]?.seconds ?? 0 : elapsed)}</span> · target {mmss(TARGET_SECONDS)}
        </p>
      </div>
      <p className="rounded-2xl border border-line bg-surface p-5 text-lg leading-relaxed text-ink" data-testid="prompt">{d.prompt}</p>
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-4">
        <label className="block">
          <span className="text-sm font-bold text-ink-2">Your answer in {d.unit}</span>
          <input
            ref={input}
            value={text}
            onChange={(e) => { setText(e.target.value); if (graded === 'invalid') setGraded(null); }}
            readOnly={!!wasGraded}
            inputMode="decimal"
            autoComplete="off"
            className="mt-1 block w-full max-w-xs rounded-xl border border-line bg-surface px-4 py-3 text-lg text-ink"
          />
        </label>
        <button type="submit" className="rounded-xl bg-marker px-5 py-3 font-bold text-marker-ink hover:brightness-110">{wasGraded ? 'Next drill' : 'Check'}</button>
      </form>
      {graded && (
        <div className="space-y-3" aria-live="polite">
          <p className={`text-lg font-bold ${graded === 'exact' ? 'text-done' : graded === 'invalid' ? 'text-red-marker' : 'text-hl-ink'}`} data-testid="grade">{message}</p>
          {wasGraded && (
            <ol className="list-decimal space-y-1 pl-6 text-ink-2" data-testid="steps">
              {d.steps.map((s: string) => <li key={s}>{s}</li>)}
            </ol>
          )}
        </div>
      )}
      <NumbersToKnow />
    </div>
  );
}
