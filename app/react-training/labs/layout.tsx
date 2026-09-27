import StudyGuideLink from '../../components/StudyGuideLink';

export const metadata = {
  title: 'React Labs — Interactive Practice',
  description: 'Reducer trace, memoization, React Testing Library, forms and React 19 simulators, plus an AI mock interviewer.',
};

export default function LabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <StudyGuideLink href="/react-training" />
    </>
  );
}
