import ToolShell from '../components/ToolShell';
import StoriesClient from './StoriesClient';

export const metadata = {
  title: 'Story bank',
  description: 'Write your STAR stories, check their shape and see which competencies they cover. Your stories stay in your browser.',
};

export default function Page() {
  return (
    <ToolShell title="Story bank" lede="Write the stories you will tell, check each one has the shape interviewers look for, and see what your set leaves uncovered.">
      <StoriesClient />
    </ToolShell>
  );
}
