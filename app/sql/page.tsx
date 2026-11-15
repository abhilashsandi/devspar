import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'Data and SQL',
  description: "Indexes, transactions and isolation, query puzzles, schema changes without downtime, and PostgreSQL from Node.js. Every result comes from a real run.",
};

export default function Page() {
  return (
    <StaticPrepClient
      src="/study/sql.html"
      title="Data and SQL"
      loadingLabel="Loading study guide…"
    />
  );
}
