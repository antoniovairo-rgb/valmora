// D-246 (C53-01): quante volte la carta d'imprevisto arriva per ultima nell'ondata (dopo di lei nessuna chiamata).
// Uso: node tools/misura-d246.mjs [semi=300]. Bot attento e casuale, semi di partita come tools/misura-d241.mjs; seme 0 a parte.
import { leggiDati } from './dati-disco.mjs';
import { creaCaso } from '../src/logica/caso.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { giocaMissione } from '../src/logica/missione.ts';
import { semeDa } from '../src/logica/partita.ts';
import { attenta, casuale } from '../src/logica/bot.ts';

/** Per ogni missione e bot: ondate giocate e ondate in cui l'ultima chiamata risposta è un imprevisto. */
export function ultime(dati, semi = 300, conClassica = false) {
  const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
  const ms = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m).sort((a, b) => a.episodio - b.episodio);
  const out = [];
  for (const m of ms) {
    const imp = new Set(m.ondate.flatMap((o) => (o.chiamate ?? []).filter((c) => c.imprevisto).map((c) => c.id)));
    for (const [nome, bot] of [['attenta', attenta], ['casuale', casuale]]) {
      let ondate = 0, ultima = 0; const dove = new Map();
      for (let s = 1; s <= semi; s++) {
        const seme = conClassica ? 0 : semeDa(`d246:${m.id}:${nome}:${s}`);
        const r = giocaMissione(m, v0, dich, bot(creaCaso(`d246:${m.id}:${nome}:${s}`), dich), seme);
        for (const o of m.ondate) { const sc = r.scelte.filter((x) => x.ondata === o.n); if (!sc.length) continue; ondate++;
          if (imp.has(sc.at(-1).chiamata)) { ultima++; const k = `${m.id}.o${o.n} ${sc.at(-1).chiamata}`; dove.set(k, (dove.get(k) ?? 0) + 1); } }
        if (conClassica && nome === 'attenta') break; // attenta + seme 0 = una partita sola
      }
      out.push({ missione: m.id, bot: nome, ondate, ultima, dove: [...dove] });
    }
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dati = leggiDati(), semi = Number(process.argv[2] ?? 300);
  for (const [nome, r] of [['semi di partita', ultime(dati, semi)], ['partita classica (seme 0)', ultime(dati, semi, true)]]) {
    for (const b of ['attenta', 'casuale']) { const x = r.filter((y) => y.bot === b), o = x.reduce((s, y) => s + y.ondate, 0), u = x.reduce((s, y) => s + y.ultima, 0);
      console.log(`${nome} · ${b}: carta per ultima in ${u} ondate su ${o} (${(100 * u / o).toFixed(1)}%)`); }
    const peggio = r.flatMap((y) => y.dove).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (peggio.length) console.log(`  peggiori: ${peggio.map(([k, n]) => `${k} ${n}`).join(', ')}`);
  }
}
