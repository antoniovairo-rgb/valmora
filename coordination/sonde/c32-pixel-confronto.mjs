// Sonda C-032: due log di c27-pixel.mjs (stessa partita, seme 1) sulla 0.28.0 e sulla 0.29.0, tutti gli episodi.
// Per ogni scena (schieramento o chiamata) e ogni corteo (dell'ondata e della chiamata): persone che si avvicinano
// allo stadio disegnato (verso) o se ne allontanano (via). «Cambiato» = la maggioranza passa da verso a via o viceversa,
// o una maggioranza netta (≥ 2/3) diventa incerta (fra 1/3 e 2/3). Uso: node coordination/sonde/c32-pixel-confronto.mjs <log 0.28.0> <log 0.29.0>
import { readFileSync } from 'node:fs';
const leggi = (f) => readFileSync(f, 'utf8').split('\n').filter((l) => l.startsWith('{')).map((l) => JSON.parse(l));
const cortei = (r) => { const out = []; for (const c of r.pixi?.ondata ?? []) if (c.stadio?.n) out.push([`ondata ${c.corteo}`, c.stadio]);
  const d = r.pixi?.dinamica; if (d?.stadio?.n) out.push([`chiamata ${d.quale}`, d.stadio]); return out; };
const mappa = (L) => { const m = new Map(); for (const r of L) for (const [k, s] of cortei(r)) m.set(`${r.ep} o${r.ondata} ${r.scena} | ${k}`, s); return m; };
const [A, B] = process.argv.slice(2).map((f) => mappa(leggi(f)));
const q = (s) => s.meno / s.n; // quota «verso lo stadio»
const classe = (x) => (x >= 2 / 3 ? 'verso' : x <= 1 / 3 ? 'via' : 'misto');
let n = 0, cambiati = []; for (const [k, b] of B) { const a = A.get(k); if (!a) continue; n++; const ca = classe(q(a)), cb = classe(q(b));
  if (ca !== cb) cambiati.push(`${k}: 0.28.0 ${a.meno} verso / ${a.piu} via → 0.29.0 ${b.meno} verso / ${b.piu} via (${ca} → ${cb})`); }
console.log(`cortei abbinati ${n} (0.28.0 ${A.size}, 0.29.0 ${B.size}); cambiati di classe ${cambiati.length}`); console.log(cambiati.join('\n'));
