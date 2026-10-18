import { readFileSync } from 'node:fs';
import { riassunto } from '../../../tools/misura-fiducia.mjs';
const b = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const ep = Object.values(b.ep), det = Object.values(b.det);
console.log('corr', JSON.stringify(riassunto(ep.map((e) => e.r))), 'positive', ep.filter((e) => e.r > 0).length, 'falliteGe', ep.filter((e) => e.dF >= e.dR).length, 'falliteGuadagnano', ep.filter((e) => e.dF > 0).length);
for (const n of ['attenta', 'equilibrata', 'peggiore']) console.log(n, JSON.stringify(riassunto(det.map((x) => x[n].fFine))), '3*', det.filter((x) => x[n].stelle === 3).length);
console.log('peggiore>=attenta', Object.entries(b.det).filter(([, x]) => x.peggiore.fFine >= x.attenta.fFine).length, 'attCaso3*', JSON.stringify(riassunto(ep.map((e) => e.tre))));
