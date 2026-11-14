import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'Whiteboard Explanations',
  description: "What to draw and what to say in a whiteboard interview: the event loop, React rendering, a request through the stack, indexes, caching, queues, auth, RAG and a system-design answer.",
};

export default function Page() {
  return (
    <StaticPrepClient
      src="/study/whiteboard.html"
      title="Whiteboard Explanations"
      loadingLabel="Loading study guide…"
    />
  );
}
