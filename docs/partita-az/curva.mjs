// PO-126 (S-06): curva di difficoltà della campagna col solo motore (niente browser). Stesso giocatore della partita
// nel browser (bot «attenta» + sbagli a caso) a più livelli di sbaglio, 200 campagne ciascuno, variabili portate da
// un episodio all'altro; un episodio fallito si rigioca da capo (fino a 10 volte). Uso: node docs/partita-az/curva.mjs
import { writeFileSync } from 'node:fs';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { creaCaso } from '../../src/logica/caso.ts';
import { attenta } from '../../src/logica/bot.ts';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { giocaMissione, opzioniValide, settoriAmmessi } from '../../src/logica/missione.ts';
import { valutaEpisodio } from '../../src/logica/episodi.ts';

const dati = leggiDati();
const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
const ms = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m).sort((a, b) => a.episodio - b.episodio);
const LIVELLI = [['attento (come nel browser)', 0.15, 0.2], ['distratto', 0.4, 0.5], ['a caso', 1, 1]];
const N = Number(process.argv[2] ?? 200);
const out = {};
for (const [nome, pr, ps] of LIVELLI) {
  const per = Object.fromEntries(ms.map((m) => [m.id, { prime_fallite: 0, tentativi: 0, stelle: 0 }]));
  for (let seme = 1; seme <= N; seme++) {
    const caso = creaCaso(`curva:${nome}:${seme}`); const att = attenta(caso, dich);
    const g = {
      schiera(m, s) {
        const d = att.schiera(m, s);
        const unita = Object.entries(d).flatMap(([r, x]) => Object.entries(x).flatMap(([k, n]) => Array(n).fill([r, k])));
        for (const [r, k] of unita) if (caso.numero() < ps) { d[r][k]--; const a = caso.scegli(settoriAmmessi(m, r)); d[r][a] = (d[r][a] ?? 0) + 1; if (ps < 1) break; }
        return d;
      },
      scegli: (m, s, c) => (caso.numero() < pr ? caso.scegli(opzioniValide(c, s, m)).id : att.scegli(m, s, c)),
    };
    let v = variabiliIniziali(dich.values());
    for (const m of ms) {
      for (let k = 1; k <= 10; k++) {
        const r = giocaMissione(m, v, dich, g); const x = valutaEpisodio(m, r);
        per[m.id].tentativi++;
        if (x.fallita) { if (k === 1) per[m.id].prime_fallite++; continue; }
        per[m.id].stelle += x.stelle; v = r.variabili; break;
      }
    }
  }
  out[nome] = { sbaglio_risposta: pr, sbaglio_schieramento: ps, campagne: N, episodi: Object.fromEntries(Object.entries(per).map(([id, x]) => [id, { prime_fallite: +(x.prime_fallite / N).toFixed(3), tentativi_medi: +(x.tentativi / N).toFixed(2), stelle_medie: +(x.stelle / N).toFixed(2) }])) };
  const st = (s) => ms.filter((m) => m.stagione === s).map((m) => out[nome].episodi[m.id]);
  console.log(nome, [1, 2, 3].map((s) => `S${s}: prime fallite ${(st(s).reduce((a, x) => a + x.prime_fallite, 0) / st(s).length * 100).toFixed(1)}%, tentativi medi ${(st(s).reduce((a, x) => a + x.tentativi_medi, 0) / st(s).length).toFixed(2)}, stelle medie ${(st(s).reduce((a, x) => a + x.stelle_medie, 0) / st(s).length).toFixed(2)}`).join(' | '));
}
writeFileSync('docs/partita-az/curva.json', JSON.stringify(out, null, 1));
