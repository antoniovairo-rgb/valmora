import fs from 'node:fs';
const UNITA = [[/squadr/i, 'squadre'], [/steward/i, 'steward'], [/mediator/i, 'mediatore']];
let n = 0;
for (const f of fs.readdirSync('data/missioni').sort()) {
  const m = JSON.parse(fs.readFileSync('data/missioni/' + f)); const t = JSON.parse(fs.readFileSync(`data/testi/it/${m.id}.json`));
  for (const o of m.ondate) for (const c of o.chiamate ?? []) for (const op of c.opzioni) {
    const tx = t[op.testo.slice(6)] ?? '';
    for (const [re, r] of UNITA) if (re.test(tx) && !op.effetti.some((e) => e.riserva === r) && !op.dopo && !/ancora|già|nessun/i.test(tx)) { n++; console.log(m.id, `${c.id}/${op.id}`, r, `«${tx}»`); }
  }
}
console.log('totale', n);
