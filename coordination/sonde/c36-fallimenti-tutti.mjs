// Sonda C-036 (sola lettura; estende c35-fallimenti.mjs a tutte le missioni): per ogni missione, partite fallite col bot
// casuale (semi 1…N), in quante ogni settore è degenerato (scoperto e a tensione ≥ DEGENERA) e il testo del verbale di
// fallimento, per confrontare a mano i luoghi che il verbale nomina con quelli davvero degenerati.
// Uso: node coordination/sonde/c36-fallimenti-tutti.mjs <radice dati> [N] [missioni separate da virgola]
import { join } from 'node:path'; import { readFileSync, readdirSync } from 'node:fs';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { DEGENERA, giocaMissione } from '../../src/logica/missione.ts';
import { casuale } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';
const [R, n, solo] = process.argv.slice(2); const N = Number(n ?? 1000);
const d = leggiDati(join(R, 'data')); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x])); const v0 = variabiliIniziali(dich.values());
const T = {}; for (const f of readdirSync(join(R, 'data/testi/it'))) Object.assign(T, JSON.parse(readFileSync(join(R, 'data/testi/it', f), 'utf8')));
const tx = (k) => (typeof k === 'string' ? T[k.replace(/^testi:/, '')] ?? T[k.replace(/^testi:/, '') + '@f'] ?? k : '');
for (const [k, m] of Object.entries(d).filter(([k]) => k.startsWith('missioni/')).sort()) {
  if (solo && !solo.split(',').includes(m.id)) continue;
  const conta = {}; let fallite = 0, nessuno = 0;
  for (let s = 1; s <= N; s++) {
    const e = giocaMissione(m, v0, dich, casuale(creaCaso(`c36f:${m.id}:${s}`), dich)); if (!e.esito.fallita) continue; fallite++;
    const deg = new Set(e.rapporti.flatMap((x) => Object.keys(x.tensione).filter((q) => x.tensione[q] >= DEGENERA && x.scoperto[q] > 0)));
    if (!deg.size) nessuno++; for (const q of deg) conta[q] = (conta[q] ?? 0) + 1;
  }
  const nomi = Object.fromEntries(m.mappa.settori.map((x) => [x.id, tx(x.nome ?? `settore.${x.id}`)]));
  const testo = tx(`${m.id}.verbale_degenerato`);
  console.log(`${m.id} fallite ${fallite}/${N} · senza settore degenerato ${nessuno} · ${Object.entries(conta).sort((a, b) => b[1] - a[1]).map(([q, c]) => `${nomi[q] ?? q} (${q}) ${c}`).join(' · ')}\n   verbale: ${testo}`);
}
