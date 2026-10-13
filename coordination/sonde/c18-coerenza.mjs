// Sonda C-018 (credibilità): come c17-coerenza, con più scelte forzate per caso e i casi nuovi trovati leggendo il
// copione di e01–e12 (c18-copione). Per ogni caso: N partite di un giocatore che schiera col bot attento e risponde a
// caso, salvo le scelte forzate (fatte appena la chiamata è aperta e l'opzione è offerta). Conta le partite in cui
// tutte le scelte sono state fatte E il testo successivo compare:
//   ch:<chiamata>            la chiamata si apre dopo;
//   opz:<chiamata>/<opzione> l'opzione è offerta dopo (e allora la sonda la sceglie, così la sua risposta si legge);
//   esito:<id>               l'esito finale ha quel verbale.
// Uso: node coordination/sonde/c18-coerenza.mjs [partite=1000]
import { leggiDati } from '../../tools/dati-disco.mjs';
import { creaCaso } from '../../src/logica/caso.ts';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, iniziaMissione, missioneFinita, opzioniValide, rispondi, schiera } from '../../src/logica/missione.ts';
import { attenta } from '../../src/logica/bot.ts';

const N = Number(process.argv[2] ?? 1000);
const d = leggiDati('data'); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x]));
// [id, episodio, scelte forzate (in ordine), testo, variabili di partenza in più]
const CASI = [
  ['V02d', 'e03', ['cartelloni/ascolta_comitato'], 'ch:silenzio'],
  ['V02d2', 'e03', ['cartelloni/promessa'], 'ch:silenzio_np'],
  ['N1a', 'e09', ['pullman_fermi/scarica_pullman'], 'ch:risultato'],
  ['N1b', 'e09', ['pullman_fermi/scarica_pullman'], 'esito:contenuto_a_fatica'],
  ['N1c', 'e09', ['pullman_fermi/scarica_pullman'], 'ch:lite_coda'],
  ['N2a', 'e04', ['arance/chiudi_mercato'], 'ch:fumo_arancio'],
  ['N2b', 'e04', ['arance/chiudi_mercato'], 'opz:fumo_arancio/lascia_fumo4'],
  ['N2c', 'e04', ['arance/chiudi_mercato'], 'opz:corteo_fonderie/corteo_banchi'],
  ['N2d', 'e04', ['arance/chiudi_mercato'], 'ch:banco_calzini', { informatore_pagato: true }],
  ['N2e', 'e04', ['arance/chiudi_mercato'], 'opz:risultato_chiuso/festa_piazzale'],
  ['N2f', 'e04', ['verdura/sgombera'], 'ch:fumo_arancio'],
  ['N2g', 'e04', ['verdura/sgombera'], 'opz:risultato_sgombero/festa_piazzale'],
  ['N3', 'e02', ['corteo_viale/mediatore_corteo'], 'opz:caldo_casa/niente'],
  ['N4a', 'e06', ['bis/bis_lungo'], 'opz:favore_impresa/accetta_favore', { presidente_incontrato: true }],
  ['N4b', 'e06', ['bis/bis_lungo', 'favore_impresa/accetta_favore'], 'ch:risultato_bislungo', { presidente_incontrato: true }],
  ['N4c', 'e06', ['bis/niente_bis'], 'ch:favore_impresa', { presidente_incontrato: true }],
  ['N4d', 'e06', ['bis/niente_bis', 'favore_impresa/accetta_favore'], 'ch:risultato_senzabis', { presidente_incontrato: true }],
  ['R10a', 'e09', ['furgone_coinvolto/controlla_furgone'], 'ch:furgone_sparito'],
  ['R10b', 'e07', ['risultato/carovana_libera'], 'opz:capodanno/chiudi_viale7'],
  ['R10c', 'e11', ['per_la_squadra/chiudi_fonderie'], 'opz:non_centro/accetta_dessi11'],
  ['R10d', 'e11', [], 'opz:non_centro/accetta_dessi11', { informatore_pagato: false }],
  ['R10e', 'e06', [], 'opz:sponsor/annota_sponsor', { furgone_visto: false }],
  ['R10f', 'e04', [], 'opz:banco_calzini/segui_banco', { informatore_pagato: true, furgone_visto: false }],
  ['R09a', 'e08', ['coreografia/accesso_libero'], 'esito:contenuto'],
  ['R09b', 'e08', ['stretta_mano/stringi'], 'esito:contenuto'],
  ['R09c', 'e03', [], 'esito:contenuto'],
];
const v0 = variabiliIniziali(dich.values());
const solo = process.argv[3]?.split(',');
for (const [id, ep, forzate, testo, extra] of CASI) {
  if (solo && !solo.includes(id)) continue;
  const m = d[`missioni/${ep}.json`]; const F = forzate.map((x) => x.split('/'));
  let fatte = 0, entrambe = 0; const g = attenta(creaCaso(1), dich);
  for (let k = 0; k < N; k++) {
    const caso = creaCaso(`c18:${id}:${k}`); let s = iniziaMissione(m, { ...v0, ...(extra ?? {}) }, dich); let n = 0, visto = false;
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
    }
    const e = concludiMissione(m, s, dich).esito.id;
    if (n === F.length && testo === `esito:${e}`) visto = true;
    fatte += n === F.length ? 1 : 0; entrambe += n === F.length && visto ? 1 : 0;
  }
  console.log(`${id} ${ep} · scelte ${forzate.join(' + ') || '(nessuna)'} · poi ${testo}${extra ? ' ' + JSON.stringify(extra) : ''}: scelte fatte in ${fatte}/${N}, testo mostrato in ${entrambe} (${fatte ? (100 * entrambe / fatte).toFixed(0) : 0}%)`);
}
