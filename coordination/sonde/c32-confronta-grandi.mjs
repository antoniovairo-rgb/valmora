// Sonda C-032: confronta due uscite di c28-grandi.mjs (prima/dopo) schermata per schermata (stessa partita, seme 1):
// tipi di coppie sovrapposte comparsi solo in una delle due, schermate con sovrapposizioni in più o in meno, tela.
// Uso: node coordination/sonde/c32-confronta-grandi.mjs <prima.json> <dopo.json>
import { readFileSync } from 'node:fs';
const [A, B] = process.argv.slice(2).map((f) => JSON.parse(readFileSync(f, 'utf8')));
const chiave = (s) => s.replace(/«[^»]*»/g, '').replace(/ [\d.]+×[\d.]+$/, '');
const tipi = (R) => { const m = new Map(); for (const r of R.RIS) for (const s of r.sovr) { const k = chiave(s); m.set(k, (m.get(k) ?? 0) + 1); } return m; };
const ta = tipi(A), tb = tipi(B);
console.log('tipi di coppia solo prima:', [...ta].filter(([k]) => !tb.has(k)).map(([k, v]) => `${k} (${v})`).join('; ') || 'nessuno');
console.log('tipi di coppia solo dopo:', [...tb].filter(([k]) => !ta.has(k)).map(([k, v]) => `${k} (${v})`).join('; ') || 'nessuno');
const id = (r, i) => `${r.ep}/${r.scena}`;
const ma = new Map(); A.RIS.forEach((r) => { const k = id(r); ma.set(k, [...(ma.get(k) ?? []), r]); });
let piu = 0, meno = 0, ug = 0; const es = [];
const vb = new Map(); for (const r of B.RIS) { const k = id(r); const i = vb.get(k) ?? 0; vb.set(k, i + 1); const a = ma.get(k)?.[i]; if (!a) continue;
  const sa = new Set(a.sovr.map(chiave)), sb = new Set(r.sovr.map(chiave));
  if (sb.size > sa.size) { piu++; if (es.length < 8) es.push(`${k}: +${[...sb].filter((x) => !sa.has(x)).join(', ')}`); } else if (sb.size < sa.size) meno++; else ug++; }
console.log(`schermate abbinate: con più tipi di sovrapposizione ${piu}, con meno ${meno}, uguali ${ug}`); console.log('  ' + es.join('\n  '));
