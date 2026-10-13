// Sonda C-017 (credibilità): le contraddizioni fra una scelta e un testo successivo sono raggiungibili in partita?
// Per ogni caso: N partite di un giocatore che schiera con criterio (bot attento) e risponde a caso; conta le partite
// in cui la scelta è stata fatta E il testo successivo compare (chiamata aperta dopo, o esito col verbale citato).
// Uso: node coordination/sonde/c17-coerenza.mjs [partite=2000]
import { leggiDati } from '../../tools/dati-disco.mjs';
import { creaCaso } from '../../src/logica/caso.ts';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, iniziaMissione, missioneFinita, opzioniValide, rispondi, schiera } from '../../src/logica/missione.ts';
import { attenta } from '../../src/logica/bot.ts';

const N = Number(process.argv[2] ?? 2000);
const d = leggiDati('data'); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x]));
// casi: [episodio, scelta "chiamata/opzione", testo che la contraddice: "ch:<chiamata>" (compare dopo) o "esito:<id>", variabili extra]
const CASI = [
  ['e04', 'arance/chiudi_mercato', 'ch:verdura'], ['e04', 'arance/chiudi_mercato', 'ch:casalinghi'], ['e04', 'verdura/sgombera', 'ch:casalinghi'],
  ['e04', 'arance/chiudi_mercato', 'esito:contenuto'],
  ['e02', 'ultimo_treno/parte', 'esito:contenuto'], ['e03', 'troupe_notte/*', 'esito:contenuto'],
  ['e01', 'incrocio/scorrere', 'esito:contenuto'],
  ['e06', 'bis/niente_bis', 'ch:risultato'], ['e06', 'bis/bis_lungo', 'ch:risultato'],
  ['e07', 'banda/mediatore_banda', 'opz:primo_gol/mediatore_festa'], ['e02', 'corteo_viale/mediatore_corteo', 'opz:caldo_casa/mediatore_casa'],
  ['e09', 'pullman_fermi/scarica_pullman', 'ch:rigore9'], ['e10', 'patto_trasferta/fidati10', 'ch:fumo_pareggio', { rapporto_dessi: 'rispetto' }],
];
const v0 = variabiliIniziali(dich.values());
for (const [ep, scelta, testo, extra] of CASI) {
  const m = d[`missioni/${ep}.json`]; const [sc, so] = scelta.split('/');
  let fatte = 0, entrambe = 0; const g = attenta(creaCaso(1), dich);
  for (let k = 0; k < N; k++) {
    const caso = creaCaso(`coer:${ep}:${k}`); let s = iniziaMissione(m, { ...v0, ...(extra ?? {}) }, dich); let fatta = false, visto = false;
    while (!missioneFinita(m, s)) {
      s = schiera(m, s, g.schiera(m, s));
      for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
        if (fatta && testo === `ch:${c.id}`) visto = true;
        let ops = opzioniValide(c, s);
        if (fatta && testo.startsWith('opz:') && testo.slice(4).split('/')[0] === c.id) { const o = ops.find((x) => x.id === testo.split('/')[1]); if (o) { visto = true; ops = [o]; } }
        if (c.id === sc && !fatta) { const o = so === '*' ? caso.scegli(ops) : ops.find((x) => x.id === so); if (o) { ops = [o]; fatta = true; } }
        s = rispondi(m, s, c.id, caso.scegli(ops).id, dich);
      }
      s = chiudiOndata(m, s, dich);
    }
    const e = concludiMissione(m, s, dich).esito.id;
    if (fatta && testo === `esito:${e}`) visto = true;
    fatte += fatta ? 1 : 0; entrambe += fatta && visto ? 1 : 0;
  }
  console.log(`${ep} · scelta ${scelta} · poi ${testo}${extra ? ' ' + JSON.stringify(extra) : ''}: scelta fatta in ${fatte}/${N}, testo contraddittorio mostrato in ${entrambe} (${fatte ? (100 * entrambe / fatte).toFixed(0) : 0}% delle volte che la scelta è fatta)`);
}
