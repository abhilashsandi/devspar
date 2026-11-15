import ToolShell from '../components/ToolShell';
import DrillsClient from './DrillsClient';

export const metadata = {
  title: 'Estimation drills',
  description: 'Capacity, latency and availability sums with new numbers every time, so you practise the arithmetic and not a memorised answer.',
};

export default function Page() {
  return (
    <ToolShell title="Estimation drills" lede="Capacity and latency sums with new numbers every time. Eight drills a session, a worked route after each one.">
      <DrillsClient />
    </ToolShell>
  );
}
