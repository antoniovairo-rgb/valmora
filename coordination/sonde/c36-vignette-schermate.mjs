// Sonda C-036 (sola lettura): dalle uscite di c29-schermate.mjs, per finestra, quante vignette di sala, rapporto e
// verbale sono mostrate o nascoste (campo «vg», attributo data-nascosta). Uso: node coordination/sonde/c36-vignette-schermate.mjs <cartella>
import { readFileSync, readdirSync } from 'node:fs'; import { join } from 'node:path';
const D = process.argv[2];
for (const m of ['360x760', '375x667', '412x915', '1366x768']) {
  const conta = {};
  for (const f of readdirSync(D).filter((x) => new RegExp(`^${m}-b\\d\\.json$`).test(x)).sort())
    for (const r of JSON.parse(readFileSync(join(D, f), 'utf8')).RIS) for (const v of r.vg ?? []) { const k = `${r.scena.split('-')[0]} ${v.nascosta ? 'nascosta' : 'mostrata'}`; conta[k] = (conta[k] ?? 0) + 1; }
  console.log(m, JSON.stringify(conta));
}
