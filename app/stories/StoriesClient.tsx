'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { loadBank } from '../lib/bank.mjs';
import { COMPETENCIES, analyse, coverage, upsert, remove, exportJson, importJson, toText, readStories, writeStories } from '../lib/stories.mjs';

type Story = { id: string; title: string; competencies: string[]; s: string; t: string; a: string; r: string; updatedAt: string };
type Card = Awaited<ReturnType<typeof loadBank>>[number];
type Draft = { story: Story; isNew: boolean };

const DRAFT = 'story-draft';
const STORAGE_FULL = 'Could not save: this browser’s storage is full or blocked. Export your stories to keep them.';
const GUIDE: Record<'s' | 't' | 'a' | 'r', [string, string]> = {
  s: ['Situation', 'Two sentences: where, when, what was at stake.'],
  t: ['Task', 'What you were responsible for.'],
  a: ['Action', 'What you did, in order, and why. This is most of the story.'],
  r: ['Result', 'What changed, with a number, and what you learned.'],
};
const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
const words = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function StoriesClient() {
  const [stories, setStories] = useState<Story[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [cards, setCards] = useState<Card[] | null>(null);
  const [message, setMessage] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [timer, setTimer] = useState<{ start: number; elapsed: number; running: boolean }>({ start: 0, elapsed: 0, running: false });
  const fileInput = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => { try { setStories(readStories(localStorage)); } catch { /* storage unavailable */ } }, []);
  useEffect(() => {
    refresh(); setLoaded(true);
    try { const raw = sessionStorage.getItem(DRAFT); if (raw) setDraft(JSON.parse(raw) as Draft); } catch { /* ignore a bad draft */ }
    loadBank().then((c: Card[]) => setCards(c)).catch(() => setCards(null));
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, [refresh]);

  // an unsaved draft survives a reload or a crashed tab
  useEffect(() => {
    if (!loaded) return;
    try { if (draft) sessionStorage.setItem(DRAFT, JSON.stringify(draft)); else sessionStorage.removeItem(DRAFT); } catch { /* ignore */ }
  }, [draft, loaded]);

  useEffect(() => {
    if (!timer.running) return;
    const t = setInterval(() => setTimer((x) => ({ ...x, elapsed: Math.round((Date.now() - x.start) / 1000) })), 500);
    return () => clearInterval(t);
  }, [timer.running]);

  const cover = coverage(stories) as { id: string; label: string; sec: string; count: number }[];
  const change = (patch: Partial<Story>) => setDraft((d) => (d ? { ...d, story: { ...d.story, ...patch } } : d));
  const edit = (s: Story) => { setMessage(''); setDraft({ story: s, isNew: false }); setTimer({ start: 0, elapsed: 0, running: false }); };
  const create = () => { setMessage(''); setDraft({ story: { id: newId(), title: '', competencies: [], s: '', t: '', a: '', r: '', updatedAt: '' }, isNew: true }); setTimer({ start: 0, elapsed: 0, running: false }); };

  const save = () => {
    if (!draft) return;
    const s = { ...draft.story, title: draft.story.title.trim() || 'Untitled story', updatedAt: new Date().toISOString() };
    const next = upsert(stories, s) as Story[];
    if (!writeStories(localStorage, next)) { setMessage(STORAGE_FULL); return; }
    setStories(next); setDraft(null); setMessage('');
  };
  const del = () => {
    if (!draft || !window.confirm('Delete this story? This cannot be undone.')) return;
    const next = remove(stories, draft.story.id) as Story[];
    if (!writeStories(localStorage, next)) { setMessage(STORAGE_FULL); return; }
    setStories(next); setDraft(null);
  };
  const copy = async () => {
    if (!draft) return;
    try { await navigator.clipboard.writeText(toText(draft.story)); setMessage('Copied.'); } catch { setMessage('Copying is not allowed here. Select the text and copy it by hand.'); }
  };
  const doExport = () => {
    const blob = new Blob([exportJson(stories, new Date().toISOString())], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `devspar-stories-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const doImport = async (file: File | undefined) => {
    if (!file) return;
    setMessage('');
    try {
      if (file.size > 1_000_000) throw new Error('That is not a DevSpar story file.');
      const r = importJson(await file.text(), stories) as { stories: Story[]; added: number; updated: number; skipped: number };
      if (!writeStories(localStorage, r.stories)) { setMessage(STORAGE_FULL); return; }
      setStories(r.stories);
      setMessage(`Imported: ${r.added} added, ${r.updated} updated, ${r.skipped} skipped.`);
    } catch (e) { setMessage((e as Error).message || 'That is not a DevSpar story file.'); }
    if (fileInput.current) fileInput.current.value = '';
  };

  const a = draft ? analyse(draft.story) as ReturnType<typeof analyse> : null;
  const box = 'rounded-2xl border border-line bg-surface';
  const btn = 'rounded-xl border border-line bg-surface px-4 py-2 font-bold text-ink hover:border-marker hover:text-marker';
  const primary = 'rounded-xl bg-marker px-5 py-3 font-bold text-marker-ink hover:brightness-110';

  return (
    <div className="space-y-8">
      <div className="space-y-6 print:hidden">
        <p className="text-ink-2">Your stories are saved in this browser only. Export a copy to keep them safe: clearing site data deletes them.</p>
        <p className="text-ink">Aim for six to eight stories that cover all five areas.</p>

        <section aria-label="Coverage" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cover.map((c) => {
            const qs = (cards || []).filter((x) => x.kind === 'behavioural' && x.sec === c.sec);
            return (
              <div key={c.id} className={`${box} p-4`}>
                <h2 className="font-bold text-ink">{c.label}</h2>
                <p className={c.count ? 'mt-1 text-done' : 'mt-1 font-bold text-red-marker'} data-testid={`cover-${c.id}`}>{c.count ? `${c.count} ${c.count === 1 ? 'story' : 'stories'}` : 'No story yet'}</p>
                {qs.length > 0 && (
                  <details className="mt-2 text-sm">
                    <summary className="cursor-pointer font-bold text-marker">Questions this answers</summary>
                    <ul className="mt-2 space-y-1">{qs.map((q) => <li key={q.tkey}><Link href={q.href} className="text-ink-2 underline-offset-2 hover:text-marker hover:underline">{q.q}</Link></li>)}</ul>
                  </details>
                )}
              </div>
            );
          })}
        </section>

        <section aria-label="Your stories" className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="mr-auto font-display text-xl font-bold text-ink">Your stories</h2>
            <button type="button" onClick={create} className={primary}>New story</button>
            <button type="button" onClick={doExport} className={btn} disabled={!stories.length}>Export</button>
            <button type="button" onClick={() => fileInput.current?.click()} className={btn}>Import</button>
            <input ref={fileInput} type="file" accept=".json,application/json" className="sr-only" aria-label="Import a story file" onChange={(e) => doImport(e.target.files?.[0])} />
            <button type="button" onClick={() => window.print()} className={btn} disabled={!stories.length}>Print</button>
          </div>
          {message && <p className="text-ink" role="status">{message}</p>}
          {stories.length === 0 ? <p className="text-ink-2">No stories yet.</p> : (
            <ul className={`${box} px-4`}>
              {stories.map((s) => {
                const an = analyse(s) as ReturnType<typeof analyse>;
                return (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-3 last:border-b-0">
                    <div>
                      <p className="font-bold text-ink">{s.title}</p>
                      <p className="text-sm text-ink-2">
                        {s.competencies.map((id) => COMPETENCIES.find((c: { id: string }) => c.id === id)?.label).filter(Boolean).join(' · ') || 'No competency chosen'}
                        {' · '}{an.ready ? `${an.checks.filter((c) => c.ok).length} of ${an.checks.length} checks` : 'not enough text to check yet'} · about {an.seconds} s
                      </p>
                    </div>
                    <button type="button" onClick={() => edit(s)} className={btn}>Edit</button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {draft && a && (
          <section aria-label="Story editor" className={`${box} space-y-4 p-5`}>
            <label className="block text-sm font-bold text-ink-2">Title
              <input value={draft.story.title} onChange={(e) => change({ title: e.target.value })} className="mt-1 block w-full rounded-xl border border-line bg-board px-3 py-2 text-ink" />
            </label>
            <fieldset>
              <legend className="text-sm font-bold text-ink-2">What does this story show?</legend>
              <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
                {COMPETENCIES.map((c: { id: string; label: string }) => (
                  <label key={c.id} className="flex items-center gap-2 text-ink">
                    <input type="checkbox" checked={draft.story.competencies.includes(c.id)}
                      onChange={(e) => change({ competencies: e.target.checked ? [...draft.story.competencies, c.id] : draft.story.competencies.filter((x) => x !== c.id) })} />
                    {c.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="space-y-4">
                {(Object.keys(GUIDE) as ('s' | 't' | 'a' | 'r')[]).map((k) => (
                  <label key={k} className="block text-sm font-bold text-ink-2">
                    <span className="flex justify-between"><span>{GUIDE[k][0]}</span><span className="font-normal">{words(draft.story[k])} words</span></span>
                    <span className="block font-normal text-ink-2">{GUIDE[k][1]}</span>
                    <textarea value={draft.story[k]} onChange={(e) => change({ [k]: e.target.value } as Partial<Story>)} rows={k === 'a' ? 7 : 3}
                      className="mt-1 block w-full rounded-xl border border-line bg-board px-3 py-2 font-normal text-ink" />
                  </label>
                ))}
              </div>
              <aside aria-label="Checks" className="space-y-3 self-start rounded-xl border border-line bg-board p-4" aria-live="polite">
                <h3 className="font-bold text-ink">Checks</h3>
                {a.ready ? (
                  <ul className="space-y-2 text-sm">
                    {a.checks.map((c) => <li key={c.id} className={c.ok ? 'text-done' : 'text-red-marker'}><span aria-hidden>{c.ok ? '✓ ' : '✗ '}</span><span className="sr-only">{c.ok ? 'Passed: ' : 'Needs work: '}</span>{c.text}</li>)}
                  </ul>
                ) : <p className="text-sm text-ink-2">Start writing: the checks appear as you go.</p>}
                <div className="border-t border-line pt-3 text-sm text-ink-2">
                  <p>About {a.seconds} s to say ({a.words.total} words).</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button type="button" className={btn} onClick={() => setTimer(timer.running ? { ...timer, running: false } : { start: Date.now(), elapsed: 0, running: true })}>{timer.running ? 'Stop' : 'Say it'}</button>
                    {(timer.running || timer.elapsed > 0) && <span>{clock(timer.elapsed)}</span>}
                  </div>
                </div>
              </aside>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={save} className={primary}>Save story</button>
              <button type="button" onClick={copy} className={btn}>Copy as text</button>
              {!draft.isNew && <button type="button" onClick={del} className={btn}>Delete</button>}
              <button type="button" onClick={() => { setDraft(null); setMessage(''); }} className={btn}>Close</button>
            </div>
          </section>
        )}
      </div>

      {/* printing: just the stories, as plain text, one per page */}
      <div className="hidden print:block">
        {stories.map((s) => <pre key={s.id} className="mb-8 whitespace-pre-wrap font-sans text-sm text-black" style={{ breakAfter: 'page' }}>{toText(s)}</pre>)}
      </div>
    </div>
  );
}
