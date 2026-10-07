// Tiny markup for the cheatsheet answers so the content files stay readable and HTML-safe:
//   `text`  becomes <code>text</code>   (the content is escaped)
//   **text** becomes <strong>text</strong>
// Everything else is escaped, so <, > and & can be written as they are.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const md = (s) => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

// A short code sample under an answer.
export const pre = (s) => '<pre>' + esc(s.replace(/^\n+|\n+$/g, '')) + '</pre>';

// entry(text, diagramKey?, extraHtml?) -> { a: the answer paragraph(s), d: diagram key }
export const entry = (text, d, extra = '') => ({ a: '<p>' + md(text) + '</p>' + extra, d });
