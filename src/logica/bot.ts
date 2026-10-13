// Bot di partita per la missione a scene: schierano e rispondono alle chiamate a partire da un seme.
// Servono a provare che una missione finisce sempre, che ogni esito è raggiungibile e che le scelte
// contano, e a tarare i numeri (D-036).
import type { Caso } from './caso.ts';
import { chiamateAperte, chiudiOndata, disponibili, opzioniValide, rispondi, settoriAmmessi, type Giocatore, type InCorso } from './missione.ts';
import type { Chiamata, Dichiarazione, Disposizione, Missione } from './tipi.ts';

type Dich = Map<string, Dichiarazione>;
const vuota = (m: Missione): Disposizione => Object.fromEntries(Object.keys(m.mappa.risorse).map((r) => [r, {}]));
const metti = (d: Disposizione, r: string, s: string) => { d[r]![s] = (d[r]![s] ?? 0) + 1; };

/** Tensione dopo la chiusura dell'ondata, se le chiamate ancora aperte non cambiassero nulla. */
function stima(m: Missione, s: InCorso, d: Dich): number {
  const risposte = { ...s.risposte };
  for (const c of chiamateAperte(m, s)) risposte[c.id] = '—';
  const t = Object.values(chiudiOndata(m, { ...s, risposte }, d).tensione);
  return Math.max(...t) * 100 + t.reduce((a, b) => a + b, 0);
}

/** Peso del credito per il giocatore equilibrato: un punto di credito vale quanto questa tensione stimata. */
const PESO_CREDITO = 60; // misurato: 3 stelle stabili con pesi da 20 a 100 su e01 (120 = troppo)

const opzioneMigliore = (m: Missione, s: InCorso, c: Chiamata, d: Dich, segno: 1 | -1, credito = 0) => {
  let scelta = opzioniValide(c, s, m)[0]!.id, voto = Infinity;
  for (const o of opzioniValide(c, s, m)) {
    const t = rispondi(m, s, c.id, o.id, d);
    const v = segno * stima(m, t, d) - credito * (Number(t.variabili.credito ?? 0));
    if (v < voto) { voto = v; scelta = o.id; }
  }
  return scelta;
};

export type Strategia = (caso: Caso, d: Dich) => Giocatore;

/** Ogni unità in un settore a caso, ogni risposta a caso. */
export const casuale: Strategia = (caso) => ({
  schiera(m, s) {
    const dd = vuota(m);
    for (const [r, n] of Object.entries(disponibili(m, s))) for (let i = 0; i < n; i++) metti(dd, r, caso.scegli(settoriAmmessi(m, r)));
    return dd;
  },
  scegli: (m, s, c) => caso.scegli(opzioniValide(c, s, m)).id,
});

/** Avido: un'unità per volta dove abbassa di più la tensione stimata; risposte che la abbassano. */
export const attenta: Strategia = (_caso, d) => ({
  schiera(m, s) {
    const dd = vuota(m);
    for (const [r, n] of Object.entries(disponibili(m, s))) for (let i = 0; i < n; i++) {
      let migliore = { id: settoriAmmessi(m, r)[0]!, v: Infinity };
      for (const id of settoriAmmessi(m, r)) {
        metti(dd, r, id);
        const v = stima(m, { ...s, disposizione: dd }, d);
        dd[r]![id]! -= 1;
        if (v < migliore.v) migliore = { id, v };
      }
      metti(dd, r, migliore.id);
    }
    return dd;
  },
  scegli: (m, s, c) => opzioneMigliore(m, s, c, d, 1),
});

/** Il giocatore peggiore che non esce dalle regole: tutto nel settore più calmo, risposte che alzano la tensione. */
export const peggiore: Strategia = (_caso, d) => ({
  schiera(m, s) {
    const dd = vuota(m);
    const o = m.ondate[s.ondata - 1]!;
    const p = (id: string) => o.eventi.filter((e) => e.settore === id).reduce((t, e) => t + e.pressione, 0);
    const calmo = (r: string) => [...settoriAmmessi(m, r)].sort((a, b) => p(a) - p(b) || a.localeCompare(b))[0]!;
    for (const [r, n] of Object.entries(disponibili(m, s))) if (n) dd[r]![calmo(r)] = n;
    return dd;
  },
  scegli: (m, s, c) => opzioneMigliore(m, s, c, d, -1),
});

/** Come «attenta» nello schieramento, ma nelle risposte pesa anche il credito politico. */
export const equilibrata: Strategia = (caso, d) => ({
  schiera: attenta(caso, d).schiera,
  scegli: (m, s, c) => opzioneMigliore(m, s, c, d, 1, PESO_CREDITO),
});

export const STRATEGIE: Record<string, Strategia> = { casuale, attenta, equilibrata, peggiore };

/** Strategie che non usano il caso: con qualunque seme giocano la stessa partita (guardiano in tests/bot-deterministiche.test.ts).
 *  tools/bot.mjs le gioca una volta sola e conta il risultato per tutti i semi (D-089). */
export const DETERMINISTICHE = new Set(['attenta', 'equilibrata', 'peggiore']);
