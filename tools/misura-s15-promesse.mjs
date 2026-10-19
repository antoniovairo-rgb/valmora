// Ricerca S-15 (D-190): righe di costo che promettono una reazione su risposte senza effetto sulla fiducia, e25–e36. Uso: node tools/misura-s15-promesse.mjs
import fs from 'node:fs';
const tolte = JSON.parse(fs.readFileSync('tests/dati/fiducia-d160.json', 'utf8')).tolte;
const re = /fiducia|apprezz|gradisc|protest|perdon|offend|sgarbo|se la prende|se la lega|annot|nota l|conto|favore|storcono|ricorda|escluso/i;
for (let i = 25; i <= 36; i++) { const m = JSON.parse(fs.readFileSync(`data/missioni/e${i}.json`)); const T = JSON.parse(fs.readFileSync(`data/testi/it/e${i}.json`));
  for (const o of m.ondate) for (const c of o.chiamate ?? []) for (const op of c.opzioni) { const k = `e${i}/${c.id}/${op.id}`; const cr = op.effetti.filter((e) => e.aggiungi === 'credito').reduce((a, e) => a + e.valore, 0);
    const ct = T[(op.costo ?? '').replace('testi:', '')] ?? '';
    if ((cr === 0 && re.test(ct)) || (k in tolte && re.test(ct))) console.log(`${k in tolte ? 'D160' : 'LIBERA'} ${k} cr=${cr} [${op.costo}] «${ct}»`); } }
