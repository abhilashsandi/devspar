// The practice tools: one list drives the homepage section, the sitemap and the accessibility check.
// A tool's plan flips its own `ready` flag when its page exists. While none is ready, the homepage has
// no "Practice tools" section at all.

/** @typedef {{id: string, href: string, title: string, icon: 'timer'|'calendar'|'target'|'calculator'|'notebook', ready: boolean, desc: string}} Tool */

/** @type {Tool[]} */
export const TOOLS = [
  { id: 'mock', href: '/mock', title: 'Mock round', icon: 'timer', ready: true, desc: 'A timed 45-minute interview drawn from the guides: behavioural, concepts, whiteboard, a bug and a SQL puzzle, with a scorecard.' },
  { id: 'plan', href: '/plan', title: 'Interview plan', icon: 'calendar', ready: true, desc: 'Enter your interview date and role to get a daily plan built from core, weak and unreviewed cards.' },
  { id: 'match', href: '/match', title: 'Job match', icon: 'target', ready: false, desc: 'Paste a job posting to get a deck for it and a list of gaps. The posting stays in your browser.' },
  { id: 'drills', href: '/drills', title: 'Estimation drills', icon: 'calculator', ready: true, desc: 'Capacity and latency sums with new numbers every time, so you practise the arithmetic.' },
  { id: 'stories', href: '/stories', title: 'Story bank', icon: 'notebook', ready: false, desc: 'Write your STAR stories, check their shape and see which competencies they cover. Stays in your browser.' },
];
