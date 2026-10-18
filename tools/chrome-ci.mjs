// PO-128: il browser della CI in locale. La CI usa quello che playwright-core (versione del package-lock) scarica:
// Chrome Headless Shell 156.0.8078.4 (v1248) il 17/10; in locale /opt/pw-browsers ha Chromium 141, che impagina
// diversamente. Questo lo scarica fuori dal repo (una volta, ~120 MB) e stampa il percorso per VALMORA_CHROME:
//   VALMORA_CHROME=$(node tools/chrome-ci.mjs) node tools/catena.mjs grafica
import { execSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const dir = process.env.VALMORA_BROWSER_CI ?? join(homedir(), '.cache', 'valmora-browser-ci');
const trova = () => {
  if (!existsSync(dir)) return null;
  for (const v of readdirSync(dir).filter((d) => d.startsWith('chromium_headless_shell-')).sort().reverse())
    for (const s of readdirSync(join(dir, v))) { const p = join(dir, v, s, 'chrome-headless-shell'); if (existsSync(p)) return p; }
  return null;
};
let percorso = trova();
if (!percorso) {
  execSync('npx playwright-core install chromium-headless-shell', { stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: dir, PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '' } });
  percorso = trova();
}
if (!percorso) { console.error(`browser della CI non trovato in ${dir}`); process.exit(1); }
console.log(percorso);
