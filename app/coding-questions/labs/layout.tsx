import StudyGuideLink from '../../components/StudyGuideLink';

export const metadata = {
  title: 'Coding Labs — Interactive Practice',
  description: 'Step-through algorithm modules, HackerRank-style problems and React coding exercises.',
};

export default function LabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <StudyGuideLink href="/coding-questions" />
    </>
  );
}
