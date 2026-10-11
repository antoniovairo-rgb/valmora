// Sonda C-01 · riserva sotto −quantità: un rinforzo dopo perdite eccedenti viene assorbito?
// Uso: node coordination/handoffs/collaudatrice/sonde/c01-riserva.mjs
import { disponibili, iniziaMissione } from '../../../../src/logica/missione.ts';
const dich = new Map([['tensione_max', { id: 'tensione_max', tipo: 'int', min: 0, max: 99, iniziale: 0, descrizione: 'x' }]]);
const m = { id: 'r', mappa: { settori: [{ id: 'a', tipo: 'a' }], risorse: { steward: { quantita: 2, efficacia: { a: 1 } } } }, ondate: [{ n: 1, eventi: [] }], esiti: [] };
const s = iniziaMissione(m, { tensione_max: 0 }, dich);
for (const riserva of [-2, -6, -5, -1, 1]) console.log(`quantita 2, riserva ${riserva} → disponibili ${disponibili(m, { ...s, riserva: { steward: riserva } }).steward}`);
