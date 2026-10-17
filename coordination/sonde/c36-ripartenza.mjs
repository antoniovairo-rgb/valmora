// Sonda C-036 (sola lettura): da una sconfitta vera (campo «sconfitta» del salvataggio, copiato in un file JSON) riparte
// dall'ondata proposta (partenze[n], come «Riparti dall'ondata n») e gioca fino in fondo con le strategie del bot
// (deterministiche una volta, casuale e casuale con schieramento attento su N semi): quante partite si possono ancora vincere.
// Uso: node coordination/sonde/c36-ripartenza.mjs <sconfitta.json> <ondata> [N]
import { readFileSync } from 'node:fs'; import { join } from 'node:path';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { chiamateAperte, chiudiOndata, concludiMissione, missioneFinita, rispondi, schiera, riprendiDallOndata, ondataDaRiprendere } from '../../src/logica/missione.ts';
import { STRATEGIE, attenta, casuale } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';
const [f, n, k] = process.argv.slice(2); const N = Number(k ?? 1000); const sc = JSON.parse(readFileSync(f, 'utf8'));
const d = leggiDati(join(process.cwd(), 'data')); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x])); const m = d[`missioni/${sc.missione}.json`];
console.log(`${sc.missione}: ondata proposta dal gioco ${ondataDaRiprendere(sc, m)}; provo dall'ondata ${n}`);
const gioca = (g) => { let s = riprendiDallOndata(sc, Number(n)); while (!missioneFinita(m, s)) { s = schiera(m, s, g.schiera(m, s)); for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = chiudiOndata(m, s, dich); } return concludiMissione(m, s, dich).esito; };
for (const [nome, st] of Object.entries(STRATEGIE)) {
  const semi = nome === 'casuale' ? N : 1; const conta = {};
  for (let i = 1; i <= semi; i++) { const e = gioca(st(creaCaso(`c36r:${i}`), dich)); conta[e.id] = (conta[e.id] ?? 0) + 1; }
  console.log(`  ${nome} (${semi}): ${JSON.stringify(conta)}`);
}
const conta = {}; for (let i = 1; i <= N; i++) { const a = attenta(creaCaso(1), dich), c = casuale(creaCaso(`c36m:${i}`), dich); const e = gioca({ schiera: a.schiera, scegli: c.scegli }); conta[e.id] = (conta[e.id] ?? 0) + 1; }
console.log(`  schieramento attento + scelte a caso (${N}): ${JSON.stringify(conta)}`);
