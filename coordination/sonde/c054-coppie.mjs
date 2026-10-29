// C-054 · quali chiusure possono avere due morsi insieme? (giocando comoda su 100 semi per episodio) → coppie episodio/ondata e lunghezza dei testi
import { readdirSync, readFileSync } from 'node:fs';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { attenta } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';
import { iniziaMissione, schiera, chiamateAperte, rispondi, chiudiOndata, missioneFinita, opzioniValide } from '../../src/logica/missione.ts';
const T = Object.assign({}, ...readdirSync('data/testi/it').map((f) => JSON.parse(readFileSync(`data/testi/it/${f}`, 'utf8'))));
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x).sort((a, b) => a.episodio - b.episodio);
const coppie = new Map(); const singoli = [];
for (const m of missioni) for (let seme = 1; seme <= 100; seme++) {
  const g = attenta(creaCaso(seme), dich); let s = iniziaMissione(m, v0, dich, seme);
  while (!missioneFinita(m, s)) { s = schiera(m, s, g.schiera(m, s)); for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) { const ok = opzioniValide(c, s, m); s = rispondi(m, s, c.id, (ok.find((o) => o.effetti_dopo) ?? ok[0]).id, dich); } s = chiudiOndata(m, s, dich); }
  s.rapporti.forEach((r, i) => { const radio = (r.radio ?? []).map((k) => T[k.replace(/^testi:/, '')]); if (radio.length >= 2) { const key = `${m.id} ondata ${i + 1}/${m.ondate.length}: ` + radio.join(' + '); coppie.set(key, radio.join('').length); } });
}
import('node:fs').then((fs) => fs.writeFileSync(process.env.COPPIE_OUT ?? '/dev/null', [...coppie.keys()].map((k) => JSON.stringify({ chiave: k.split(': ')[0], testi: k.split(': ').slice(1).join(': ').split(' + ') })).join('\n')));
const arr = [...coppie].sort((a, b) => b[1] - a[1]);
console.log(`chiusure distinte con 2 morsi: ${arr.length}; massimo ${arr[0]?.[1]} caratteri`); for (const [k, n] of arr.slice(0, 12)) console.log(n, k.slice(0, 40), '…');
