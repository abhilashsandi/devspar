import StudyGuideLink from '../../components/StudyGuideLink';

export const metadata = {
  title: 'System Design Labs — Interactive Sandbox',
  description: 'A system-design sandbox, load balancer and chaos-monkey simulator for outages and resilience.',
};

export default function LabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <StudyGuideLink href="/system-design" />
    </>
  );
}
