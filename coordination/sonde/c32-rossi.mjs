// Sonda C-032 (sola lettura): accende i bracci rossi (globalThis.__NO_XXX) nelle sonde che non hanno ROSSI= (c28-grandi,
// c28-mouse, c28-tastiera, c28-rotazione, c29-versione, c29-stemmi), senza modificarle: dopo il lancio del browser ogni
// newPage riceve lo script iniziale. Uso: ROSSI=C86T01[,…] node --import ./coordination/sonde/c32-rossi.mjs <sonda> …
import { resolve } from 'node:path';
const ROSSI = (process.env.ROSSI ?? '').split(',').filter(Boolean);
if (ROSSI.length) {
  const R = resolve(process.argv[2] ?? '.');
  const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
  const lancia = chromium.launch.bind(chromium);
  chromium.launch = async (...a) => { const b = await lancia(...a); const np = b.newPage.bind(b);
    b.newPage = async (...o) => { const p = await np(...o); await p.addInitScript((r) => { for (const x of r) globalThis[`__NO_${x}`] = true; }, ROSSI); return p; }; return b; };
  console.error(`[c32-rossi] bracci rossi accesi: ${ROSSI.join(',')}`);
}
