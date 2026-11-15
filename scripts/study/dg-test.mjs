// Diagrams for the Testing guide (TE.*). Same visual language as dg.mjs.
import { box, txt, arrow, rect, wrap, M } from './dg.mjs';

const defs = (id) => `<defs>${M(id, 'muted')}${M(id + 'a', 'accent')}${M(id + 'd', 'danger')}</defs>`;
const T = { color: 'text' };

export const TE = {};

TE.levels = wrap('0 0 900 290', `
${txt(300, 24, 'what it runs', { anchor: 'middle', size: 10, color: 'accent' })}${txt(560, 24, 'speed', { anchor: 'middle', size: 10, color: 'accent' })}${txt(770, 24, 'what it proves', { anchor: 'middle', size: 10, color: 'accent' })}
${[
  ['End-to-end', 'the real app in a browser', 'seconds', 'a user can do the job', 'g'],
  ['Integration', 'several units, fake network', '10s of ms', 'the pieces work together', 'a'],
  ['Unit', 'one function or component', 'milliseconds', 'this logic is right', 'n'],
  ['Static analysis', 'types and lint', 'instant', 'no obvious mistakes', 'n'],
].map((r, i) => box(14, 34 + i * 60, 150, 50, r[0], '', r[4]) + txt(190, 64 + i * 60, r[1], { size: 10.5, ...T }) + txt(560, 64 + i * 60, r[2], { anchor: 'middle', size: 10.5, ...T }) + txt(640, 64 + i * 60, r[3], { size: 10.5, ...T })).join('')}
${txt(450, 280, 'Climb for confidence, descend for speed. Most UI tests belong in the middle.', { anchor: 'middle', size: 10.5 })}
`, 'The four levels of testing: what each runs, how fast, and what it proves');

TE.doubles = wrap('0 0 900 230', `
${[
  ['Stub', 'returns canned answers', 'getUser = () => ada'],
  ['Spy', 'records calls, real behaviour kept', 'vi.spyOn(mailer, "send")'],
  ['Mock', 'records calls, behaviour replaced', 'vi.fn() + toHaveBeenCalledWith'],
  ['Fake', 'a working lightweight version', 'an in-memory repository'],
].map((b, i) => box(14 + i * 222, 30, 204, 76, b[0], b[1], i === 3 ? 'a' : 'n') + txt(116 + i * 222, 136, b[2], { anchor: 'middle', size: 9.5, ...T })).join('')}
${txt(450, 190, 'Prefer fakes and real code. Reach for mocks when you must check that something was called.', { anchor: 'middle', size: 10.5 })}
`, 'Four kinds of test double: stub, spy, mock and fake');

TE.queryLadder = wrap('0 0 900 270', `
${[
  ['getByRole(name)', 'what users and screen readers perceive', 'a'],
  ['getByLabelText', 'form fields', 'a'],
  ['getByText / PlaceholderText', 'content the user reads', 'n'],
  ['getByAltText / Title', 'images and titles', 'n'],
  ['getByTestId', 'last resort', 'd'],
].map((r, i) => box(14, 14 + i * 48, 250, 40, r[0], '', r[2]) + txt(290, 38 + i * 48, r[1], { size: 10.5, ...T })).join('')}
${txt(620, 70, 'If you cannot find it by role,', { size: 10.5, ...T })}${txt(620, 88, 'a screen-reader user', { size: 10.5, ...T })}${txt(620, 106, 'cannot find it either.', { size: 10.5, ...T })}
${txt(14, 262, 'most preferred at the top', { size: 10, color: 'accent' })}
`, 'The order in which to choose a Testing Library query');

TE.mswFlow = wrap('0 0 900 240', `${defs('mw')}
${box(14, 60, 150, 60, 'Component', 'UserList', 'n')}${box(230, 60, 150, 60, 'fetch("/api/users")', 'runs for real', 'n')}${box(446, 60, 150, 60, 'MSW', 'intercepts the request', 'a')}${box(662, 60, 150, 60, 'Handler', 'returns a response', 'g')}
${arrow('M166 90 L226 90', 'mw')}${arrow('M382 90 L442 90', 'mw')}${arrow('M598 90 L658 90', 'mw')}
${box(446, 150, 150, 44, 'real server', '', 'd')}${txt(520, 142, 'never reached', { anchor: 'middle', size: 9.5, color: 'danger' })}
${txt(14, 170, 'The component, the data layer and fetch all run for real.', { size: 10.5, ...T })}
${txt(14, 190, 'Only the network is replaced.', { size: 10.5, ...T })}
`, 'How MSW intercepts a request at the network layer in a test');

TE.playwright = wrap('0 0 900 260', `${defs('pw')}
${box(14, 30, 150, 60, 'Test runner', 'parallel workers', 'n')}${box(230, 30, 150, 60, 'Browser', 'Chromium, Firefox, WebKit', 'n')}${box(446, 30, 150, 60, 'Context', 'fresh per test', 'a')}${box(662, 30, 150, 60, 'Page', 'one tab', 'n')}
${arrow('M166 60 L226 60', 'pw')}${arrow('M382 60 L442 60', 'pw')}${arrow('M598 60 L658 60', 'pw')}
${rect(14, 120, 872, 120, 'panel-2', 'accent')}${txt(28, 142, 'Before a click, Playwright waits until the element is:', { size: 10.5, color: 'accent' })}
${['attached', 'visible', 'stable', 'enabled', 'receives events'].map((c, i) => box(30 + i * 168, 156, 150, 40, c, '', 'n')).join('')}
${txt(28, 224, 'That is why a fixed sleep is never needed.', { size: 10.5, ...T })}
`, 'Playwright’s runner, browser contexts and auto-waiting');

TE.pipeline = wrap('0 0 900 220', `${defs('pl')}
${[['Types + lint', 'seconds', 'n'], ['Unit', 'a minute', 'n'], ['Integration', 'a few minutes', 'a'], ['End-to-end', '5 to 10 minutes', 'g'], ['Deploy + smoke', 'after merge', 'n']].map((b, i) => box(14 + i * 178, 40, 150, 64, b[0], b[1], b[2]) + (i < 4 ? arrow(`M${166 + i * 178} 72 L${190 + i * 178} 72`, 'pl') : '')).join('')}
${txt(450, 150, 'Fail fast: run the cheapest checks first.', { anchor: 'middle', size: 11, ...T })}
${txt(450, 174, 'A failure at the first stage saves the minutes the last stage would spend.', { anchor: 'middle', size: 10.5 })}
`, 'A CI pipeline ordered from the cheapest check to the most expensive');

TE.flaky = wrap('0 0 900 270', `
${box(350, 100, 200, 64, 'Flaky test', 'passes, then fails', 'd')}
${[
  [14, 20, 'Fixed sleeps', 'wait for a condition'],
  [334, 20, 'Shared state', 'isolate each test'],
  [654, 20, 'Real time and dates', 'fake the clock'],
  [14, 190, 'Real network', 'mock at the boundary'],
  [334, 190, 'Order dependence', 'run in random order'],
  [654, 190, 'Races and animations', 'await UI states'],
].map((c) => box(c[0], c[1], 232, 58, c[2], 'fix: ' + c[3], 'n')).join('')}
`, 'Six common causes of a flaky test and the fix for each');

export default TE;
