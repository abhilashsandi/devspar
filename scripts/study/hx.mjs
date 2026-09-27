// HTML builders for a card answer's body (same markup the study-page cards use).
const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const c = (s) => '<code>' + e(s) + '</code>';
const p = (s) => '<p>' + s + '</p>';
const lede = (s) => '<p class="lede">' + s + '</p>';
const ul = (...items) => '<ul>' + items.map((i) => '<li>' + i + '</li>').join('') + '</ul>';
const ol = (...items) => '<ol>' + items.map((i) => '<li>' + i + '</li>').join('') + '</ol>';
const code = (s, label) => (label ? '<p class="codelabel">' + e(label) + '</p>' : '') + '<pre>' + e(s.replace(/^\n+|\n+$/g, '')) + '</pre>';
const table = (head, rows) => '<table class="cmp"><tr>' + head.map((h) => '<th>' + h + '</th>').join('') + '</tr>' + rows.map((r) => '<tr>' + r.map((x) => '<td>' + x + '</td>').join('') + '</tr>').join('') + '</table>';
const tip = (s) => '<p><strong>Interview tip:</strong> ' + s + '</p>';
const callout = (s) => '<div class="callout">' + s + '</div>';
const card = (q, ...parts) => ({ q, a: parts.join('') });
export { e, c, p, lede, ul, ol, code, table, tip, callout, card };
