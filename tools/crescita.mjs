// D-162 («Crescente»): la difficoltà cresce fra le stagioni. La media delle partite a 0 stelle per stagione sale da
// stagione 1 a 2 e da 2 a 3, sia col giocatore casuale (giraBot) sia col «distratto» della partita simulata
// (docs/partita-az/curva.mjs: bot attento, 40% risposte a caso, un'unità spostata nel 50% delle ondate). Ogni episodio
// si gioca da solo con le variabili iniziali, come D-108/D-154: misura deterministica (semi fissi), non la campagna.
import { creaCaso } from '../src/logica/caso.ts';
import { semeDa } from '../src/logica/partita.ts';
import { attenta } from '../src/logica/bot.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { giocaMissione, opzioniValide, settoriAmmessi } from '../src/logica/missione.ts';
import { valutaEpisodio } from '../src/logica/episodi.ts';

const missioni = (dati) => Object.values(dati).filter((m) => m?.ondate).sort((a, b) => a.episodio - b.episodio);

/** Giocatore distratto: come quello di docs/partita-az/curva.mjs al livello «distratto». */
export function distratto(caso, dich) {
  const att = attenta(caso, dich);
  return {
    schiera(m, s) {
      const d = att.schiera(m, s);
      const unita = Object.entries(d).flatMap(([r, x]) => Object.entries(x).flatMap(([k, n]) => Array(n).fill([r, k])));
      for (const [r, k] of unita) if (caso.numero() < 0.5) { d[r][k]--; const a = caso.scegli(settoriAmmessi(m, r)); d[r][a] = (d[r][a] ?? 0) + 1; break; }
      return d;
    },
    scegli: (m, s, c) => (caso.numero() < 0.4 ? caso.scegli(opzioniValide(c, s, m)).id : att.scegli(m, s, c)),
  };
}

/** { id: [stagione, % di partite a 0 stelle] } del distratto, semi 1…N. */
export function quoteDistratto(dati, semi = 400) {
  const dich = new Map(dati['stato.json'].variabili.map((x) => [x.id, x])); const v0 = variabiliIniziali(dich.values());
  return Object.fromEntries(missioni(dati).map((m) => {
    let zero = 0;
    for (let s = 1; s <= semi; s++) if (valutaEpisodio(m, giocaMissione(m, v0, dich, distratto(creaCaso(`${m.id}:distratto:${s}`), dich), semeDa(`${m.id}:distratto:${s}`))).stelle === 0) zero++; // D-241: col seme di partita
    return [m.id, [m.stagione, (100 * zero) / semi]];
  }));
}

/** Stesse quote per il casuale, dal rapporto di giraBot. */
export const quoteCasuale = (rapporto, dati) => Object.fromEntries(missioni(dati).map((m) => {
  const r = rapporto.find((x) => x.missione === m.id && x.strategia === 'casuale');
  return [m.id, [m.stagione, r ? (100 * (r.stelle?.[0] ?? 0)) / r.semi : NaN]];
}));

export function controllaCrescita(quote, chi) {
  const media = (st) => { const v = Object.values(quote).filter(([s]) => s === st).map(([, q]) => q); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN; };
  const m = [1, 2, 3].map(media);
  return [1, 2].flatMap((i) => (Number.isFinite(m[i]) && Number.isFinite(m[i - 1]) && !(m[i] > m[i - 1])
    ? [`D-162 ${chi}: la stagione ${i + 1} (${m[i].toFixed(1)}% a 0 stelle) non è più difficile della ${i} (${m[i - 1].toFixed(1)}%)`] : []));
}
