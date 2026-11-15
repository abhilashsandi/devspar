// ---- predict:start
// Predict the output. A card shows a snippet and an empty <div class="predict">. The reader types what the
// snippet will print, locks it in, and only then does it run, in a Web Worker built from a Blob (so an
// infinite loop cannot freeze the page, and can be stopped). The same formatter and harness run in Node
// (check-predict.mjs), so the output printed on each card comes from the code path the reader uses.
function predictFormat(value, nested){
  const t = typeof value;
  if(value === null) return 'null';
  if(t === 'string') return nested ? "'" + value + "'" : value;
  if(t === 'bigint') return String(value) + 'n';
  if(t === 'function') return value.name ? '[Function: ' + value.name + ']' : '[Function (anonymous)]';
  if(t !== 'object') return String(value);
  if(value instanceof Error) return value.name + ': ' + value.message;
  if(Array.isArray(value)) return value.length ? '[ ' + value.map(function(x){ return predictFormat(x, true); }).join(', ') + ' ]' : '[]';
  const keys = Object.keys(value);
  return keys.length ? '{ ' + keys.map(function(k){ return k + ': ' + predictFormat(value[k], true); }).join(', ') + ' }' : '{}';
}
// The program text a worker runs. `post` names the function that sends a message ({line} or {done}).
function predictSource(code, post){
  return "'use strict';\n" + predictFormat.toString() + "\n" +
    "const __send = (line) => " + post + "({ line });\n" +
    "const __console = { log: (...a) => __send(a.map((x) => predictFormat(x, false)).join(' ')) };\n" +
    "const __err = (e, prefix) => __send(prefix + ' ' + (e && e.name ? e.name + ': ' + e.message : String(e)));\n" +
    "if (typeof process !== 'undefined' && process.on) {\n" +
    "  process.on('uncaughtException', (e) => __err(e, 'Uncaught'));\n" +
    "  process.on('unhandledRejection', (e) => __err(e, 'Uncaught (in promise)'));\n" +
    "} else if (typeof addEventListener === 'function') {\n" +
    "  addEventListener('error', (ev) => { if (ev.preventDefault) ev.preventDefault(); __err(ev.error || ev.message, 'Uncaught'); });\n" +
    "  addEventListener('unhandledrejection', (ev) => { if (ev.preventDefault) ev.preventDefault(); __err(ev.reason, 'Uncaught (in promise)'); });\n" +
    "}\n" +
    "try { (function (console) {\n'use strict';\n" + code + "\n})(__console); } catch (e) { __err(e, 'Uncaught'); }\n" +
    "setTimeout(() => " + post + "({ done: true }), 700);\n";
}
// Compares what the reader said with what it printed, line by line, judging the answer and not the spacing.
function predictCompare(predicted, actual){
  const said = String(predicted).split('\n');
  while(said.length && !said[said.length - 1].trim()) said.pop();
  while(said.length && !said[0].trim()) said.shift();
  const norm = function(s){ return s.replace(/\s+/g, '').replace(/[“”‘’"]/g, "'"); };
  const same = function(a, b){
    const x = norm(a), y = norm(b);
    if(x === y) return true;
    // a bare string written with quotes ("a" for a) is forgiven; a string written as a number is not
    return x.length > 2 && x[0] === "'" && x[x.length - 1] === "'" && x.indexOf("'", 1) === x.length - 1 && y.indexOf("'") < 0 && x.slice(1, -1) === y;
  };
  const n = Math.max(said.length, actual.length);
  const rows = [];
  let right = 0;
  for(let i = 0; i < n; i++){
    const s = i < said.length ? said[i] : '', p = i < actual.length ? actual[i] : '';
    const ok = i < said.length && i < actual.length && same(s, p);
    if(ok) right++;
    rows.push({ said: s, printed: p, ok: ok });
  }
  return { rows: rows, right: right, total: actual.length };
}
// ---- predict:end
