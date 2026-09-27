import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'JavaScript — Interview Prep',
  description: "Closures, prototypes, the event loop, promises, generators, modules and DOM events, categorized with flashcards and a Quick Reference.",
};

export default function Page() {
  return (
    <StaticPrepClient
      src="/study/javascript.html"
      title="JavaScript — Interview Prep"
      loadingLabel="Loading study guide…"
    />
  );
}
