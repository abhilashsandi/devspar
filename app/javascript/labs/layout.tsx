import StudyGuideLink from '../../components/StudyGuideLink';

export const metadata = {
  title: 'JavaScript Labs — Interactive Practice',
  description: 'Promise method visualisers, promise chaining, custom errors, and CSS positioning and selector demos.',
};

export default function LabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <StudyGuideLink href="/javascript" />
    </>
  );
}
