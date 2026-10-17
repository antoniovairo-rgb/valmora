import { writeFileSync } from 'node:fs';
import { leggiDati } from '../../../tools/dati-disco.mjs';
import { misura, perversa, rigioca, riassunto } from '../../../tools/misura-fiducia.mjs';
import { controllaFiduciaMinima } from '../../../tools/bot.mjs';
const [semi, out, ...soglie] = process.argv.slice(2);
const base = leggiDati();
const conStelle = (d, f) => { const x = structuredClone(d); for (const k of Object.keys(x)) if (k.startsWith('missioni/')) f(x[k]); return x; };
const VAR = {
  oggi: (m) => {},
  f6: (m) => { m.stelle.tre.tutte.find((c) => c.var === 'credito').almeno = 6; },
  f7: (m) => { m.stelle.tre.tutte.find((c) => c.var === 'credito').almeno = 7; },
  t2: (m) => { m.stelle.tre.tutte.find((c) => c.var === 'tensione_max').al_massimo = 2; },
};
const ris = {};
for (const v of soglie) {
  const d = conStelle(base, VAR[v]);
  const r = misura(d, Number(semi));
  const ep = Object.values(r.episodi);
  const det = Object.values(r.deterministiche);
  ris[v] = {
    perverse: r.opzioni.filter(perversa).length, conEffetto: r.opzioni.filter((o) => o.nominale).length,
    corr: riassunto(ep.map((e) => e.casuale.corr.fallita).filter((x) => x !== null)),
    corrPositive: ep.filter((e) => e.casuale.corr.fallita > 0).length,
    falliteGeRiuscite: ep.filter((e) => e.casuale.deltaFallite.n && e.casuale.deltaFallite.media >= e.casuale.deltaRiuscite.media).length,
    falliteGuadagnano: ep.filter((e) => e.casuale.deltaFallite.media > 0).length,
    fiducia: Object.fromEntries(['attenta', 'equilibrata', 'peggiore'].map((n) => [n, riassunto(det.map((x) => x[n].fFine))])),
    peggioreGeAttenta: Object.entries(r.deterministiche).filter(([, x]) => x.peggiore.fFine >= x.attenta.fFine).map(([k]) => k),
    attentaSotto3: Object.entries(r.deterministiche).filter(([, x]) => !x.attenta.fallita && x.attenta.fFine < 3).map(([k]) => k),
    tre: { attenta: det.filter((x) => x.attenta.stelle === 3).length, equilibrata: det.filter((x) => x.equilibrata.stelle === 3).length, peggiore: det.filter((x) => x.peggiore.stelle === 3).length },
    treAttentoCaso: riassunto(ep.map((e) => e.attento_scelte_caso.treStelle)), treCasuale: riassunto(ep.map((e) => e.casuale.treStelle)),
    attentaTreEp: Object.entries(r.deterministiche).filter(([, x]) => x.attenta.stelle === 3).map(([k]) => k),
    fallite: Object.fromEntries(Object.entries(r.episodi).map(([k, e]) => [k, e.casuale.fallite])),
    violazioni: r.violazioniD108, fiduciaMinima: controllaFiduciaMinima(d),
    collaudo: {
      e03: rigioca(d, 'e03', 'rimozione ascolta_comitato parcheggio_lontano steward_laser pattuglia_vie steward_torcia rinforzi_notte devia_tifosi cordone_curve trattieni_ospiti3 vie_chiuse commento_tv'.split(' ')),
      e28: rigioca(d, 'e28', 'squadra_magazzino lascia_auto aspetta_testimone lascia_striscione pista_fonderie apri_settore fingi_niente lascia_intendere niente_cordone lascia_corteo nomi_fonti ospiti_primi'.split(' ')),
    },
  };
  for (const c of Object.values(ris[v].collaudo)) { delete c.scelte; delete c.ondate; }
  console.log(v, JSON.stringify({ ...ris[v], fallite: undefined }));
}
writeFileSync(out, JSON.stringify(ris, null, 1));
