// C-034 (PO-120): dal giornale di c33-giocatore.mjs, per episodio: tocchi (op tocca/testo), schermate per tipo, ondate,
// chiamate risposte, errori; l'episodio è quello della scena (data-missione) o l'ultimo «avvia-episodio».
// Uso: node coordination/sonde/c34-giornale.mjs <giornale.jsonl> […]
import { readFileSync } from 'node:fs';
const per = {};
for (const f of process.argv.slice(2)) {
  let ep = '-';
  for (const r of readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))) {
    const t = r.testo ?? '';
    const m = t.match(/^(?:v0\.\d+\.\d+\n)?(\d\d)\n/m) ?? t.match(/\n(\d\d)\n(?:SALA|BRIEFING|ONDATA|VERBALE|RAPPORTO)/);
    if (m && ['sala', 'briefing', 'schieramento', 'chiamata', 'chiusura', 'rapporto', 'verbale'].includes(r.scena)) ep = `e${m[1]}`;
    const x = (per[ep] ??= { tocchi: 0, chiamate: new Set(), ondate: new Set(), errori: 0, scene: {} });
    if (r.op === 'tocca' || r.op === 'testo') x.tocchi++;
    if (r.errori) x.errori = Math.max(x.errori, r.errori);
    if (r.scena) x.scene[r.scena] = (x.scene[r.scena] ?? 0) + 1;
    const o = t.match(/ONDATA (\d)\/\d · CHIAMATA (\d)\/\d/); if (o) x.chiamate.add(`${o[1]}.${o[2]}`);
    const w = t.match(/ONDATA (\d)\/\d/); if (w) x.ondate.add(w[1]);
  }
}
for (const [ep, x] of Object.entries(per)) console.log(`${ep}: tocchi ${x.tocchi}, ondate viste ${x.ondate.size}, chiamate distinte ${x.chiamate.size}, errori ${x.errori}`);
