// Sonda C-030 (sola lettura): per ogni ondata di e01–e36, la fase che dicono i testi (titolo + riga «i», per parole chiave)
// contro gli spalti che la mappa disegna (follaDellOndata). Stampa solo le discordanze. ROSSI=C84F01 per il confronto.
// Uso: [ROSSI=…] node coordination/sonde/c30-fasi-tutte.mjs
import { readFileSync } from 'node:fs';
for (const x of (process.env.ROSSI ?? '').split(',').filter(Boolean)) globalThis[`__NO_${x}`] = true;
const { follaDellOndata } = await import('../../src/resa/mappa/folla.ts');
const PAROLE = { partita: /\bsi gioca\b|in corso|primo tempo|secondo tempo|intervallo|la partita (prosegue|va avanti)|durante la partita|a metà partita/i,
  dopo: /fine partita|dopo la partita|a partita finita|partita finita|finita la partita|dopo il fischio finale/i, prima: /prima della partita|verso il fischio|prima del fischio|inizio serata|apertura dei cancelli|a stadio ancora vuoto/i };
const atteso = { partita: ['pieni'], dopo: ['deflusso', 'vuoti'], prima: ['arrivo', 'vuoti'] }; let n = 0, dis = 0;
for (let i = 1; i <= 36; i++) { const ep = `e${String(i).padStart(2, '0')}`; const m = JSON.parse(readFileSync(`data/missioni/${ep}.json`, 'utf8')); const T = JSON.parse(readFileSync(`data/testi/it/${ep}.json`, 'utf8'));
  if (!m.mappa.settori.some((s) => s.tipo === 'curva')) continue;
  for (const o of m.ondate) { const testo = `${T[o.titolo.slice(6)] ?? ''}. ${T[o.titolo.slice(6) + '.i'] ?? ''}`; const fasi = Object.keys(PAROLE).filter((k) => PAROLE[k].test(testo)); if (fasi.length !== 1) continue; n++;
    const f = follaDellOndata(m, o.n); if (!atteso[fasi[0]].includes(f.spalti)) { dis++; console.log(`${ep} o${o.n} testi «${fasi[0]}» ma spalti ${f.spalti} (fase nei dati: ${o.fase ?? '-'}): ${testo}`); } } }
console.log(`ondate con una sola fase riconosciuta nei testi: ${n}; discordanze: ${dis}`);
