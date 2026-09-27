import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'Fullstack Developer Interview Prep',
  description: "402 questions in one place, starting with a timed 2-hour review — JS, TS, React, Next.js, Node, databases, system design, performance, testing and more.",
};

export default function InterviewPrepPage() {
  return (
    <StaticPrepClient
      src="/study/interview-prep.html"
      title="Fullstack Developer Interview Prep"
      loadingLabel="Loading interview prep…"
    />
  );
}
