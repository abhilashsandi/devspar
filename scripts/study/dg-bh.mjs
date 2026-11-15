// Diagrams for the Behavioural guide (BH.*). Same visual language as dg.mjs.
import { box, txt, arrow, rect, wrap, M } from './dg.mjs';

const defs = (id) => `<defs>${M(id, 'muted')}${M(id + 'a', 'accent')}${M(id + 'd', 'danger')}</defs>`;
const T = { color: 'text' };

export const BH = {};

BH.star = wrap('0 0 900 220', `${defs('st')}
${box(20, 40, 76, 60, 'Situation', '', 'n')}${box(100, 40, 76, 60, 'Task', '', 'n')}${box(180, 40, 480, 60, 'Action', 'what YOU did, step by step', 'a')}${box(664, 40, 216, 60, 'Result', 'a number, and what you learned', 'g')}
${txt(58, 124, 'one', { anchor: 'middle', size: 10.5, ...T })}${txt(58, 140, 'sentence', { anchor: 'middle', size: 10.5, ...T })}
${txt(138, 124, 'your', { anchor: 'middle', size: 10.5, ...T })}${txt(138, 140, 'responsibility', { anchor: 'middle', size: 9.5, ...T })}
${txt(420, 124, 'about 60% of the answer', { anchor: 'middle', size: 10.5, color: 'accent' })}
${txt(772, 124, 'about 20%', { anchor: 'middle', size: 10.5, ...T })}
${txt(450, 190, 'Most answers fail by spending the time on the situation.', { anchor: 'middle', size: 11, ...T })}
`, 'The STAR structure with most of the time given to the action');

const cell = (x, y, on) => `<rect x="${x}" y="${y}" width="${on ? 18 : 18}" height="18" rx="4" fill="${on ? 'var(--accent)' : 'var(--panel)'}" stroke="var(--${on ? 'accent' : 'border'})" stroke-width="1.2"/>`;
BH.storyBank = wrap('0 0 900 310', `
${['Ownership', 'Conflict', 'Leadership', 'Failure', 'Learning'].map((c, i) => txt(330 + i * 110, 28, c, { anchor: 'middle', size: 10.5, ...T, weight: 700 })).join('')}
${[
  ['1  Migration under deadline', [1, 0, 1, 0, 1]],
  ['2  Production incident', [1, 0, 0, 1, 1]],
  ['3  Disagreement on approach', [0, 1, 1, 0, 0]],
  ['4  Mentoring a junior', [0, 0, 1, 0, 1]],
  ['5  Project that slipped', [1, 0, 0, 1, 1]],
  ['6  Process I improved', [1, 1, 1, 0, 0]],
].map((r, ri) => txt(20, 62 + ri * 36, r[0], { size: 10.5, ...T }) + r[1].map((on, ci) => cell(321 + ci * 110, 48 + ri * 36, on)).join('')).join('')}
${txt(450, 290, 'Six stories, told from different angles, cover most questions.', { anchor: 'middle', size: 11, ...T })}
`, 'A story bank matrix mapping six stories to five competencies');

BH.aboutYou = wrap('0 0 900 200', `${defs('ay')}
${box(30, 40, 230, 70, 'Present', 'what you do now, with the stack', 'a')}${box(335, 40, 230, 70, 'Past', 'two roles, one result each', 'n')}${box(640, 40, 230, 70, 'Future', 'why this role', 'g')}
${arrow('M262 75 L331 75', 'ay')}${arrow('M567 75 L636 75', 'ay')}
${rect(30, 140, 840, 30, 'accent-soft', 'accent')}${txt(450, 160, '60 to 90 seconds in total', { anchor: 'middle', size: 11, ...T })}
`, 'The present, past, future structure for “tell me about yourself”');

BH.conflict = wrap('0 0 900 210', `${defs('cf')}
${[['Listen', 'ask before you argue'], ['Restate', 'their view, fairly'], ['Bring evidence', 'data or a small spike'], ['Decide together', 'agree who decides'], ['Follow up', 'repair the relationship']].map((b, i) => box(14 + i * 178, 40, 150, 64, b[0], b[1], i === 2 ? 'a' : 'n') + (i < 4 ? arrow(`M${166 + i * 178} 72 L${190 + i * 178} 72`, 'cf') : '')).join('')}
${txt(450, 160, 'The other person should sound reasonable in your story.', { anchor: 'middle', size: 11, ...T })}
`, 'Five steps for telling a conflict story');

BH.probes = wrap('0 0 900 260', `${defs('pr')}
${box(150, 14, 400, 44, 'Your answer', '', 'a')}
${box(190, 70, 320, 44, 'What exactly did YOU do?', '', 'n')}
${box(230, 126, 240, 44, 'Why that, not the alternative?', '', 'n')}
${box(270, 182, 160, 44, 'What would you change?', '', 'g')}
${txt(600, 80, 'Prepare one level deeper', { size: 11, ...T })}${txt(600, 98, 'than you plan to say.', { size: 11, ...T })}
`, 'The follow-up questions an interviewer uses to probe a story');

export default BH;
