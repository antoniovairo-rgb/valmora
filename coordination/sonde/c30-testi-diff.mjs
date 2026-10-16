// Sonda C-030 (sola lettura): testi di e13–e36 cambiati fra due commit (0.25.0 1e1ba03 → HEAD). Per ogni chiave: prima, dopo,
// lunghezze, parole con iniziale maiuscola e numeri spariti/comparsi (indizio di fatti o nomi persi), chiavi nuove o tolte.
// Uso: node coordination/sonde/c30-testi-diff.mjs [prima=1e1ba03] [dopo=HEAD] [uscita.json]
import { execSync } from 'node:child_process'; import { writeFileSync } from 'node:fs';
const [A = '1e1ba03', B = 'HEAD', OUT] = process.argv.slice(2);
const leggi = (c, f) => { try { return JSON.parse(execSync(`git show ${c}:${f}`, { encoding: 'utf8' })); } catch { return {}; } };
const nomi = (s) => new Set((s.match(/(?<![.!?«»:]\s)(?<!^)\b[A-ZÀ-Ý][a-zà-ÿ'’]+(?:\s[A-ZÀ-Ý][a-zà-ÿ]+)*/g) ?? []));
const num = (s) => new Set(s.match(/\d+(?:[.,]\d+)?|\b(?:un|uno|una|due|tre|quattro|cinque|sei|sette|otto|nove|dieci|venti|trenta|cento|mille|mezz[oa])\b/gi) ?? []);
const R = []; let tot = 0;
for (let i = 13; i <= 36; i++) { const f = `data/testi/it/e${i}.json`; const p = leggi(A, f), d = leggi(B, f);
  for (const k of new Set([...Object.keys(p), ...Object.keys(d)])) { if (p[k] === d[k]) continue; tot++;
    const np = nomi(p[k] ?? ''), nd = nomi(d[k] ?? ''); const xp = num(p[k] ?? ''), xd = num(d[k] ?? '');
    R.push({ k, prima: p[k] ?? null, dopo: d[k] ?? null, lp: (p[k] ?? '').length, ld: (d[k] ?? '').length,
      nomiPersi: [...np].filter((x) => !(d[k] ?? '').includes(x)), nomiNuovi: [...nd].filter((x) => !(p[k] ?? '').includes(x)),
      numPersi: [...xp].filter((x) => !xd.has(x)), numNuovi: [...xd].filter((x) => !xp.has(x)) }); } }
console.log(`chiavi cambiate ${tot}; nuove ${R.filter((r) => r.prima === null).length}; tolte ${R.filter((r) => r.dopo === null).length}; con nomi persi ${R.filter((r) => r.nomiPersi.length).length}; con numeri persi ${R.filter((r) => r.numPersi.length).length}`);
const tipo = (k) => /\.ch\./.test(k) ? 'chiamata' : /\.info_/.test(k) ? 'fonte' : 'altro'; const c = {}; for (const r of R) c[tipo(r.k)] = (c[tipo(r.k)] ?? 0) + 1; console.log('per tipo', JSON.stringify(c));
if (OUT) writeFileSync(OUT, JSON.stringify(R, null, 1));
