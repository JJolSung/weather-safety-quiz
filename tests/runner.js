// Tiny dependency-free test runner. Works in the browser (quiz.test.html)
// and in Node (`node tests/quiz.test.js`).

const tests = [];

export function test(name, fn) {
  tests.push({ name, fn });
}

export function assert(condition, message = 'assertion failed') {
  if (!condition) throw new Error(message);
}

export function assertEqual(actual, expected, message = '') {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${message ? message + ': ' : ''}expected ${e}, got ${a}`);
  }
}

export function assertThrows(fn, message = 'expected function to throw') {
  let threw = false;
  try { fn(); } catch { threw = true; }
  if (!threw) throw new Error(message);
}

export async function run() {
  const results = [];
  for (const { name, fn } of tests) {
    try {
      await fn();
      results.push({ name, ok: true });
    } catch (err) {
      results.push({ name, ok: false, error: err.message });
    }
  }
  report(results);
  return results;
}

const isNode = typeof process !== 'undefined' && process.versions?.node;

function report(results) {
  const failed = results.filter((r) => !r.ok);
  const summary = `${results.length - failed.length} / ${results.length} passed`;

  if (isNode) {
    for (const r of results) {
      console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : `\n      ${r.error}`}`);
    }
    console.log(`\n${summary}`);
    process.exitCode = failed.length ? 1 : 0;
    return;
  }

  const root = document.getElementById('results');
  if (!root) return;
  root.innerHTML = '';
  for (const r of results) {
    const li = document.createElement('li');
    li.className = r.ok ? 'pass' : 'fail';
    li.textContent = `${r.ok ? '✓' : '✗'} ${r.name}${r.ok ? '' : ` — ${r.error}`}`;
    root.appendChild(li);
  }
  const h = document.getElementById('summary');
  if (h) {
    h.textContent = summary;
    h.className = failed.length ? 'fail' : 'pass';
  }
}

// Load a JSON file relative to the project root, in Node or in the browser.
export async function loadJson(relPath) {
  if (isNode) {
    const { readFile } = await import('node:fs/promises');
    const { fileURLToPath } = await import('node:url');
    const { dirname, join } = await import('node:path');
    const here = dirname(fileURLToPath(import.meta.url));
    return JSON.parse(await readFile(join(here, '..', relPath), 'utf8'));
  }
  const res = await fetch(`../${relPath}`);
  if (!res.ok) throw new Error(`fetch ${relPath}: ${res.status}`);
  return res.json();
}
