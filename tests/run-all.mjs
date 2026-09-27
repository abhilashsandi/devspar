// Starts a production server against the current build and runs every check in tests/checks/.
// Usage: npm run build && npm test   (or just `npm test`, which builds first)
//
// Each check file exports `async function run(ctx)` where ctx = { browser, base, ok }.
// `ok(name, condition, extra?)` records a pass/fail; the run exits non-zero if anything failed.
import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import http from 'node:http';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = process.env.TEST_PORT || 3499;
const BASE = `http://localhost:${PORT}`;

function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function poll() {
      http.get(url, (res) => { res.resume(); resolve(); })
        .on('error', () => {
          if (Date.now() - start > timeoutMs) reject(new Error('server did not come up in time'));
          else setTimeout(poll, 500);
        });
    })();
  });
}

async function main() {
  console.log(`starting \`next start -p ${PORT}\` against the existing .next build...`);
  const server = spawn(`npx next start -p ${PORT}`, { cwd: ROOT, shell: true, stdio: 'ignore', detached: process.platform !== 'win32' });
  const stopServer = () => {
    try {
      // `shell: true` spawns the command through an intermediate shell (cmd.exe on Windows), so
      // server.kill() only kills that shell, not the actual `next start` it launched. Kill the
      // whole process tree instead.
      if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
      else process.kill(-server.pid, 'SIGKILL');
    } catch {}
  };
  process.on('exit', stopServer);

  let failed = 0;
  try {
    await waitForServer(BASE + '/');
    const browser = await chromium.launch();
    let ok = (name, cond, extra) => {
      if (!cond) failed++;
      console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra !== undefined ? ' :: ' + extra : ''));
    };

    const checksDir = path.join(ROOT, 'tests', 'checks');
    const files = (await readdir(checksDir)).filter((f) => f.endsWith('.mjs')).sort();
    for (const file of files) {
      console.log(`\n--- ${file} ---`);
      const mod = await import(pathToFileURL(path.join(checksDir, file)));
      await mod.run({ browser, base: BASE, ok });
    }
    await browser.close();
  } finally {
    stopServer();
  }

  console.log(failed ? `\n${failed} check(s) FAILED` : '\nALL CHECKS PASSED');
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
