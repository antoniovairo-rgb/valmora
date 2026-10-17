// Sonda C-028: C26-11 con le misure del C-026 sulle uscite di c27-schermate.mjs: in e06 comandi coperti nello schieramento,
// in e13 e e16 nomi dei settori sovrapposti ad altri nomi (e alle pastiglie), con la misura più grande per coppia.
// Uso: node coordination/sonde/c28-c2611.mjs <uscita c27-schermate.json> […]
import { readFileSync } from 'node:fs';
for (const f of process.argv.slice(2)) {
  const { RIS } = JSON.parse(readFileSync(f, 'utf8'));
  const cop = RIS.filter((r) => r.ep === 'e06' && r.coperti.length).map((r) => `${r.scena}: ${r.coperti[0]}`);
  const coppie = new Map();
  for (const r of RIS) if (['e06', 'e13', 'e16', 'e19'].includes(r.ep)) for (const s of r.sovr) {
    if (!/settore-nome/.test(s)) continue; if (/segno-effetto/.test(s)) continue;
    const m = s.match(/^(.*) ([\d.]+)×([\d.]+)$/); const k = `${r.ep} ${m[1]}`; const a = +m[2] * +m[3]; const x = coppie.get(k);
    if (!x || a > x.a) coppie.set(k, { a, mis: `${m[2]}×${m[3]}`, n: (x?.n ?? 0) + 1 }); else x.n++;
  }
  console.log(`\n## ${f.split('/').pop()}\n  e06 comandi coperti: ${cop.length} ${cop.slice(0, 2).join(' | ')}`);
  for (const [k, v] of [...coppie].sort()) console.log(`  ${k}: max ${v.mis}, ${v.n} schermate`);
}
