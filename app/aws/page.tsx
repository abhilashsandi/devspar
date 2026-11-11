import StaticPrepClient from '../components/StaticPrepClient';

export const metadata = {
  title: 'AWS Interview Guide',
  description: 'IAM, VPC networking, Lambda, ECS and EC2, S3, RDS/Aurora and DynamoDB, SQS, SNS and EventBridge, observability, IaC, disaster recovery and cost, with reference architectures, diagrams and quizzes.',
};

export default function Page() {
  return (
    <StaticPrepClient
      src="/study/aws.html"
      title="AWS Interview Guide"
      loadingLabel="Loading study guide…"
    />
  );
}
