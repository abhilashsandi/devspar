// Builds the standalone AWS guide (app/aws/content.json).
//   node scripts/study/add-aws-guide.mjs && npm run study:build
// Re-running rebuilds the guide from scratch; edit aws-content-*.mjs and run it again.
import { mkdir } from 'node:fs/promises';
import * as lib from './lib.mjs';
import * as H from './helpers.mjs';
import { foundations, security, compute, networking, storage } from './aws-content-a.mjs';
import { databases, messaging, devops, reliability, architectures, practice } from './aws-content-b.mjs';

const data = [
  { id: 'quickref', title: 'Quick Reference', questions: [] },
  { id: 'aws1', title: '1. Foundations & Accounts', questions: foundations },
  { id: 'aws2', title: '2. IAM & Security', questions: security },
  { id: 'aws3', title: '3. Compute', questions: compute },
  { id: 'aws4', title: '4. Networking & Edge', questions: networking },
  { id: 'aws5', title: '5. Storage', questions: storage },
  { id: 'aws6', title: '6. Databases & Caching', questions: databases },
  { id: 'aws7', title: '7. Messaging & Integration', questions: messaging },
  { id: 'aws8', title: '8. Observability & Delivery', questions: devops },
  { id: 'aws9', title: '9. Reliability, DR & Cost', questions: reliability },
  { id: 'aws10', title: '10. Reference Architectures', questions: architectures },
  { id: 'aws11', title: '11. Scenarios & Practice', questions: practice },
];
H.regenQuickRef(data);

const html = await H.newPage(
  {
    key: 'aws',
    title: 'AWS Interview Guide',
    brand: 'AWS',
    brandSub: 'IAM · compute · data · events',
    h1: 'AWS interview prep',
    eyebrow: 'Prep guide',
    lede: 'The AWS services a full-stack or backend engineer is asked about, and how they fit together: IAM, VPC networking, Lambda, ECS and EC2, S3, RDS/Aurora and DynamoDB, SQS, SNS and EventBridge, observability, IaC, DR and cost, with reference architectures, diagrams and quizzes.',
  },
  data,
);

await mkdir(new URL('../../app/aws/', import.meta.url), { recursive: true });
const total = await lib.save('aws', await lib.upgrade(html));
console.log('aws guide written: ' + data.length + ' sections, ' + total + ' cards');
