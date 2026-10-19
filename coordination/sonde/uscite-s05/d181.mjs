// D-181: 3★ con fiducia ≥ 8 negli episodi che l'hanno guadagnata con le ritarature (e02, e10, e18, e26, e33).
// Applica la soglia in memoria (o legge i dati come sono con «oggi») e misura 3★ dei bot e D-105.
import { leggiDati } from '../../../tools/dati-disco.mjs';
import { misura } from '../../../tools/misura-fiducia.mjs';
import { controllaFiduciaMinima } from '../../../tools/bot.mjs';
const EP = ['e02', 'e10', 'e18', 'e26', 'e33']; const soglia = Number(process.argv[2] ?? 8);
const d = structuredClone(leggiDati());
if (process.argv[3] !== 'oggi') for (const id of EP) d[`missioni/${id}.json`].stelle.tre.tutte.find((c) => c.var === 'credito').almeno = soglia;
const r = misura(d, Number(process.argv[4] ?? 1000)); const det = Object.values(r.deterministiche);
const ep = Object.values(r.episodi).map((e) => e.attento_scelte_caso.treStelle);
console.log(JSON.stringify({ soglia: process.argv[3] === 'oggi' ? 'dati' : soglia,
  tre: { attenta: det.filter((x) => x.attenta.stelle === 3).length, equilibrata: det.filter((x) => x.equilibrata.stelle === 3).length, peggiore: det.filter((x) => x.peggiore.stelle === 3).length },
  attentaTre: Object.entries(r.deterministiche).filter(([, x]) => x.attenta.stelle === 3).map(([k]) => k).join(','),
  attentoCaso: { media: +(ep.reduce((a, x) => a + x, 0) / ep.length).toFixed(2) },
  violazioniD154: r.violazioniD108, fallite: Object.fromEntries(Object.entries(r.episodi).map(([k, e]) => [k, e.casuale.fallite])), d105: controllaFiduciaMinima(d) }));
