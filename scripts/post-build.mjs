import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Expo's static web export injects the entry bundle as a classic <script>, but
// the bundle contains `import.meta.env` (emitted by some deps for dev-mode
// detection), which only parses inside an ES module. Without this fix Chrome
// throws "Cannot use 'import.meta' outside a module" before any code runs.

const DIST = new URL('../dist/', import.meta.url);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = new URL(entry.name + (entry.isDirectory() ? '/' : ''), dir);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

let patched = 0;
for await (const file of walk(DIST)) {
  const html = await readFile(file, 'utf8');
  const next = html.replace(
    /<script src="(\/_expo\/static\/js\/web\/entry-[^"]+)" defer><\/script>/g,
    '<script src="$1" type="module"></script>',
  );
  if (next !== html) {
    await writeFile(file, next);
    patched += 1;
  }
}

console.log(`post-build: patched ${patched} HTML file(s) to load entry as module`);
