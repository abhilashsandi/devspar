import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'System Design at Scale — Interview Prep',
  description: "A senior-level, end-to-end answer to designing a full-stack app for millions of users.",
};

export default function SystemDesignScalePage() {
  return (
    <StaticPrepClient
      src="/study/system-design-scale.html"
      title="System Design at Scale — Interview Prep"
      loadingLabel="Loading system design guide…"
    />
  );
}
