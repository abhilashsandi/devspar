'use client';

/* eslint-disable react-hooks/set-state-in-effect -- these pages keep everything in the reader's browser: storage and the clock only exist after hydration, so they are read in an effect (reading them during render would make the server and client HTML differ) */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { loadBank, readProgress } from '../lib/bank.mjs';
import { ROLES, MINUTES_CHOICES, buildPlan, eveList, warmupList, readSettings, saveSettings } from '../lib/plan.mjs';
import { TOOLS } from '../lib/tools.mjs';
import { localToday } from '../lib/today';

type Card = Awaited<ReturnType<typeof loadBank>>[number];
type Settings = { date: string; role: string; minutesPerDay: number };
type Block = ReturnType<typeof buildPlan>['days'][number]['blocks'][number];
type Day = ReturnType<typeof buildPlan>['days'][number];
type Tab = 'plan' | 'eve' | 'warm';

const mockReady = TOOLS.some((t: { id: string; ready: boolean }) => t.id === 'mock' && t.ready);
const label = (date: string, long: boolean) =>
  new Date(date + 'T00:00:00Z').toLocaleDateString('en-GB', { timeZone: 'UTC', weekday: long ? 'long' : 'short', day: 'numeric', month: long ? 'long' : 'short' });
const duration = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function BlockRow({ b }: { b: Block }) {
  const link = 'font-bold text-marker underline-offset-2 hover:underline';
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line py-2 last:border-b-0">
      <span className="text-ink">{b.label}</span>
      <span className="text-sm text-ink-2">
        {b.cards.length > 0 && `${plural(b.cards.length, 'card', 'cards')} · `}{b.minutes > 0 && `${b.minutes} min · `}
        {b.kind === 'mock' ? (
          mockReady ? <Link href={b.href} className={link}>Start a mock round</Link> : <span>Do one timed mock round</span>
        ) : b.kind === 'eve' ? (
          <span>See the Night before tab</span>
        ) : b.kind === 'review' ? (
          <Link href={b.href} className={link}>Open the guide</Link>
        ) : (
          <Link href={b.href} className={link}>Open as flashcards</Link>
        )}
      </span>
    </li>
  );
}

export default function PlanClient() {
  const [today, setToday] = useState('');
  const [settings, setSettings] = useState<Settings>({ date: '', role: 'fullstack', minutesPerDay: 45 });
  const [cards, setCards] = useState<Card[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState<{ reviewed: Set<string>; weak: Map<string, number> }>({ reviewed: new Set(), weak: new Map() });
  const [tab, setTab] = useState<Tab>('plan');

  const load = useCallback(() => { setFailed(false); loadBank().then((c: Card[]) => setCards(c)).catch(() => setFailed(true)); }, []);
  useEffect(() => {
    setToday(localToday());
    try { const s = readSettings(localStorage); if (s) setSettings(s); setProgress(readProgress(localStorage)); } catch { /* storage unavailable */ }
    load();
    const onStorage = () => { try { setProgress(readProgress(localStorage)); } catch { /* ignore */ } };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [load]);

  const change = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    if (next.date) try { saveSettings(localStorage, next); } catch { /* ignore */ }
  };

  const plan = useMemo(
    () => (cards && today && settings.date ? buildPlan({ today, ...settings, cards, ...progress }) : null),
    [cards, today, settings, progress],
  );
  const warm = useMemo(
    () => (cards && settings.date ? warmupList({ role: settings.role, date: settings.date, cards, ...progress }) : null),
    [cards, settings, progress],
  );
  const eve = useMemo(() => (cards ? eveList(settings.role, cards, progress.weak) : []), [cards, settings.role, progress.weak]);

  const field = 'mt-1 block rounded-xl border border-line bg-surface px-3 py-2 text-ink';
  const settingsRow = (
    <div className="flex flex-wrap gap-4 rounded-2xl border border-line bg-surface p-4">
      <label className="block text-sm font-bold text-ink-2">Interview date
        <input type="date" min={today || undefined} value={settings.date} onChange={(e) => change({ date: e.target.value })} className={field} />
      </label>
      <label className="block text-sm font-bold text-ink-2">Role
        <select value={settings.role} onChange={(e) => change({ role: e.target.value })} className={field}>
          {ROLES.map((r: { id: string; label: string }) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </label>
      <label className="block text-sm font-bold text-ink-2">Time each day
        <select value={settings.minutesPerDay} onChange={(e) => change({ minutesPerDay: Number(e.target.value) })} className={field}>
          {MINUTES_CHOICES.map((m: number) => <option key={m} value={m}>{m} min</option>)}
        </select>
      </label>
    </div>
  );

  const warmup = warm && (
    <div className="space-y-4">
      <ul className="rounded-2xl border border-line bg-surface px-4">{warm.blocks.map((b: Block) => <BlockRow key={b.label} b={b} />)}</ul>
      <ol className="list-decimal space-y-1 pl-6 text-ink">{warm.prompts.map((p: string) => <li key={p}>{p}</li>)}</ol>
    </div>
  );

  let body: React.ReactNode = null;
  if (failed) {
    body = (
      <div className="rounded-2xl border border-line bg-surface p-6">
        <p className="text-ink">The question bank could not load. Check your connection and try again.</p>
        <button type="button" onClick={load} className="mt-4 rounded-xl bg-marker px-4 py-2 font-bold text-marker-ink hover:brightness-110">Try again</button>
      </div>
    );
  } else if (!settings.date) {
    body = <p className="text-lg text-ink-2">Pick your interview date to get a plan.</p>;
  } else if (!plan) {
    body = <p className="text-ink-2">Loading…</p>;
  } else if (plan.status === 'past') {
    body = <p className="text-lg text-ink">That date has passed. Set your next one.</p>;
  } else if (plan.status === 'today') {
    body = (
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-ink">It is today. Good luck.</h2>
        {warmup}
      </div>
    );
  } else {
    const reviewDays = plan.days.filter((d: Day) => d.blocks[0]?.kind === 'review').length;
    const t = plan.totals;
    const first = plan.days[0];
    const tabs: [Tab, string][] = [['plan', 'Plan'], ['eve', 'Night before'], ['warm', '30 minutes before']];
    body = (
      <div className="space-y-5">
        <div>
          <p className="font-display text-xl font-bold text-ink" data-testid="summary">
            {plural(plan.daysLeft, 'day', 'days')} to go · {plural(t.cards, 'card', 'cards')} · about {duration(t.minutes)} of study
          </p>
          <p className={`mt-1 ${t.fits ? 'text-done' : 'text-red-marker'}`} data-testid="fit">
            {t.fits
              ? `This fits in your time${reviewDays ? `, with ${plural(reviewDays, 'day', 'days')} of review at the end` : ''}.`
              : `This does not fit: ${t.dropped.core + t.dropped.other} cards are left out (${t.dropped.core} core, ${t.dropped.other} other). Add time each day, or accept the cut: core cards are kept first.`}
          </p>
        </div>
        <div role="tablist" aria-label="Plan views" className="flex flex-wrap gap-2">
          {tabs.map(([id, name]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              className={`rounded-xl border px-4 py-2 font-bold ${tab === id ? 'border-marker bg-marker text-marker-ink' : 'border-line bg-surface text-ink hover:border-marker'}`}>{name}</button>
          ))}
        </div>
        {tab === 'plan' && (
          <div className="space-y-4" role="tabpanel">
            <section className="rounded-2xl border-2 border-marker bg-surface p-5">
              <h2 className="font-display text-xl font-bold text-ink">Today · {label(first.date, true)} · {first.minutes} min</h2>
              <ul className="mt-2">{first.blocks.map((b: Block) => <BlockRow key={b.label} b={b} />)}</ul>
            </section>
            <ul className="space-y-2">
              {plan.days.slice(1).map((d: Day) => (
                <li key={d.date}>
                  <details className="rounded-xl border border-line bg-surface px-4 py-2">
                    <summary className="cursor-pointer font-bold text-ink">{label(d.date, false)} · {d.kind === 'eve' ? 'the night before' : d.kind} {d.minutes > 0 && `· ${d.minutes} min`}</summary>
                    <ul className="mt-2">{d.blocks.map((b: Block) => <BlockRow key={b.label} b={b} />)}</ul>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        )}
        {tab === 'eve' && (
          <ul className="space-y-2 rounded-2xl border border-line bg-surface p-4" role="tabpanel" id="eve">
            {eve.map((item: { label: string; href: string | null }) => (
              <li key={item.label} className="flex items-baseline gap-3 text-ink">
                <input type="checkbox" aria-label={item.label} className="h-4 w-4 shrink-0" />
                {item.href ? <Link href={item.href} className="text-marker underline-offset-2 hover:underline">{item.label}</Link> : <span>{item.label}</span>}
              </li>
            ))}
          </ul>
        )}
        {tab === 'warm' && <div role="tabpanel">{warmup}</div>}
      </div>
    );
  }

  return <div className="space-y-6">{settingsRow}{body}</div>;
}
