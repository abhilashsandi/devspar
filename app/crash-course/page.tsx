import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'Interview Crash Course',
  description: 'A 5 to 12 minute refresher per stream, read top to bottom before an interview: JavaScript, TypeScript, React, Next.js, Node.js, CSS, web and security, testing, databases, system design, reliability, performance, GenAI and AWS.',
};

export default function Page() {
  return (
    <StaticPrepClient
      src="/study/crash-course.html"
      title="Interview Crash Course"
      loadingLabel="Loading crash course…"
    />
  );
}
