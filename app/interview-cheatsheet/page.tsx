import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'Interview Cheatsheet',
  description: "A last-two-hours revision plan and a one-line answer for every topic, with a 30-minute must-know pass.",
};

export default function InterviewCheatsheetPage() {
  return (
    <StaticPrepClient
      src="/study/interview-cheatsheet.html"
      title="Interview Cheatsheet"
      loadingLabel="Loading cheatsheet…"
    />
  );
}
