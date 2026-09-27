import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'CSS & Tailwind Interview Mastery',
  description: "CSS fundamentals, Flexbox and Grid, Tailwind v4 (@theme, @source, container queries), cascade layers and design-system patterns.",
};

export default function Page() {
  return (
    <StaticPrepClient
      src="/study/tailwind-css.html"
      title="CSS & Tailwind Interview Mastery"
      loadingLabel="Loading study guide…"
    />
  );
}
