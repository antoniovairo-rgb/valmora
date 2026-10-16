// Sonda C-028: campo partita (D-130), curve dei dati e testi d'apertura. Uso: [TUTTI=1] node coordination/sonde/c28-partita.mjs (dalla radice)
import { readFileSync, readdirSync } from 'node:fs';
const T = {}; for (const f of readdirSync('data/testi/it')) Object.assign(T, JSON.parse(readFileSync('data/testi/it/' + f)));
const nome = (id) => T[`club.${id}`] ?? id;
for (const f of readdirSync('data/missioni').sort()) { const m = JSON.parse(readFileSync('data/missioni/' + f)); 
  const curve = m.mappa.settori.filter((s) => s.tipo === 'curva').map((s) => `${s.id}:${nome(s.club)}`);
  if (!m.partita && !process.env.TUTTI) continue;
  console.log(`${m.id} s${m.stagione} partita=${m.partita ? nome(m.partita.casa) + ' – ' + nome(m.partita.ospiti) : '-'} curve=[${curve.join(', ')}]`);
  for (const k of ['intro1', 'intro2', 'info_club', 'ondata1.i', 'verbale_contenuto']) if (T[`${m.id}.${k}`]) console.log(`   ${k}: ${T[`${m.id}.${k}`]}`);
}
