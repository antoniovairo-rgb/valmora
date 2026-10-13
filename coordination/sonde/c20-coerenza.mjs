// Sonda C-020 (credibilità): verifica di C19-01/02/03 dopo la 0.15.0 e casi nuovi delle righe «i» (PO-101).
// Stesso motore di c19-coerenza (giocatore che schiera col bot attento e risponde a caso, salvo le scelte forzate);
// in più il testo «ondata:N» conta le partite in cui, fatte le scelte, si arriva all'ondata N (dove la riga
// «eXX.ondataN.i», fissa e senza varianti, è visibile accanto al titolo).
// Uso: node coordination/sonde/c20-coerenza.mjs [partite=1000] [id,…]   ·   rosso: --import con globalThis.__NO_PO086=true
import { leggiDati } from '../../tools/dati-disco.mjs';
import { creaCaso } from '../../src/logica/caso.ts';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, iniziaMissione, missioneFinita, opzioniValide, rispondi, schiera } from '../../src/logica/missione.ts';
import { attenta, casuale } from '../../src/logica/bot.ts';

const N = Number(process.argv[2] ?? 1000);
const d = leggiDati(process.env.DATI ?? 'data'); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x]));
const CASI = [
  ['G1a', 'e09', ['pullman_fermi/scarica_pullman'], 'ch:non_erano_nostri'],
  ['G1b', 'e09', ['pullman_fermi/scarica_pullman'], 'ch:lite_coda'],
  ['G2a', 'e06', ['bis/bis_corto', 'favore_impresa/accetta_favore'], 'ch:risultato', { presidente_incontrato: true }],
  ['G2b', 'e06', ['bis/bis_corto', 'favore_impresa/accetta_favore'], 'ch:risultato_favore', { presidente_incontrato: true }],
  ['G2c', 'e06', ['bis/bis_corto'], 'ch:favore_impresa', { presidente_incontrato: true }],
  ['G3a', 'e04', ['arance/chiudi_mercato'], 'ch:kebab'],
  ['G3b', 'e04', ['arance/chiudi_mercato'], 'ch:kebab_chiuso'],
  ['G3c', 'e04', ['arance/chiudi_mercato'], 'opz:kebab_chiuso/scorta_ospiti'],
  ['G3d', 'e04', ['arance/chiudi_mercato'], 'opz:corteo_fonderie/corteo_banchi'],
  ['I1', 'e04', ['arance/chiudi_mercato'], 'ondata:2'],
  ['I2', 'e04', ['verdura/sgombera'], 'ondata:3'],
  ['I3', 'e24', ['consegna/consegna_chiusa'], 'ondata:3'],
];
const v0 = variabiliIniziali(dich.values());
const solo = process.argv[3]?.split(',');
for (const [id, ep, forzate, testo, extra] of CASI) {
  if (solo && !solo.includes(id)) continue;
  const m = d[`missioni/${ep}.json`]; const F = forzate.map((x) => x.split('/'));
  let fatte = 0, entrambe = 0; const g = attenta(creaCaso(1), dich);
  for (let k = 0; k < N; k++) {
    const caso = creaCaso(`c20:${id}:${k}`); let s = iniziaMissione(m, { ...v0, ...(extra ?? {}) }, dich); let n = 0, visto = false;
    while (!missioneFinita(m, s)) {
      s = schiera(m, s, g.schiera(m, s));
      for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
        const tutte = n === F.length;
        if (tutte && testo === `ch:${c.id}`) visto = true;
        let ops = opzioniValide(c, s, m);
        if (tutte && testo.startsWith('opz:') && testo.slice(4).split('/')[0] === c.id) { const o = ops.find((x) => x.id === testo.split('/')[1]); if (o) { visto = true; ops = [o]; } }
        if (n < F.length && c.id === F[n][0]) { const o = ops.find((x) => x.id === F[n][1]); if (o) { ops = [o]; n++; } }
        s = rispondi(m, s, c.id, caso.scegli(ops).id, dich);
      }
      s = chiudiOndata(m, s, dich);
      if (n === F.length && testo === `ondata:${s.ondata}` && !missioneFinita(m, s)) visto = true;
    }
    const e = concludiMissione(m, s, dich).esito.id;
    if (n === F.length && testo === `esito:${e}`) visto = true;
    fatte += n === F.length ? 1 : 0; entrambe += n === F.length && visto ? 1 : 0;
  }
  console.log(`${id} ${ep} · scelte ${forzate.join(' + ') || '(nessuna)'} · poi ${testo}${extra ? ' ' + JSON.stringify(extra) : ''}: scelte fatte in ${fatte}/${N}, testo mostrato in ${entrambe} (${fatte ? (100 * entrambe / fatte).toFixed(0) : 0}%)`);
}
