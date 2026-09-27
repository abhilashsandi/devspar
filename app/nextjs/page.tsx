import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'Next.js Interview Mastery',
  description: "Next.js 16: the App Router, Server Components, Cache Components, proxy.ts, Server Actions, caching and deployment, with diagrams.",
};

export default function Page() {
  return (
    <StaticPrepClient
      src="/study/nextjs.html"
      title="Next.js Interview Mastery"
      loadingLabel="Loading study guide…"
    />
  );
}
