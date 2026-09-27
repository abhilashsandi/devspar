import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'Optimize at Every Layer — Interview Prep',
  description: "A full performance-optimization playbook: client, edge, API, server, cache and database, with the numbers worth knowing cold.",
};

export default function PerformanceOptimizationPage() {
  return (
    <StaticPrepClient
      src="/study/performance-optimization.html"
      title="Optimize at Every Layer — Interview Prep"
      loadingLabel="Loading optimization guide…"
    />
  );
}
