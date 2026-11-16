'use client';

/* eslint-disable react-hooks/set-state-in-effect -- these pages keep everything in the reader's browser: storage and the clock only exist after hydration, so they are read in an effect (reading them during render would make the server and client HTML differ) */

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { loadBank, readProgress } from '../lib/bank.mjs';
import { SKILLS } from '../lib/skills.mjs';
import { analyse, deckLinks, saveResult, readResult, clearResult, MAX_CHARS } from '../lib/match.mjs';
import { pickAnswers, gapFrame, parsePayload, toText } from '../lib/phone.mjs';
import { decryptPayload } from '../lib/privateCrypto';

type Card = Awaited<ReturnType<typeof loadBank>>[number];
type Analysis = ReturnType<typeof analyse>;
type Saved = { at: string; skills: string[]; deck: string[] };

const MARK: Record<string, string> = { covered: '●', thin: '◐', missing: '○' };

function gapText(a: Analysis): string {
  const lines: string[] = [];
  if (a.gaps.missing.length) lines.push('Not covered here: study these elsewhere', ...a.gaps.missing.map((x) => `- ${x}`), '');
  if (a.gaps.thin.length) lines.push('Covered thinly: a few cards only', ...a.gaps.thin.map((x) => `- ${x}`), '');
  if (a.gaps.unreviewed.length) lines.push('Covered, but you have not reviewed most of it', ...a.gaps.unreviewed.map((x) => `- ${x}`), '');
  return lines.join('\n').trim();
}

function Deck({ deck }: { deck: Card[] }) {
  const links = deckLinks(deck) as { guide: string; count: number; href: string }[];
  return (
    <section aria-label="Your deck" className="space-y-3">
      <h2 className="font-display text-xl font-bold text-ink" data-testid="deck-count">
        {deck.length} card{deck.length === 1 ? '' : 's'} across {links.length} guide{links.length === 1 ? '' : 's'}
      </h2>
      <ul className="rounded-2xl border border-line bg-surface px-4">
        {links.map((l) => (
          <li key={l.href} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line py-2 last:border-b-0">
            <span className="text-ink">{l.guide} · {l.count} card{l.count === 1 ? '' : 's'}</span>
            <Link href={l.href} className="font-bold text-marker underline-offset-2 hover:underline">Open as flashcards</Link>
          </li>
        ))}
      </ul>
      <details className="rounded-xl border border-line bg-surface px-4 py-2">
        <summary className="cursor-pointer font-bold text-ink">The cards</summary>
        <ul className="mt-2 space-y-1">
          {deck.map((c) => (
            <li key={c.tkey}><Link href={c.href} className="text-ink-2 underline-offset-2 hover:text-marker hover:underline">{c.q}</Link></li>
          ))}
        </ul>
      </details>
    </section>
  );
}

function GapList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="font-bold text-ink">{title}</h3>
      <ul className="mt-1 list-disc pl-6 text-ink-2">{items.map((x) => <li key={x}>{x}</li>)}</ul>
    </div>
  );
}

type Pitch = { id: string; title: string; say: string; probes: string[]; verify: string };

// The reader's own phone-screen answers. They are encrypted (public/my-prep/phone.enc.json, written by
// scripts/update-my-prep.mjs) and only ever decrypted here, in the browser, into memory.
function PhoneAnswers({ found, pitches, onUnlock }: { found: { id: string; label: string }[]; pitches: Pitch[] | null; onUnlock: (p: Pitch[]) => void }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const unlock = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true); setError('');
    try {
      const res = await fetch('/my-prep/phone.enc.json', { cache: 'no-store' });
      if (!res.ok) { setError('Your answers have not been published yet.'); return; }
      const text = await decryptPayload(await res.json(), password).catch(() => { throw new Error('That password did not work.'); });
      onUnlock(parsePayload(text) as Pitch[]);
      setPassword('');
    } catch (err) {
      setError((err as Error).message || 'That password did not work.');
    } finally {
      setBusy(false);
    }
  };

  if (!pitches) {
    return (
      <section aria-label="Phone-screen answers" className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-display text-xl font-bold text-ink">Phone-screen answers</h2>
        <p className="mt-1 text-ink-2">Your own answers are kept encrypted. Enter your My Prep password to list the ones this posting needs. It is used in this browser only and is not stored.</p>
        <form onSubmit={unlock} className="mt-3 flex flex-wrap items-end gap-3">
          <label className="block text-sm font-bold text-ink-2">My Prep password
            <input type="password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block rounded-xl border border-line bg-board px-3 py-2 text-ink" />
          </label>
          <button type="submit" disabled={busy || !password} className="rounded-xl bg-marker px-4 py-2 font-bold text-marker-ink hover:brightness-110 disabled:opacity-50">{busy ? 'Opening…' : 'Show my answers'}</button>
        </form>
        {error && <p role="alert" className="mt-2 text-red-marker">{error}</p>}
      </section>
    );
  }

  const picked = pickAnswers(found, pitches) as { answers: { pitch: Pitch; question: string; skills: string[] }[]; missing: string[] };
  const copy = async () => {
    try { await navigator.clipboard.writeText(toText(picked)); setCopied(true); } catch { setError('Copying is not allowed here. Select the answers and copy them by hand.'); }
  };
  return (
    <section aria-label="Phone-screen answers" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-ink">Phone-screen answers <span className="text-base font-medium text-ink-2">· {picked.answers.length} to rehearse</span></h2>
        <button type="button" onClick={copy} className="rounded-xl border border-line bg-surface px-4 py-2 font-bold text-ink hover:border-marker">{copied ? 'Copied' : 'Copy as text'}</button>
      </div>
      {error && <p role="alert" className="text-red-marker">{error}</p>}
      <ol className="space-y-3">
        {picked.answers.map((a) => (
          <li key={a.pitch.id} className="rounded-2xl border border-line bg-surface p-5">
            <h3 className="font-bold text-ink">{a.question}</h3>
            <p className="mt-2 leading-relaxed text-ink">{a.pitch.say}</p>
            {a.pitch.probes.length > 0 && (
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-bold text-marker">If they probe</summary>
                <ul className="mt-2 list-disc space-y-1 pl-6 text-ink-2">{a.pitch.probes.map((p) => <li key={p}>{p}</li>)}</ul>
              </details>
            )}
            {a.pitch.verify && <p className="mt-3 text-sm text-hl-ink"><span className="font-bold">Check before saying:</span> {a.pitch.verify}</p>}
          </li>
        ))}
      </ol>
      {picked.missing.length > 0 && (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="font-bold text-ink">No answer written yet</h3>
          <p className="mt-1 text-sm text-ink-2">The posting asks for these and you have no pitch for them. Say it honestly:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-ink-2">{picked.missing.map((m) => <li key={m}>{gapFrame(m)}</li>)}</ul>
        </div>
      )}
    </section>
  );
}

export default function MatchClient() {
  const [text, setText] = useState('');                     // the posting: held here only, never stored
  const [cards, setCards] = useState<Card[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<Analysis | null>(null);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [pitches, setPitches] = useState<Pitch[] | null>(null);   // decrypted answers: memory only, gone on reload
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => { setFailed(false); loadBank().then((c: Card[]) => setCards(c)).catch(() => setFailed(true)); }, []);
  useEffect(() => {
    load();
    try { setSaved(readResult(localStorage)); } catch { /* storage unavailable */ }
  }, [load]);

  const find = () => {
    setMessage(''); setCopied(false);
    if (!text.trim()) { setMessage('Paste the posting first.'); setResult(null); return; }
    if (!cards) { setMessage('The question bank is still loading. Try again in a moment.'); return; }
    let reviewed = new Set<string>();
    try { reviewed = readProgress(localStorage).reviewed; } catch { /* storage unavailable */ }
    const a = analyse(text, cards, reviewed) as Analysis;
    if (!a.found.length) { setMessage('No skills recognised. Paste the requirements section of the posting.'); setResult(null); return; }
    if (a.truncated) setMessage(`Only the first ${MAX_CHARS.toLocaleString('en-US')} characters were read.`);
    setResult(a); setSaved(null);
    try { saveResult(localStorage, a, new Date().toISOString()); } catch { /* storage unavailable */ }
  };

  const copy = async () => {
    if (!result) return;
    try { await navigator.clipboard.writeText(gapText(result)); setCopied(true); } catch { setMessage('Copying is not allowed here. Select the lists and copy them by hand.'); }
  };

  const savedDeck = saved && cards ? (saved.deck.map((h) => cards.find((c) => c.href === h)).filter(Boolean) as Card[]) : [];

  return (
    <div className="space-y-6">
      <div>
        <label className="block">
          <span className="text-sm font-bold text-ink-2">Job posting</span>
          <textarea aria-label="Job posting" value={text} onChange={(e) => setText(e.target.value)} rows={12}
            className="mt-1 block w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink" placeholder="Paste the posting, or just its requirements." />
        </label>
        <p className="mt-2 text-sm text-ink-2">The posting is read in your browser. It is not sent anywhere and not saved.</p>
        <button type="button" onClick={find} disabled={!cards && !failed} className="mt-3 rounded-xl bg-marker px-5 py-3 font-bold text-marker-ink hover:brightness-110 disabled:opacity-50">Find my deck</button>
        {message && <p className="mt-3 text-ink" role="status">{message}</p>}
      </div>

      {failed && (
        <div className="rounded-2xl border border-line bg-surface p-6">
          <p className="text-ink">The question bank could not load. Check your connection and try again.</p>
          <button type="button" onClick={load} className="mt-4 rounded-xl bg-marker px-4 py-2 font-bold text-marker-ink hover:brightness-110">Try again</button>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <section aria-label="What they ask for">
            <h2 className="font-display text-xl font-bold text-ink">What they ask for</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {result.found.map((f) => (
                <li key={f.id} className="rounded-full border border-line bg-surface px-3 py-1 text-sm text-ink">
                  <span aria-hidden>{MARK[f.status]} </span><span className="font-bold">{f.label}</span>
                  <span className="text-ink-2"> · {f.cards} card{f.cards === 1 ? '' : 's'} · {f.reviewed} reviewed</span>
                  <span className="sr-only"> ({f.status})</span>
                </li>
              ))}
            </ul>
          </section>
          <PhoneAnswers found={result.found} pitches={pitches} onUnlock={setPitches} />
          {result.deck.length > 0 && <Deck deck={result.deck} />}
          <section aria-label="Gaps" className="space-y-3">
            <GapList title="Not covered here: study these elsewhere" items={result.gaps.missing} />
            <GapList title="Covered thinly: a few cards only" items={result.gaps.thin} />
            <GapList title="Covered, but you have not reviewed most of it" items={result.gaps.unreviewed} />
            {(result.gaps.missing.length + result.gaps.thin.length + result.gaps.unreviewed.length > 0) && (
              <button type="button" onClick={copy} className="rounded-xl border border-line bg-surface px-4 py-2 font-bold text-ink hover:border-marker">{copied ? 'Copied' : 'Copy the gap list'}</button>
            )}
          </section>
        </div>
      )}

      {!result && saved && (
        <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
          <p className="font-bold text-ink">From your last posting, analysed on {new Date(saved.at).toLocaleDateString()}</p>
          <ul className="flex flex-wrap gap-2">
            {saved.skills.map((id) => <li key={id} className="rounded-full border border-line px-3 py-1 text-sm text-ink">{SKILLS.find((s: { id: string }) => s.id === id)?.label ?? id}</li>)}
          </ul>
          {savedDeck.length > 0 && <Deck deck={savedDeck} />}
          <button type="button" onClick={() => { try { clearResult(localStorage); } catch { /* ignore */ } setSaved(null); }} className="rounded-xl border border-line px-4 py-2 font-bold text-ink hover:border-marker">Clear</button>
        </div>
      )}
    </div>
  );
}
