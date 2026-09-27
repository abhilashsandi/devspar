import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'React Training — Interview Prep',
  description: "React hooks, rendering performance, state management, React 19 and Suspense, testing and rendering internals, with interactive labs.",
};

export default function Page() {
  return (
    <StaticPrepClient
      src="/study/react-training.html"
      title="React Training — Interview Prep"
      loadingLabel="Loading study guide…"
    />
  );
}
