// Sonda C-028: riassunto delle uscite di c28-grandi.mjs, una riga per risoluzione e una tabella per tipo di schermata.
// Uso: node coordination/sonde/c28-analisi.mjs <uscita1.json> [uscita2.json …]
import { readFileSync } from 'node:fs';
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const tipo = (s) => s.replace(/-.*/, '');
for (const f of process.argv.slice(2)) {
  const { W, H, TOCCO, RIS, errori } = JSON.parse(readFileSync(f, 'utf8'));
  const blocchi = errori.filter((e) => e.startsWith('BLOCCO')); const cons = errori.filter((e) => !e.startsWith('BLOCCO'));
  const ep = new Set(RIS.filter((r) => r.scena.startsWith('verbale')).map((r) => r.ep));
  const n = (g) => RIS.filter(g).length;
  const tela = RIS.filter((r) => r.mappa?.canvas).filter((r) => { const [cw, ch] = r.mappa.canvas.split('×').map(Number); return Math.abs(r.mappa.w - 6 - cw) > 2 || Math.abs(r.mappa.h - 6 - ch) > 2; });
  console.log(`\n## ${W}×${H}${TOCCO ? ' tocco' : ' mouse'}: episodi finiti ${ep.size}/36, schermate ${RIS.length}, blocchi ${blocchi.length}, errori di console ${cons.length}`);
  if (blocchi.length) console.log('  ' + blocchi.join('\n  '));
  if (cons.length) console.log('  ' + [...new Set(cons)].slice(0, 6).join('\n  '));
  console.log(`  scorrimento orizzontale ${n((r) => r.oriz > 0)} · tagli ${n((r) => r.tagli.length)} · sovrapposizioni ${n((r) => r.sovr.length)} · fuori schermo ${n((r) => r.fuori.length)} · comandi coperti ${n((r) => r.coperti.length)} · comandi < 44 px ${n((r) => r.piccoli.length)} · tela Pixi ≠ mappa ${tela.length}/${n((r) => r.mappa?.canvas)}`);
  const fmin = RIS.map((r) => r.font.min).filter((x) => x != null); const fmed = RIS.map((r) => r.font.mediana).filter((x) => x != null);
  console.log(`  caratteri (px): minimo ${Math.min(...fmin)}, mediana delle mediane ${med(fmed)}, massimo delle mediane ${Math.max(...fmed)}; testi < 12 px in ${n((r) => r.font.nSotto12)} schermate`);
  console.log(`  colonna ${[...new Set(RIS.map((r) => r.colonna))].join('/')} px, fuori colonna ${(RIS[0].fuoriColonna * 100).toFixed(1)} % · quota vuota: mediana ${(med(RIS.map((r) => r.vuota)) * 100).toFixed(1)} %, min ${(Math.min(...RIS.map((r) => r.vuota)) * 100).toFixed(1)} %, max ${(Math.max(...RIS.map((r) => r.vuota)) * 100).toFixed(1)} %`);
  const mp = RIS.filter((r) => r.mappa); console.log(`  mappa: ${[...new Set(mp.map((r) => `${r.mappa.w}×${r.mappa.h}`))].join(', ')}; quota della finestra mediana ${(med(mp.map((r) => r.mappa.quota)) * 100).toFixed(1)} %`);
  const ver = RIS.find((r) => r.versione); if (ver) console.log(`  versione in basso a destra: x ${ver.versione.x}, ${ver.versione.distanzaColonna} px a destra della colonna`);
  const T = new Map(); for (const r of RIS) { const k = tipo(r.scena); const x = T.get(k) ?? []; x.push(r); T.set(k, x); }
  console.log('  | schermata | n | sovrapp. | fuori | coperti | comandi sotto il bordo (schermate) | vuota mediana | carattere mediano |');
  for (const [k, L] of T) console.log(`  | ${k} | ${L.length} | ${L.filter((r) => r.sovr.length).length} | ${L.filter((r) => r.fuori.length).length} | ${L.filter((r) => r.coperti.length).length} | ${L.filter((r) => r.sotto).length} | ${(med(L.map((r) => r.vuota)) * 100).toFixed(1)} % | ${med(L.map((r) => r.font.mediana))} |`);
  // sovrapposizioni per tipo di coppia
  const C = new Map(); for (const r of RIS) for (const s of r.sovr) { const k = s.replace(/«[^»]*»/g, '').replace(/ [\d.]+×[\d.]+$/, ''); C.set(k, (C.get(k) ?? 0) + 1); }
  console.log('  coppie sovrapposte più frequenti: ' + [...C].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k} (${v})`).join('; '));
  const P = new Map(); for (const r of RIS) for (const s of r.piccoli) { const k = s.replace(/«[^»]*»/g, ''); P.set(k, (P.get(k) ?? 0) + 1); }
  if (P.size) console.log('  comandi < 44 px: ' + [...P].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} (${v})`).join('; '));
  const Fu = new Map(); for (const r of RIS) for (const s of r.fuori) Fu.set(s, (Fu.get(s) ?? 0) + 1); if (Fu.size) console.log('  fuori schermo: ' + [...Fu].slice(0, 6).map(([k, v]) => `${k} (${v})`).join('; '));
  const Co = new Map(); for (const r of RIS) for (const s of r.coperti) { const k = s.replace(/«[^»]*»/g, ''); Co.set(k, (Co.get(k) ?? 0) + 1); } if (Co.size) console.log('  coperti: ' + [...Co].slice(0, 6).map(([k, v]) => `${k} (${v})`).join('; '));
}
