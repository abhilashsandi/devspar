// Parses and serializes a study page's DATA array (the questions), and the small string-escaping
// helpers the rest of the toolkit needs. A "page" here is app/<guide>/content.json's { html }.
import vm from 'node:vm';

const MARK = '// ---------- render ----------';
const BS = String.fromCharCode(92), BT = String.fromCharCode(96), DL = String.fromCharCode(36) + '{';
const escT = (a) => a.split(BS).join(BS + BS).split(BT).join(BS + BT).split(DL).join(BS + DL);

// Runs the page's own <script> (up to the render-engine marker) in a sandbox to read DATA back
// out, rather than re-parsing the JS ourselves. A `window` stub is needed because pages assign
// `window.__STUDY__` right before the marker.
export function loadData(html) {
  let sc = html.slice(html.indexOf('<script>') + 8, html.indexOf('</script>'));
  sc = sc.slice(0, sc.indexOf(MARK)) + '\nglobalThis.__D__=DATA;';
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(sc, sandbox);
  return sandbox.__D__;
}

export function serialize(D) {
  return (
    'const DATA = [\n' +
    D.map(
      (s) =>
        '{\n  id:' + JSON.stringify(s.id) + ', title:' + JSON.stringify(s.title) + ',\n  questions:[\n' +
        s.questions.map((q) => '    {\n      q:' + JSON.stringify(q.q) + ',\n      a:' + BT + escT(q.a) + BT + '\n    }').join(',\n') +
        '\n  ]\n}',
    ).join(',\n') +
    '\n];\n'
  );
}

export const norm = (x) => x.replace(/&mdash;/g, '—').replace(/&amp;/g, '&').replace(/[‘’]/g, "'");
export const ent = (s) => s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&mdash;/g, '—').replace(/&rarr;/g, '→').replace(/&amp;/g, '&');
export const stripTags = (html) => ent(html.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<pre[\s\S]*?<\/pre>/g, ' ').replace(/<table[\s\S]*?<\/table>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
export const plainTitle = (q) => ent(q.replace(/<[^>]+>/g, ' ')).replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();

export { MARK };
