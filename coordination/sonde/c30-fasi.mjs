// Sonda C-030 (sola lettura): per gli episodi EP, ondata per ondata, la folla che la resa disegna (follaDellOndata di
// src/resa/mappa/folla.ts, la stessa funzione della mappa) accanto al campo «fase», agli eventi di gente in strada e ai
// testi dell'ondata (titolo e riga «i»). ROSSI=C84F01 per il confronto senza «fase». Uso: [EP=e07,…] [ROSSI=…] node coordination/sonde/c30-fasi.mjs
import { readFileSync } from 'node:fs';
for (const x of (process.env.ROSSI ?? '').split(',').filter(Boolean)) globalThis[`__NO_${x}`] = true;
const { follaDellOndata } = await import('../../src/resa/mappa/folla.ts');
const EP = (process.env.EP ?? 'e07,e21,e23,e27,e30').split(',');
for (const ep of EP) { const m = JSON.parse(readFileSync(`data/missioni/${ep}.json`, 'utf8')); const T = JSON.parse(readFileSync(`data/testi/it/${ep}.json`, 'utf8'));
  const t = (s) => T[s?.slice(6)] ?? s; console.log(`== ${ep} ${t(m.titolo)} — curve: ${m.mappa.settori.filter((s) => s.tipo === 'curva').map((s) => s.id).join(',') || 'nessuna'}`);
  for (const o of m.ondate) { const f = follaDellOndata(m, o.n);
    console.log(`  o${o.n} fase=${o.fase ?? '-'} → spalti ${f.spalti}; cortei ${f.cortei.map((c) => `${c.settore}>${c.verso}`).join(', ') || '-'}\n     «${t(o.titolo)}»: ${T[o.titolo.slice(6) + '.i'] ?? ''}\n     eventi: ${o.eventi.map((e) => `${e.tipo}@${e.settore}${e.verso ? '/' + e.verso : ''}`).join(' ')}`); } }
