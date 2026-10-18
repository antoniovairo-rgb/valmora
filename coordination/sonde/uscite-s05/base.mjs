import { writeFileSync } from 'node:fs';
import { leggiDati } from '../../../tools/dati-disco.mjs';
import { misura, perversa } from '../../../tools/misura-fiducia.mjs';
const [semi, primo, out] = [Number(process.argv[2]), Number(process.argv[3]), process.argv[4]];
const r = misura(leggiDati(), semi, 'base', new Set(), primo);
writeFileSync(out, JSON.stringify({ opzioni: r.opzioni, perverse: r.opzioni.filter(perversa).map(o=>o.chiave), det: r.deterministiche, viol: r.violazioniD108, ep: Object.fromEntries(Object.entries(r.episodi).map(([k,e])=>[k,{fall:e.casuale.fallite, r:e.casuale.corr.fallita, tre:e.attento_scelte_caso.treStelle, dR:e.casuale.deltaRiuscite.media, dF:e.casuale.deltaFallite.media}])) }));
console.log('perverse', r.opzioni.filter(perversa).length, 'viol', r.violazioniD108.length);
