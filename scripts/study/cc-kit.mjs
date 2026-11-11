// Small authoring kit for the Crash Course and AWS guides. Text arguments use the cheatsheet's
// tiny markup (see cheatsheet-md.mjs): `code` and **bold**; everything else is escaped.
import { md } from './cheatsheet-md.mjs';
import { code } from './hx.mjs';

export { md };
export const P = (...paras) => paras.map((x) => '<p>' + md(x) + '</p>').join('');
export const L = (...items) => '<ul>' + items.map((i) => '<li>' + md(i) + '</li>').join('') + '</ul>';
export const N = (...items) => '<ol>' + items.map((i) => '<li>' + md(i) + '</li>').join('') + '</ol>';
export const C = (s, label) => code(s, label);
export const T = (head, rows) => '<table class="cmp"><tr>' + head.map((h) => '<th>' + md(h) + '</th>').join('') + '</tr>' +
  rows.map((r) => '<tr>' + r.map((x) => '<td>' + md(x) + '</td>').join('') + '</tr>').join('') + '</table>';
export const H = (s) => '<h3>' + md(s) + '</h3>';
// The one sentence to say out loud if asked about this topic.
export const SAY = (s) => '<div class="callout"><strong>Say it like this:</strong> ' + md(s) + '</div>';
export const TRAP = (s) => '<p><strong>Trap:</strong> ' + md(s) + '</p>';
export const K = (q, ...parts) => ({ q, a: parts.join('') });
// A rapid-fire card: [question, one-line answer] pairs.
export const RAPID = (title, pairs) => K(title, T(['Question', 'Answer'], pairs));
// Links out to the full guides (opened in the top window, not inside the guide's iframe).
export const GO = (...links) => '<p class="deeper"><strong>Go deeper:</strong> ' +
  links.map(([href, label]) => '<a href="' + href + '" target="_top">' + label + '</a>').join(' · ') + '</p>';
export const S = (id, title, minutes, questions) => ({ id, title: title + ' · ' + minutes + ' min', questions });
