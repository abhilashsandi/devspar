import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

/** The frame every practice tool page uses: a top bar, a title and a lede, then the tool itself. */
export default function ToolShell({ title, lede, children }: { title: string; lede: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-board font-sans text-ink selection:bg-hl selection:text-ink">
      <header className="border-b border-line bg-surface px-5">
        <nav className="mx-auto flex max-w-4xl items-center justify-between gap-4 py-3" aria-label="Main">
          <Link href="/" className="font-display text-xl font-extrabold tracking-tight text-ink">
            <span aria-hidden>← </span>DevSpar
          </Link>
          <ThemeToggle />
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-2">{lede}</p>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
