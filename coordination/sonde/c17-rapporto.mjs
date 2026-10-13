// Sonda C-017 (credibilità del rapporto): quante volte il rapporto di un'ondata scrive «sotto controllo» (scoperto 0)
// per un settore con tensione ≥ DEGENERA, cioè uno di quelli che il premio di fiducia conta come «degenerati»
// (missione.ts: premio −1 per ogni settore con tensione ≥ 7; Rapporto.tsx: «sotto controllo» se scoperto = 0).
// Stagione 1, bot casuale (semi c17r:<ep>:<k>) e peggiore. Uso: node coordination/sonde/c17-rapporto.mjs [semi=200]
import { leggiDati } from '../../tools/dati-disco.mjs';
import { creaCaso } from '../../src/logica/caso.ts';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { DEGENERA, giocaMissione } from '../../src/logica/missione.ts';
import { casuale, peggiore } from '../../src/logica/bot.ts';
const N = Number(process.argv[2] ?? 200);
const d = leggiDati('data'); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x])); const v0 = variabiliIniziali(dich.values());
let rapporti = 0, conDegenerati = 0, contraddetti = 0, righe = 0; const esempi = [];
for (const m of Object.values(d).filter((x) => x?.stagione === 1).sort((a, b) => a.episodio - b.episodio))
  for (let k = 0; k <= N; k++) {
    const r = giocaMissione(m, v0, dich, k === 0 ? peggiore(creaCaso(1), dich) : casuale(creaCaso(`c17r:${m.id}:${k}`), dich));
    for (const x of r.rapporti) { rapporti++; const deg = Object.entries(x.tensione).filter(([, t]) => t >= DEGENERA); if (deg.length) conDegenerati++;
      const c = deg.filter(([s]) => !(x.scoperto[s] > 0)); if (c.length) { contraddetti++; righe += c.length; if (esempi.length < 6) esempi.push(`${m.id} ${k ? 'casuale ' + k : 'peggiore'} ondata ${x.n}: ${c.map(([s, t]) => `${s} tensione ${t} «sotto controllo»`).join(', ')}; fiducia ${x.fiducia}`); } }
  }
console.log(`rapporti ${rapporti}; con almeno un settore degenerato ${conDegenerati}; di questi con un degenerato scritto «sotto controllo» ${contraddetti} (${(100 * contraddetti / conDegenerati).toFixed(0)}%), righe ${righe}`);
for (const e of esempi) console.log('  ' + e);
// Caso peggiore: nessun settore «scoperto» nel rapporto, eppure «Fiducia −N: … degenerato».
let tutti = 0; const es2 = [];
for (const m of Object.values(d).filter((x) => x?.stagione === 1).sort((a, b) => a.episodio - b.episodio))
  for (let k = 1; k <= N; k++) for (const x of giocaMissione(m, v0, dich, casuale(creaCaso(`c17r:${m.id}:${k}`), dich)).rapporti)
    if ((x.fiducia ?? 0) < 0 && Object.values(x.scoperto).every((n) => n === 0)) { tutti++; if (es2.length < 4) es2.push(`${m.id} casuale ${k} ondata ${x.n}: tensioni ${JSON.stringify(x.tensione)} fiducia ${x.fiducia}`); }
console.log(`rapporti con tutti i settori «sotto controllo» e fiducia negativa per settori «degenerati»: ${tutti}`);
for (const e of es2) console.log('  ' + e);
