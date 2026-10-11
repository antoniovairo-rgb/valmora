// La novità delle risorse fisse conta (D-082): per ogni missione con una risorsa «fissa», si forzano tutte le
// posizioni possibili delle sue unità nella prima ondata e il resto lo gioca il bot equilibrato. Se le stelle
// sono sempre le stesse, dove monti le transenne non conta e la novità è vuota.
import { creaCaso } from '../src/logica/caso.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, iniziaMissione, missioneFinita, rispondi, schiera, settoriAmmessi } from '../src/logica/missione.ts';
import { equilibrata } from '../src/logica/bot.ts';
import { valutaEpisodio } from '../src/logica/episodi.ts';

function posizioni(ammessi, n, da = 0) {
  if (!n) return [[]];
  return ammessi.slice(da).flatMap((k, i) => posizioni(ammessi, n - 1, da + i).map((r) => [k, ...r]));
}

export function posizioneConta(dati) {
  const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
  const v0 = variabiliIniziali(dich.values());
  const out = [];
  for (const [k, m] of Object.entries(dati)) {
    if (!k.startsWith('missioni/')) continue;
    for (const [r, x] of Object.entries(m.mappa.risorse)) {
      if (!x.fissa) continue;
      const stelle = {};
      for (const pos of posizioni(settoriAmmessi(m, r), x.quantita)) {
        const g = equilibrata(creaCaso(1), dich); let s = iniziaMissione(m, v0, dich); let primo = true;
        while (!missioneFinita(m, s)) {
          const dd = structuredClone(g.schiera(m, s));
          if (primo) { dd[r] = {}; for (const p of pos) dd[r][p] = (dd[r][p] ?? 0) + 1; primo = false; }
          s = schiera(m, s, dd);
          for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, g.scegli(m, s, c), dich);
          s = chiudiOndata(m, s, dich);
        }
        stelle[pos.join('+')] = valutaEpisodio(m, concludiMissione(m, s, dich)).stelle;
      }
      out.push({ missione: m.id, risorsa: r, stelle });
    }
  }
  return out;
}

export const controllaFisse = (r) => r.filter((x) => new Set(Object.values(x.stelle)).size < 2)
  .map((x) => `${x.missione}: dove si mettono le unità «${x.risorsa}» non cambia le stelle (${JSON.stringify(x.stelle)})`);
