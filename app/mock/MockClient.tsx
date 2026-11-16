'use client';

/* eslint-disable react-hooks/set-state-in-effect -- these pages keep everything in the reader's browser: storage and the clock only exist after hydration, so they are read in an effect (reading them during render would make the server and client HTML differ) */

import { useCallback, useEffect, useReducer, useState } from 'react';
import Link from 'next/link';
import CardEmbed from '../components/CardEmbed';
import { loadBank, addWeak, seedFrom } from '../lib/bank.mjs';
import { SEGMENTS, RATINGS, buildRound, scoreRound, readHistory, saveRound, recentKeys } from '../lib/mock.mjs';

type Card = ReturnType<typeof buildRound>['segments'][number]['cards'][number];
type Seg = { id: string; label: string; minutes: number; count: number; cards: Card[] };
type Run = {
  seed: number;
  segments: Seg[];
  seg: number; // index into segments
  q: number; // index of the question inside the segment
  ratings: Record<string, number>; // by tkey
  segMs: number[]; // accumulated time per segment
  since: number; // timestamp when the running clock last started
  paused: boolean;
  revealed: boolean;
  done: boolean;
  startedAt: string;
};
type Action =
  | { type: 'start'; run: Run }
  | { type: 'rate'; tkey: string; value: number }
  | { type: 'reveal' }
  | { type: 'next'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'resume'; now: number }
  | { type: 'finish'; now: number }
  | { type: 'reset' };

const CURRENT = 'mock-current';

function bank(segments: Seg[]) {
  return segments.flatMap((s) => s.cards);
}
function elapsed(run: Run, i: number, now: number) {
  return run.segMs[i] + (i === run.seg && !run.paused && !run.done ? Math.max(0, now - run.since) : 0);
}
function bankIndex(run: Run) {
  let n = 0;
  for (let i = 0; i < run.seg; i++) n += run.segments[i].cards.length;
  return n + run.q;
}
function mmss(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function reducer(state: Run | null, a: Action): Run | null {
  if (a.type === 'start') return a.run;
  if (a.type === 'reset') return null;
  if (!state) return state;
  const bump = (r: Run, now: number): Run => {
    const segMs = r.segMs.slice();
    if (!r.paused) segMs[r.seg] += now - r.since;
    return { ...r, segMs, since: now };
  };
  switch (a.type) {
    case 'rate': return { ...state, ratings: { ...state.ratings, [a.tkey]: a.value } };
    case 'reveal': return { ...state, revealed: !state.revealed };
    case 'pause': return state.paused ? state : { ...bump(state, a.now), paused: true };
    case 'resume': return state.paused ? { ...state, paused: false, since: a.now } : state;
    case 'next': {
      const b = bump(state, a.now);
      const seg = b.segments[b.seg];
      if (b.q + 1 < seg.cards.length) return { ...b, q: b.q + 1, revealed: false };
      return { ...b, seg: b.seg + 1, q: 0, revealed: false };
    }
    case 'finish': return { ...bump(state, a.now), done: true };
    default: return state;
  }
}

export default function MockClient() {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [run, dispatch] = useReducer(reducer, null);
  const [now, setNow] = useState(0);
  const [resumable, setResumable] = useState<Run | null>(null);
  const [history, setHistory] = useState<ReturnType<typeof readHistory>>([]);
  const [weakAdded, setWeakAdded] = useState(0);

  const load = useCallback(() => {
    setFailed(false);
    loadBank().then((c: Card[]) => setCards(c)).catch(() => setFailed(true));
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    try { setHistory(readHistory(localStorage)); } catch { /* storage unavailable */ }
  }, []);

  // offer a round in progress back (kept in sessionStorage, rebuilt from the bank by title key)
  useEffect(() => {
    if (!cards) return;
    try {
      const raw = sessionStorage.getItem(CURRENT);
      if (!raw) return;
      const s = JSON.parse(raw) as Omit<Run, 'segments'> & { segments: { id: string; tkeys: string[] }[] };
      const byKey = new Map<string, Card>(cards.map((c) => [c.tkey, c]));
      const segments: Seg[] = s.segments.map((x) => {
        const base = SEGMENTS.find((b: { id: string }) => b.id === x.id)!;
        return { ...base, cards: x.tkeys.map((k) => byKey.get(k)).filter(Boolean) as Card[] };
      });
      if (segments.some((x, i) => x.cards.length !== s.segments[i].tkeys.length) || s.done) { sessionStorage.removeItem(CURRENT); return; }
      setResumable({ ...s, segments });
    } catch { /* ignore a bad saved round */ }
  }, [cards]);

  // persist the round in progress on every change; clear it when it ends
  useEffect(() => {
    try {
      if (!run) return;
      if (run.done) sessionStorage.removeItem(CURRENT);
      else sessionStorage.setItem(CURRENT, JSON.stringify({ ...run, segments: run.segments.map((s) => ({ id: s.id, tkeys: s.cards.map((c) => c.tkey) })) }));
    } catch { /* storage unavailable */ }
  }, [run]);

  // the clock only forces a redraw; elapsed time always comes from timestamps
  useEffect(() => {
    if (!run || run.done || run.paused) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [run?.paused, run?.done, !!run]); // eslint-disable-line react-hooks/exhaustive-deps

  // on finishing: score, save to history, add weak cards (once)
  const finished = run?.done ? run : null;
  const result = finished
    ? scoreRound(finished.segments.map((s, i) => ({ id: s.id, minutes: s.minutes, seconds: Math.round(finished.segMs[i] / 1000), ratings: s.cards.map((c) => finished.ratings[c.tkey]).filter((v) => v !== undefined) })))
    : null;
  const savedFor = finished ? finished.startedAt : '';
  useEffect(() => {
    if (!finished || !result) return;
    const marker = 'mock-saved-' + finished.startedAt;
    try {
      if (sessionStorage.getItem(marker)) return;
      sessionStorage.setItem(marker, '1');
      const rated = bank(finished.segments).filter((c) => finished.ratings[c.tkey] !== undefined);
      const weak = rated.filter((c) => finished.ratings[c.tkey] <= 1).map((c) => c.tkey);
      if (weak.length) addWeak(localStorage, weak);
      setWeakAdded(weak.length);
      setHistory(saveRound(localStorage, {
        at: new Date().toISOString(), seed: finished.seed, total: result.total,
        segments: result.bySegment.map((b: { id: string; score: number | null }, i: number) => ({ id: b.id, score: b.score, seconds: Math.round(finished.segMs[i] / 1000) })),
        cards: rated.map((c) => ({ tkey: c.tkey, href: c.href, q: c.q, rating: finished.ratings[c.tkey] })),
      }));
    } catch { /* storage unavailable */ }
  }, [savedFor]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = (fixedSeed?: string | null) => {
    if (!cards) return;
    const t = Date.now();
    const seed = fixedSeed ? seedFrom(fixedSeed) : (t ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    const round = buildRound(cards, { seed, avoid: fixedSeed ? undefined : recentKeys(history) });
    dispatch({ type: 'start', run: { seed, segments: round.segments, seg: 0, q: 0, ratings: {}, segMs: round.segments.map(() => 0), since: t, paused: false, revealed: false, done: false, startedAt: new Date(t).toISOString() } });
    setNow(t);
  };
  const seedParam = () => (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('seed'));

  if (failed) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6">
        <p className="text-ink">The question bank could not load. Check your connection and try again.</p>
        <button type="button" onClick={load} className="mt-4 rounded-xl bg-marker px-4 py-2 font-bold text-marker-ink hover:brightness-110">Try again</button>
      </div>
    );
  }

  // ---------- setup ----------
  if (!run) {
    return (
      <div className="space-y-6">
        <ul className="rounded-2xl border border-line bg-surface p-5 text-[15px] text-ink">
          {SEGMENTS.map((s: { id: string; label: string; minutes: number }) => (
            <li key={s.id} className="flex justify-between border-b border-line py-2 last:border-b-0">
              <span>{s.label}</span><span className="text-ink-2">{s.minutes} min</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={!cards} onClick={() => start(seedParam())} className="rounded-xl bg-marker px-5 py-3 text-base font-bold text-marker-ink hover:brightness-110 disabled:opacity-50">
            {cards ? 'Start round' : 'Loading questions…'}
          </button>
          {resumable && (
            <button type="button" onClick={() => { dispatch({ type: 'start', run: { ...resumable, paused: true } }); setNow(Date.now()); setResumable(null); }} className="rounded-xl border border-line bg-surface px-5 py-3 text-base font-bold text-ink hover:border-marker hover:text-marker">
              Resume round
            </button>
          )}
        </div>
        <section aria-label="Recent rounds">
          <h2 className="font-display text-lg font-bold text-ink">Recent rounds</h2>
          {history.length === 0 ? (
            <p className="mt-2 text-ink-2">No rounds yet.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-ink-2">
              {history.slice(0, 5).map((h) => (
                <li key={h.at}>{new Date(h.at).toLocaleDateString()} · {h.total} / 100</li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  }

  // ---------- scorecard ----------
  if (run.done && result) {
    const rows = bank(run.segments);
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-ink-2">Your score</p>
          <p className="font-display text-6xl font-extrabold text-ink"><span data-testid="total">{result.total}</span><span className="text-2xl text-ink-2"> / 100</span></p>
          <p className="mt-1 text-xl font-bold text-marker" data-testid="verdict">{result.verdict}</p>
        </div>
        <ul className="space-y-3">
          {run.segments.map((s, i) => {
            const b = result.bySegment[i] as { score: number | null; overSeconds: number };
            return (
              <li key={s.id} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex flex-wrap justify-between gap-2 text-ink">
                  <span className="font-bold">{s.label}</span>
                  <span className="text-ink-2">
                    {b.score === null ? 'not rated' : `${b.score} / 100`} · {mmss(run.segMs[i])} of {s.minutes}:00
                    {b.overSeconds > 0 && <span className="ml-2 text-red-marker">+{mmss(b.overSeconds * 1000)} over</span>}
                  </span>
                </div>
                {b.score !== null && (
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" aria-hidden><div className="h-full rounded-full bg-done" style={{ width: `${b.score}%` }} /></div>
                )}
              </li>
            );
          })}
        </ul>
        <section aria-label="Questions">
          <h2 className="font-display text-lg font-bold text-ink">The questions</h2>
          <ol className="mt-2 space-y-2">
            {rows.map((c) => (
              <li key={c.tkey} className="flex flex-wrap justify-between gap-2 text-ink">
                <Link href={c.href} className="underline-offset-2 hover:text-marker hover:underline">{c.q}</Link>
                <span className="text-ink-2">{RATINGS.find((r: { value: number }) => r.value === run.ratings[c.tkey])?.label ?? 'not rated'}</span>
              </li>
            ))}
          </ol>
        </section>
        {weakAdded > 0 && <p className="rounded-xl bg-hl px-4 py-2 font-medium text-hl-ink">{weakAdded} card{weakAdded === 1 ? '' : 's'} added to your weak cards</p>}
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => { dispatch({ type: 'reset' }); setWeakAdded(0); }} className="rounded-xl bg-marker px-5 py-3 font-bold text-marker-ink hover:brightness-110">New round</button>
          <Link href={`/mock?seed=${run.seed}`} onClick={() => { dispatch({ type: 'reset' }); setWeakAdded(0); }} className="rounded-xl border border-line bg-surface px-5 py-3 font-bold text-ink hover:border-marker hover:text-marker">Same round again</Link>
        </div>
      </div>
    );
  }

  // ---------- running ----------
  const tick = now;
  const seg = run.segments[run.seg];
  const budgetMs = seg.minutes * 60000;
  const el = elapsed(run, run.seg, tick);
  const left = budgetMs - el;
  const total = run.segMs.reduce((a, _, i) => a + elapsed(run, i, tick), 0);
  const clock = (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-2" role="timer" aria-label="Round clock">
      <span className={left < 0 ? 'font-bold text-red-marker' : 'font-bold text-ink'}>{left >= 0 ? mmss(left) : `+${mmss(-left)}`}</span>
      <span>round {mmss(total)} of 45:00</span>
      <button type="button" onClick={() => { const t0 = Date.now(); setNow(t0); dispatch({ type: run.paused ? 'resume' : 'pause', now: t0 }); }} className="rounded-lg border border-line bg-surface px-3 py-1 font-bold text-ink hover:border-marker">
        {run.paused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );

  if (seg.id === 'wrap') {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="font-display text-2xl font-bold text-ink">{seg.label}</h2>{clock}</div>
        <p className="text-lg text-ink">Ask your two questions. Choose them now and say them aloud.</p>
        <p><Link href="/interview-prep#behavioral" className="font-bold text-marker underline-offset-2 hover:underline">Questions to ask</Link></p>
        <button type="button" onClick={() => dispatch({ type: 'finish', now: Date.now() })} className="rounded-xl bg-marker px-5 py-3 font-bold text-marker-ink hover:brightness-110">Finish round</button>
      </div>
    );
  }

  const card = seg.cards[run.q];
  const rating = run.ratings[card.tkey];
  const lastInSegment = run.q === seg.cards.length - 1;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-bold text-ink">{seg.label} <span className="text-base font-medium text-ink-2">· Question {bankIndex(run) + 1} of 8</span></h2>
        {clock}
      </div>
      <p className="rounded-2xl border border-line bg-surface p-5 text-xl font-bold leading-snug text-ink" data-testid="question">{card.q}</p>
      <ul className="list-disc space-y-1 pl-6 text-ink-2">
        <li>Main point first</li>
        <li>A concrete example</li>
        <li>A trade-off or a limit</li>
      </ul>
      <div>
        <button type="button" onClick={() => dispatch({ type: 'reveal' })} className="rounded-xl border border-line bg-surface px-4 py-2 font-bold text-ink hover:border-marker hover:text-marker">
          {run.revealed ? 'Hide model answer' : 'Reveal model answer'}
        </button>
        {run.revealed && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-surface">
            <CardEmbed slug={card.slug} sec={card.sec} idx={card.idx} title={`Model answer: ${card.q}`} />
          </div>
        )}
      </div>
      <fieldset className="rounded-2xl border border-line bg-surface p-4">
        <legend className="px-2 text-sm font-bold text-ink-2">How did that go?</legend>
        <div role="radiogroup" aria-label="How did that go?" className="flex flex-wrap gap-2">
          {RATINGS.map((r: { value: number; label: string }) => (
            <label key={r.value} className={`cursor-pointer rounded-xl border px-4 py-2 font-bold ${rating === r.value ? 'border-marker bg-marker text-marker-ink' : 'border-line bg-surface text-ink hover:border-marker'}`}>
              <input type="radio" name="rating" className="sr-only" checked={rating === r.value} onChange={() => dispatch({ type: 'rate', tkey: card.tkey, value: r.value })} />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>
      <button type="button" disabled={rating === undefined} onClick={() => dispatch({ type: 'next', now: Date.now() })} className="rounded-xl bg-marker px-5 py-3 font-bold text-marker-ink hover:brightness-110 disabled:opacity-50">
        {lastInSegment ? 'Finish segment' : 'Next question'}
      </button>
    </div>
  );
}
