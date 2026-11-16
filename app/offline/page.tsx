import Link from 'next/link';

export const metadata = { title: 'Offline', robots: { index: false } };

export default function Page() {
  return (
    <main className="mx-auto max-w-xl px-5 py-20 text-ink">
      <h1 className="font-display text-3xl font-extrabold">You are offline, and this page has not been saved yet.</h1>
      <p className="mt-4 text-lg text-ink-2">Pages you opened while you were connected, or saved with “Save for offline” on the home page, still work.</p>
      <p className="mt-6">
        <Link href="/" className="font-bold text-marker underline-offset-2 hover:underline">Go to the home page</Link>
      </p>
    </main>
  );
}
