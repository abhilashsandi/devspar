import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'System Design — Interview Prep',
  description: "Architectural styles, microservices, messaging, sagas, real outages, AWS building blocks and five fully worked system designs.",
};

export default function Page() {
  return (
    <StaticPrepClient
      src="/study/system-design.html"
      title="System Design — Interview Prep"
      loadingLabel="Loading study guide…"
    />
  );
}
