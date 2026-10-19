// C42-03: e10, 50 partite fallite del casuale: pesi per verbale (prima: rosso C42B03; dopo).
import { readFileSync } from 'node:fs';
import { leggiDati } from '../../../tools/dati-disco.mjs';
import { variabiliIniziali } from '../../../src/logica/condizioni.ts';
import { giocaMissione } from '../../../src/logica/missione.ts';
import { casuale } from '../../../src/logica/bot.ts';
import { creaCaso } from '../../../src/logica/caso.ts';
import { bilancio } from '../../../src/logica/bilancio.ts';
import { daTabella } from '../../../src/logica/confronto.ts';
import { riassunto } from '../../../tools/misura-fiducia.mjs';
const d = leggiDati(); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x])); const v0 = variabiliIniziali(dich.values());
const m = d['missioni/e10.json']; const c = daTabella(JSON.parse(readFileSync('src/logica/confronti.json', 'utf8')), 'e10');
const giochi = []; for (let s = 1; giochi.length < 50 && s < 1000; s++) { const r = giocaMissione(m, v0, dich, casuale(creaCaso(`e10c42:${s}`), dich)); if (r.esito.fallita) giochi.push(r); }
for (const rosso of [true, false]) { globalThis.__NO_C42B03 = rosso; const p = giochi.map((r) => bilancio(m, r, 3, c).pesi.length);
  console.log(rosso ? 'prima (rosso C42B03)' : 'dopo', 'pesi per verbale', JSON.stringify(riassunto(p)), 'verbali con ≤1 peso', p.filter((x) => x <= 1).length, '/', p.length); }
