// Builds the AI-Assisted Development guide (app/ai-dev/content.json) from ai-content-a/b.mjs.
//   node scripts/study/add-ai-dev-guide.mjs && npm run study:build
// Re-running rebuilds the guide from scratch, so edit the content files and run it again.
import { mkdir } from 'node:fs/promises';
import * as lib from './lib.mjs';
import * as H from './helpers.mjs';
import { how, prompting, context, harness, spec } from './ai-content-a.mjs';
import { bmad, skills, workflow, quality, interview } from './ai-content-b.mjs';

const data = [
  { id: 'quickref', title: 'Quick Reference', questions: [] },
  { id: 'ai1', title: '1. How AI-Assisted Development Works', questions: how },
  { id: 'ai2', title: '2. Prompting for Code', questions: prompting },
  { id: 'ai3', title: '3. Context Engineering', questions: context },
  { id: 'ai4', title: '4. The Harness: Tools, MCP, Permissions, Hooks', questions: harness },
  { id: 'ai5', title: '5. Spec-Driven Development', questions: spec },
  { id: 'ai6', title: '6. The BMad Method', questions: bmad },
  { id: 'ai7', title: '7. Skills, Rules and Reusable Workflows', questions: skills },
  { id: 'ai8', title: '8. A Full-Stack Workflow, End to End', questions: workflow },
  { id: 'ai9', title: '9. Quality, Security and Guardrails', questions: quality },
  { id: 'ai10', title: '10. Interview Questions', questions: interview },
];
H.regenQuickRef(data);

const html = await H.newPage(
  {
    key: 'ai-dev',
    title: 'AI-Assisted Development: Interview Prep',
    brand: 'AI-Assisted Development',
    brandSub: 'prompts, context, agents, specs',
    h1: 'AI-assisted development',
    eyebrow: 'Prep guide',
    lede: 'How a full-stack developer builds with AI agents and stays accountable for the result: prompting, context engineering, the agent harness, spec-driven development, the BMad Method, skills, an end-to-end workflow, and the security and quality questions interviewers ask.',
  },
  data,
);

await mkdir(new URL('../../app/ai-dev/', import.meta.url), { recursive: true });
const total = await lib.save('ai-dev', await lib.upgrade(html));
console.log('ai-dev guide written: ' + data.length + ' sections, ' + total + ' cards');
