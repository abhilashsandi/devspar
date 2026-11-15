import ToolShell from '../components/ToolShell';
import PlanClient from './PlanClient';

export const metadata = {
  title: 'Interview plan',
  description: 'Enter your interview date and role to get a daily plan built from core, weak and unreviewed cards, plus a night-before list and a 30-minute warm-up.',
};

export default function Page() {
  return (
    <ToolShell title="Interview plan" lede="Pick your interview date. The plan is rebuilt from your progress every time you open it, so today is always the first day.">
      <PlanClient />
    </ToolShell>
  );
}
