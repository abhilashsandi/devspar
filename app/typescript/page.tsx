import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'TypeScript Interview Mastery',
  description: "TypeScript from the type system up: structural typing, narrowing, generics, conditional and mapped types, real-world patterns, tooling and migration, with diagrams and quizzes.",
};

export default function Page() {
  return (
    <StaticPrepClient
      src="/study/typescript.html"
      title="TypeScript Interview Mastery"
      loadingLabel="Loading study guide…"
    />
  );
}
