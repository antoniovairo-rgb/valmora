// Sonda C-019 (credibilità): casi nuovi dopo le correzioni della 0.14.0 (C18-01/02/03) e contenuti mai mostrati.
// Parte 1, come c18-coerenza: N partite di un giocatore che schiera col bot attento e risponde a caso, salvo le scelte
// forzate; conta le partite in cui le scelte sono fatte E il testo dopo compare (ch:<chiamata>, opz:<chiamata>/<opzione>,
// esito:<id>).
// Parte 2: per ogni chiamata della stagione 1, in quante partite casuali (variabili di partenza a caso) si apre;
// stampa quelle mai aperte. Con DATI=<cartella> legge un'altra copia di data/ (per esempio quella di 5bcaf6b).
// Uso: node coordination/sonde/c19-coerenza.mjs [partite=1000] [id,…]   ·   DATI=/percorso/data node …
import { leggiDati } from '../../tools/dati-disco.mjs';
import { creaCaso } from '../../src/logica/caso.ts';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, iniziaMissione, missioneFinita, opzioniValide, rispondi, schiera } from '../../src/logica/missione.ts';
import { attenta, casuale } from '../../src/logica/bot.ts';

const N = Number(process.argv[2] ?? 1000);
const d = leggiDati(process.env.DATI ?? 'data'); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x]));
const CASI = [
  ['F1a', 'e06', [], 'ch:favore_impresa', { presidente_incontrato: true }],
  ['F1b', 'e06', [], 'ch:bis', { presidente_incontrato: true }],
  ['F1c', 'e06', ['bis/bis_corto', 'favore_impresa/accetta_favore'], 'ch:risultato', { presidente_incontrato: true }],
  ['F2a', 'e09', ['pullman_fermi/scarica_pullman'], 'ch:non_erano_nostri'],
  ['F2b', 'e09', ['pullman_fermi/scarica_pullman'], 'esito:contenuto_a_fatica'],
  ['F2c', 'e09', ['pullman_fermi/scarica_pullman'], 'ch:lite_coda'],
  ['F3a', 'e04', ['arance/chiudi_mercato'], 'ch:kebab'],
  ['F3b', 'e04', ['arance/chiudi_mercato'], 'opz:kebab/lascia_panino'],
  ['F3c', 'e04', ['arance/chiudi_mercato'], 'opz:corteo_fonderie/corteo_banchi'],
  ['F4', 'e02', ['corteo_viale/mediatore_corteo'], 'opz:caldo_casa/niente'],
];
const v0 = variabiliIniziali(dich.values());
const solo = process.argv[3]?.split(',');
for (const [id, ep, forzate, testo, extra] of CASI) {
  if (solo && !solo.includes(id)) continue;
  const m = d[`missioni/${ep}.json`]; const F = forzate.map((x) => x.split('/'));
  let fatte = 0, entrambe = 0; const g = attenta(creaCaso(1), dich);
  for (let k = 0; k < N; k++) {
    const caso = creaCaso(`c19:${id}:${k}`); let s = iniziaMissione(m, { ...v0, ...(extra ?? {}) }, dich); let n = 0, visto = false;
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
if (solo) process.exit(0);
// Parte 2: chiamate mai aperte.
const mai = [];
for (let i = 1; i <= 12; i++) {
  const ep = `e${String(i).padStart(2, '0')}`; const m = d[`missioni/${ep}.json`]; const conta = new Map();
  for (const o of m.ondate) for (const c of o.chiamate ?? []) conta.set(c.id, 0);
  for (let k = 0; k < N; k++) {
    const caso = creaCaso(`c19m:${ep}:${k}`); const g = casuale(caso, dich);
    const extra = { informatore_pagato: caso.scegli([true, false]), presidente_incontrato: caso.scegli([true, false]), furgone_visto: caso.scegli([true, false]), rapporto_dessi: caso.scegli(['neutro', 'rispetto', 'ostile']) };
    let s = iniziaMissione(m, { ...v0, ...extra }, dich);
    while (!missioneFinita(m, s)) {
      s = schiera(m, s, g.schiera(m, s));
      for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) { conta.set(c.id, conta.get(c.id) + 1); s = rispondi(m, s, c.id, g.scegli(m, s, c), dich); }
      s = chiudiOndata(m, s, dich);
    }
  }
  for (const [c, x] of conta) if (x === 0) mai.push(`${ep}.${c}`);
}
console.log(`chiamate mai aperte su ${N} partite casuali per episodio: ${mai.length ? mai.join(', ') : 'nessuna'}`);
