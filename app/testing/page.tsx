import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'Testing',
  description: "Test strategy, unit tests, React Testing Library, MSW, Playwright and back-end tests in Node.js. Every sample was run before it was written down.",
};

export default function Page() {
  return (
    <StaticPrepClient
      src="/study/testing.html"
      title="Testing"
      loadingLabel="Loading study guide…"
    />
  );
}
