import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'AI-Assisted Development Interview Guide',
  description: "How a full-stack developer builds with AI agents: prompting, context engineering, agent harnesses, MCP, spec-driven development, the BMad Method, skills, security and the interview questions about all of it.",
};

export default function Page() {
  return (
    <StaticPrepClient
      src="/study/ai-dev.html"
      title="AI-Assisted Development Interview Guide"
      loadingLabel="Loading study guide…"
    />
  );
}
