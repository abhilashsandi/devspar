import ToolShell from '../components/ToolShell';
import MockClient from './MockClient';

export const metadata = {
  title: 'Mock round',
  description: 'A timed 45-minute interview drawn from the study guides: behavioural, concepts, whiteboard, a bug and a SQL puzzle, with a scorecard.',
};

export default function Page() {
  return (
    <ToolShell title="Mock round" lede="Forty-five minutes, eight questions, no notes. Answer out loud, then rate yourself honestly.">
      <MockClient />
    </ToolShell>
  );
}
