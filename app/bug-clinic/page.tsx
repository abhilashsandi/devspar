import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'Bug Clinic',
  description: "Fifty find-the-bug exercises for JavaScript, React, Node.js, TypeScript, Next.js and CSS, each with the mechanism, the fix and how to explain it in an interview.",
};

export default function Page() {
  return (
    <StaticPrepClient
      src="/study/bug-clinic.html"
      title="Bug Clinic"
      loadingLabel="Loading study guide…"
    />
  );
}
