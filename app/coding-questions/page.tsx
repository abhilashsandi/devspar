import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'Coding Practice — Interview Prep',
  description: "Algorithm, data-structure and React coding exercises with worked solutions, approach and trade-offs, plus interactive step-through labs.",
};

export default function Page() {
  return (
    <StaticPrepClient
      src="/study/coding-questions.html"
      title="Coding Practice — Interview Prep"
      loadingLabel="Loading study guide…"
    />
  );
}
