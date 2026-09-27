import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'Node.js Interview Mastery',
  description: "Node.js architecture, the event loop, streams, worker threads, scaling, security and testing with node:test, from fundamentals to production.",
};

export default function Page() {
  return (
    <StaticPrepClient
      src="/study/nodejs.html"
      title="Node.js Interview Mastery"
      loadingLabel="Loading study guide…"
    />
  );
}
