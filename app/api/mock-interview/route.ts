import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// Server-side proxy for the React mock interviewer (app/react-training/components/MockInterviewModule.tsx).
//
// The Gemini API key must never reach the browser. It used to be read from
// NEXT_PUBLIC_GEMINI_API_KEY, which Next.js inlines into the client JS bundle at build time —
// shipping the site's own key to every visitor. This route reads a server-only GEMINI_API_KEY
// (no NEXT_PUBLIC_ prefix, so it stays server-side) and makes the call itself; the client only
// ever sends and receives chat text.
//
// The system prompt is built here, not accepted from the client, so a caller can't repurpose
// this endpoint (or the site's API budget) for an arbitrary prompt by bypassing the UI.

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are a Senior Technical Interviewer conducting a React Mock Interview.
The candidate has learned about: JS fundamentals (Promises, closures), React core hooks (useEffect, useMemo, custom hooks), React 18 (useDeferredValue, Suspense), React Router, React Testing Library, Controlled vs Uncontrolled components, and React 19 (useActionState, useOptimistic, use hook).
Instructions:
1. First, pick one random concept from the list above and ask a single, challenging interview question about it.
2. Wait for the candidate to answer.
3. When they answer, evaluate their response critically but constructively. Correct any misconceptions, give them a score out of 10, and then immediately ask the next question on a DIFFERENT random concept.
4. Keep your questions and evaluations concise and professional. Do NOT output markdown headers that are too large, just standard bold text.`;

const MODEL = 'gemini-3.5-flash';
const MAX_TURNS = 60;
const MAX_MESSAGE_LENGTH = 6000;

type IncomingMessage = { role: 'user' | 'model'; text: string };

function isValidHistory(value: unknown): value is IncomingMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= MAX_TURNS &&
    value.every(
      (m) =>
        m &&
        typeof m === 'object' &&
        (m.role === 'user' || m.role === 'model') &&
        typeof m.text === 'string' &&
        m.text.length > 0 &&
        m.text.length <= MAX_MESSAGE_LENGTH,
    )
  );
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { history, apiKey: userKey } = (body ?? {}) as { history?: unknown; apiKey?: unknown };
  if (!isValidHistory(history)) {
    return NextResponse.json({ error: 'Invalid chat history.' }, { status: 400 });
  }

  // A visitor's own key (if they chose to enter one) is used as-is, and is never logged; it goes
  // straight through to Google and out of scope again. Otherwise fall back to the site's own key.
  const apiKey = (typeof userKey === 'string' && userKey.trim()) || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'This demo has no Gemini API key configured. Enter your own key to use it.' },
      { status: 400 },
    );
  }

  const contents = [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'Understood. I am ready to begin the mock interview.' }] },
    ...history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
  ];

  try {
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({ model: MODEL, contents });
    return NextResponse.json({ text: response.text ?? '' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'The AI interviewer is unavailable right now.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
