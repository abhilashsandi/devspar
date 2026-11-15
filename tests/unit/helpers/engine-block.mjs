// Runs one marked block of scripts/study/engine.js in Node so its pure functions can be unit-tested.
// Only `function` declarations become properties of the returned context; top-level const/let do not.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'scripts', 'study', 'engine.js');

/**
 * @param {string} name block name: the text between `// ---- <name>:start` and `// ---- <name>:end`
 * @param {object} [globals] stand-ins for browser globals the block touches at load time
 * @returns {Record<string, any>} the vm context
 */
export function loadBlock(name, globals = {}) {
  const src = readFileSync(ENGINE, 'utf8');
  const a = src.indexOf(`// ---- ${name}:start`);
  const b = src.indexOf(`// ---- ${name}:end`);
  if (a < 0 || b < 0 || b < a) throw new Error(`engine block not found: ${name}`);
  const ctx = vm.createContext({ console, ...globals });
  vm.runInContext(src.slice(a, b), ctx);
  return ctx;
}
