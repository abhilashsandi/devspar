import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'GenAI Interview Prep',
  description: "How LLMs, embeddings, RAG, tool calling, MCP and agents fit together, with diagrams, a cheatsheet and a full worked AI-comparison example.",
};

export default function GenAIPage() {
  return (
    <StaticPrepClient
      src="/study/genai.html"
      title="GenAI Interview Prep"
      loadingLabel="Loading GenAI guide…"
    />
  );
}
