// D-172 (C38-04): correlazione fiducia finale / fallita per episodio (bot casuale) e, per gli episodi indicati,
// tutte le opzioni con effetto sulla fiducia con il confronto di fallite (attento + scelte a caso).
// Uso: node coordination/sonde/uscite-s05/per-episodio.mjs <semi> <uscita.json> [e08,e10,...]
import { writeFileSync } from 'node:fs';
import { leggiDati } from '../../../tools/dati-disco.mjs';
import { misura, perversa } from '../../../tools/misura-fiducia.mjs';
const [semi, out, lista] = [Number(process.argv[2]), process.argv[3], (process.argv[4] ?? '').split(',').filter(Boolean)];
const r = misura(leggiDati(), semi);
const corr = Object.fromEntries(Object.entries(r.episodi).map(([k, e]) => [k, e.casuale.corr.fallita]));
const nonNeg = Object.entries(corr).filter(([, c]) => c === null || c >= 0).map(([k, c]) => `${k} ${c}`);
const opz = r.opzioni.filter((o) => o.nominale && lista.some((e) => o.chiave.startsWith(e + '/')));
writeFileSync(out, JSON.stringify({ corr, nonNeg, opz, perverse: r.opzioni.filter(perversa).map((o) => o.chiave), violazioni: r.violazioniD108, fallite: Object.fromEntries(Object.entries(r.episodi).map(([k, e]) => [k, e.casuale.fallite])), tre: Object.fromEntries(Object.entries(r.deterministiche).map(([k, x]) => [k, x.attenta.stelle])) }, null, 1));
console.log('corr ≥ 0:', nonNeg.join(' | '));
for (const o of opz.sort((a, b) => a.chiave.localeCompare(b.chiave))) console.log(o.chiave, o.nominale, 'z', o.z, o.falliteSe, '/', o.falliteAltre, 'n', o.n, o.nAltre, (o.nominale > 0) === (o.z > 0) && o.z !== 0 ? 'VERSO SBAGLIATO' : '');
