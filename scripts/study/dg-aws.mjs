// AWS diagrams for the AWS guide and the Crash Course (all prefixed aws*). Same visual language as dg.mjs.
import { box, txt, arrow, rect, wrap, M } from './dg.mjs';

const defs = (id) => `<defs>${M(id, 'muted')}${M(id + 'a', 'accent')}${M(id + 'd', 'danger')}</defs>`;

export const AWS = {};

// A classic 3-tier web app inside one VPC across two Availability Zones.
AWS.vpc = wrap('0 0 900 430', `${defs('av')}
${rect(120, 12, 770, 408, 'panel', 'border')}${txt(132, 30, 'REGION  (e.g. us-east-1)', { color: 'accent', size: 9.5 })}
${rect(140, 40, 735, 372, 'panel-2', 'accent', { dash: true })}${txt(150, 404, 'VPC 10.0.0.0/16  ·  route tables decide public vs private', { color: 'accent', size: 9.5 })}
${box(10, 190, 96, 48, 'Users', 'internet', 'n')}
${box(150, 190, 96, 48, 'Internet GW', 'VPC edge', 'g')}
${arrow('M108 214 L146 214', 'av')}
${[0, 1].map((k) => {
  const x = 260 + k * 310;
  return rect(x, 60, 290, 325, 'panel', 'border') +
    txt(x + 12, 76, k ? 'AVAILABILITY ZONE B' : 'AVAILABILITY ZONE A', { size: 9.5, color: 'text', weight: 700 }) +
    rect(x + 12, 86, 266, 80, 'accent-soft', 'border') + txt(x + 22, 100, 'Public subnet', { size: 9 }) +
    box(x + 22, 112, 120, 44, 'ALB node', 'HTTPS :443', 'a') + box(x + 152, 112, 116, 44, 'NAT gateway', 'egress only', 'n') +
    rect(x + 12, 178, 266, 92, 'panel-2', 'border') + txt(x + 22, 192, 'Private app subnet', { size: 9 }) +
    box(x + 22, 204, 246, 52, 'App (ECS tasks / EC2)', 'in an auto scaling group', 'a') +
    rect(x + 12, 282, 266, 96, 'panel-2', 'border') + txt(x + 22, 296, 'Private data subnet', { size: 9 }) +
    box(x + 22, 306, 246, 52, k ? 'RDS standby' : 'RDS primary', k ? 'synchronous copy, auto failover' : 'Multi-AZ, SG allows only the app', k ? 'n' : 'g') +
    arrow(`M${x + 82} 158 L${x + 82} 200`, 'av') +
    arrow(`M${x + 210} 204 L${x + 210} 160`, 'av', 'muted', true) +
    (k ? '' : arrow(`M${x + 145} 258 L${x + 145} 302`, 'av'));
}).join('')}
${arrow('M672 258 L522 304', 'av')}
${arrow('M248 205 L278 150', 'av')}
${arrow('M198 188 L198 50 L652 50 L652 108', 'av')}
${txt(540, 336, 'sync', { anchor: 'middle', size: 9 })}<line x1="530" y1="340" x2="590" y2="340" stroke="var(--gold)" stroke-width="1.4" stroke-dasharray="4 4"/>
`, 'A three-tier web app in a VPC: an internet gateway and ALB in public subnets, app servers and a Multi-AZ RDS database in private subnets across two availability zones');

// A serverless API plus async worker path.
AWS.serverless = wrap('0 0 900 260', `${defs('as')}
${box(20, 40, 110, 60, 'Browser', 'SPA / mobile', 'n')}
${box(170, 40, 150, 60, 'CloudFront', '+ S3 static site', 'a')}
${box(360, 40, 140, 60, 'API Gateway', 'auth, throttling', 'a')}
${box(540, 40, 130, 60, 'Lambda', 'business logic', 'g')}
${box(710, 40, 170, 60, 'DynamoDB', 'on-demand, ms reads', 'a')}
${arrow('M132 70 L166 70', 'as')}${arrow('M322 70 L356 70', 'as')}${arrow('M502 70 L536 70', 'as')}${arrow('M672 70 L706 70', 'as')}
${box(360, 150, 140, 56, 'Cognito', 'JWT authorizer', 'n')}${arrow('M430 148 L430 104', 'as', 'muted', true)}
${arrow('M75 102 L75 178 L356 178', 'as', 'muted', true)}${txt(88, 170, 'sign in, get tokens', { size: 9 })}
${box(540, 150, 130, 56, 'SQS queue', 'buffer + DLQ', 'n')}${arrow('M605 102 L605 146', 'as')}
${box(710, 150, 170, 56, 'Worker Lambda', 'emails, images, webhooks', 'g')}${arrow('M672 178 L706 178', 'as')}
${txt(20, 240, 'Pay per request · scales to zero · watch cold starts, the 29 s API Gateway timeout, and account concurrency limits', { font: 'sans', size: 11 })}
`, 'Serverless API: CloudFront and S3 for the site, API Gateway with a Cognito authorizer, Lambda, DynamoDB, and an SQS queue feeding a worker Lambda');

// IAM policy evaluation, simplified.
AWS.iam = wrap('0 0 900 200', `${defs('ai')}
${box(20, 40, 160, 60, 'Request', 'principal, action, resource', 'n')}
${box(210, 40, 160, 60, 'Explicit Deny?', 'in any policy', 'd')}
${box(400, 40, 170, 60, 'SCP + boundary', 'allow the action?', 'g')}
${box(600, 40, 170, 60, 'Identity/resource', 'policy allows?', 'g')}
${box(800, 40, 80, 60, 'ALLOW', '', 'a')}
${arrow('M182 70 L206 70', 'ai')}${arrow('M372 70 L396 70', 'ai')}${txt(384, 62, 'no', { anchor: 'middle', size: 9 })}
${arrow('M572 70 L596 70', 'ai')}${txt(584, 62, 'yes', { anchor: 'middle', size: 9 })}
${arrow('M772 70 L796 70', 'aia', 'accent')}${txt(784, 62, 'yes', { anchor: 'middle', size: 9 })}
${arrow('M290 102 L290 136', 'aid', 'danger')}${txt(296, 124, 'yes', { size: 9 })}
${arrow('M485 102 L485 136', 'aid', 'danger')}${txt(491, 124, 'no', { size: 9 })}
${arrow('M685 102 L685 136', 'aid', 'danger')}${txt(691, 124, 'no', { size: 9 })}
${box(200, 140, 580, 44, 'DENY  (by default everything is denied unless allowed)', '', 'd')}
`, 'IAM evaluation: an explicit deny always wins, then organization SCPs and permission boundaries must allow, then an identity or resource policy must allow');

// Direct-to-S3 upload and event-driven processing.
AWS.upload = wrap('0 0 900 320', `${defs('au')}
${box(20, 30, 140, 56, 'Client', 'browser / app', 'n')}
${box(230, 30, 220, 56, 'API Gateway + Lambda', '1. returns a presigned PUT URL', 'a')}
${arrow('M162 58 L226 58', 'au')}
${box(230, 130, 220, 56, 'S3 bucket: uploads/', '2. client PUTs the file directly', 'g')}
${arrow('M90 88 L90 158 L226 158', 'au')}
${box(490, 130, 150, 56, 'EventBridge', '3. Object Created', 'a')}${arrow('M452 158 L486 158', 'au')}
${box(680, 130, 190, 56, 'SQS', 'buffer, retries, DLQ', 'n')}${arrow('M642 158 L676 158', 'au')}
${box(670, 230, 200, 56, 'Worker Lambda', '4. resize, scan, extract', 'g')}${arrow('M775 188 L775 226', 'au')}
${box(430, 230, 210, 56, 'S3 bucket: processed/', 'served through CloudFront', 'a')}${arrow('M666 258 L644 258', 'au')}
${box(190, 230, 200, 56, 'DynamoDB', 'file metadata + status', 'n')}
${arrow('M770 288 L770 306 L290 306 L290 290', 'au')}
`, 'Direct upload to S3 with a presigned URL, then EventBridge and SQS trigger a worker Lambda that writes processed files and metadata');
