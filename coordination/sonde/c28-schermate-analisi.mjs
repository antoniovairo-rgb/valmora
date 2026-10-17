// Sonda C-028: riassunto delle uscite di c27-schermate.mjs (rilievi aperti C-026/C-027). Uso: node coordination/sonde/c28-schermate-analisi.mjs <uscite…>
import { readFileSync, existsSync } from 'node:fs';
for (const f of process.argv.slice(2)) { if (!existsSync(f)) continue; const { W, RIS, errori } = JSON.parse(readFileSync(f, 'utf8')); const n = (g) => RIS.filter(g).length;
  const bl = errori.filter((e) => e.includes('BLOCCO')); const ep = new Set(RIS.filter((r) => r.scena.startsWith('verbale')).map((r) => r.ep));
  console.log(`\n## ${f.split('/').pop()}: schermate ${RIS.length}, episodi ${ep.size}, blocchi ${bl.length}, errori ${errori.length - bl.length}: ${[...new Set(errori)].slice(0, 4).join(' | ')}`);
  console.log(`  oriz ${n((r) => r.oriz > 0)} tagli ${n((r) => r.tagli.length)} vecchi ${n((r) => r.vecchi.length)} coperti ${n((r) => r.coperti.length)} sovr ${n((r) => r.sovr.length)}`);
  const cop = RIS.filter((r) => r.coperti.length).map((r) => `${r.ep} ${r.scena}: ${r.coperti[0]}`); console.log('  coperti: ' + cop.slice(0, 4).join(' | ') + (cop.length > 4 ? ` … (${cop.length})` : ''));
  for (const e of ['e07', 'e13', 'e15', 'e21', 'e25', 'e27', 'e28', 'e31']) { const r = RIS.find((x) => x.ep === e && x.scena === 'sala-1'); console.log(`  sfida ${e}: ${r?.sfida?.testo ?? '—'} [${(r?.sfida?.stemmi ?? []).map((s) => s.id).join(',')}]`); }
  const ch = RIS.filter((r) => r.scena.startsWith('chiamata-')); console.log(`  urgenti ${ch.filter((r) => r.urg?.timbro?.some((t) => /urgente/i.test(t))).length}/${ch.length}`);
  const vb = RIS.filter((r) => r.scena === 'verbale-1'); const vis = vb.filter((r) => r.vg?.some((v) => !v.nascosta)); console.log(`  verbale-1 con vignetta mostrata ${vis.length}/${vb.length}, altezze ${vis.map((r) => Math.max(...r.vg.filter((v) => !v.nascosta).map((v) => v.h))).sort((a, b) => a - b).join(',')}`);
  const sa = RIS.filter((r) => r.scena === 'sala-1'); console.log(`  sala-1 con vignetta mostrata ${sa.filter((r) => r.vg?.some((v) => !v.nascosta)).length}/${sa.length}`);
  const e19 = RIS.filter((r) => r.ep === 'e19' && r.sovr.some((s) => /Magazzino/.test(s) && /pastiglia|«1»/.test(s))); console.log(`  e19 Magazzino × pastiglia: ${e19.length} schermate; es. ${e19[0]?.sovr.find((s) => /Magazzino/.test(s))}`);
  const C = new Map(); for (const r of RIS) for (const s of r.sovr) { const k = s.replace(/ [\d.]+×[\d.]+$/, ''); if (/pulsante/.test(k)) continue; C.set(k, (C.get(k) ?? 0) + 1); }
  console.log('  sovrapposizioni (senza quelle sotto i pulsanti fissi): ' + [...C].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k} (${v})`).join('; '));
}
