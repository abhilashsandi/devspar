import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'Behavioural Interviews',
  description: "A STAR question bank by competency: what each question checks, the shape of a strong answer, a worked example and the follow-ups to expect.",
};

export default function Page() {
  return (
    <StaticPrepClient
      src="/study/behavioural.html"
      title="Behavioural Interviews"
      loadingLabel="Loading study guide…"
    />
  );
}
