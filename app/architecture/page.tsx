import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'Architecture Patterns',
  description: "Frontend and full-stack (Node.js) architecture patterns: monolith, modular monolith, microservices, BFF, micro-frontends, event-driven, hexagonal, CQRS and AI-era patterns, plus worked design answers for a banking app, a data-heavy dashboard and a ticket system.",
};

export default function Page() {
  return (
    <StaticPrepClient
      src="/study/architecture.html"
      title="Architecture Patterns"
      loadingLabel="Loading study guide…"
    />
  );
}
