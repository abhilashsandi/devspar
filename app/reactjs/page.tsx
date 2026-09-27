import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'React + TypeScript Interview Mastery',
  description: "React with TypeScript: typed hooks and generics, rendering internals, state, testing and advanced patterns, with a Quick Reference.",
};

export default function Page() {
  return (
    <StaticPrepClient
      src="/study/reactjs.html"
      title="React + TypeScript Interview Mastery"
      loadingLabel="Loading study guide…"
    />
  );
}
