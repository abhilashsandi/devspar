import ToolShell from '../components/ToolShell';
import MatchClient from './MatchClient';

export const metadata = {
  title: 'Job match',
  description: 'Paste a job posting to get a flashcard deck for the skills it asks for, and a list of gaps. The posting stays in your browser.',
};

export default function Page() {
  return (
    <ToolShell title="Job match" lede="Paste a job posting. You get the skills it asks for, a deck of cards that cover them, and the gaps.">
      <MatchClient />
    </ToolShell>
  );
}
