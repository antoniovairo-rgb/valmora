// Riepilogo C-025 delle uscite di c25-schermate.mjs (una per larghezza, eventualmente coi bracci rossi).
// Uso: node coordination/sonde/c25-analisi.mjs <c25-360.json> <c25-375.json> <c25-412.json> [rosso-*.json …]
import { readFileSync } from 'node:fs';
const stat = (a) => { if (!a.length) return '—'; const s = [...a].sort((x, y) => x - y); const m = a.reduce((t, x) => t + x, 0) / a.length; return `min ${s[0]} · mediana ${s[Math.floor(s.length / 2)]} · media ${m.toFixed(2)} · max ${s.at(-1)} (n ${a.length})`; };
const tutti = process.argv.slice(2).map((f) => JSON.parse(readFileSync(f, 'utf8')));
const verdi = tutti.filter((x) => !x.ROSSI?.length), rossi = tutti.filter((x) => x.ROSSI?.length);
for (const x of verdi) {
  const ch = x.RIS.filter((r) => r.icona);
  console.log(`\n== ${x.W} px: schermate ${x.RIS.length}, episodi ${new Set(x.RIS.map((r) => r.ep)).size}, chiamate ${ch.length}, errori/blocchi ${x.errori.length}`);
  for (const e of [...new Set(x.errori)]) console.log(`   errore: ${e}`);
  const vecchi = x.RIS.filter((r) => r.vecchi.length); console.log(`  nomi vecchi visibili: ${vecchi.length} schermate`); for (const r of vecchi) console.log(`   ${r.ep} ${r.scena}: ${r.vecchi} … ${r.estratto?.replace(/\n/g, ' ')}`);
  console.log(`  scorrimento orizzontale: ${x.RIS.filter((r) => r.oriz > 0).length}; testi tagliati: ${x.RIS.filter((r) => r.tagli.length).length}`);
  for (const r of x.RIS.filter((r) => r.tagli.length).slice(0, 5)) console.log(`   ${r.ep} ${r.scena}: ${r.tagli.slice(0, 3).join(' | ')}`);
  const conIc = ch.filter((r) => r.icona.chi);
  console.log(`  icona chi: ${conIc.length}/${ch.length} chiamate (le altre del vice); riquadro ancora dentro: ${ch.filter((r) => r.icona.riquadroDentro).length}`);
  const per = (f) => [...new Set(conIc.map(f))].join(', ');
  console.log(`   riquadro ${per((r) => r.icona.box)} · svg ${per((r) => r.icona.svg)} · glifo disegnato ${per((r) => `${r.icona.chi} ${r.icona.glifo}`)} · tratto ${per((r) => r.icona.tratto)}`);
  console.log(`   contrasto glifo ${stat(conIc.map((r) => r.icona.cGlifo))} · contorno/fumetto ${stat(conIc.map((r) => r.icona.cBordoFuori))} · fondo icona/fumetto ${per((r) => r.icona.cFondoFuori)}`);
  console.log(`   sovrapposizioni con testo/pulsanti: ${conIc.filter((r) => r.icona.sopra.length).length}${conIc.filter((r) => r.icona.sopra.length).slice(0, 4).map((r) => `\n    ${r.ep} ${r.scena}: ${r.icona.sopra.join(', ')}`).join('')}`);
  console.log(`   coperta da altro: ${conIc.filter((r) => r.icona.punti.some((q) => q !== 'icona')).length}; fuori finestra: ${conIc.filter((r) => !r.icona.inFinestra).length}; vignetta coperta % ${stat(conIc.map((r) => r.icona.copreVignetta))}`);
  console.log(`   altezza fumetto ${stat(ch.map((r) => r.icona.fumetto))}`);
  const ps = ch.flatMap((r) => (r.pallini?.ps ?? []).map((q) => ({ ...q, ep: r.ep, scena: r.scena, evento: r.pallini.evento })));
  console.log(`  pallini: ${ps.length} in ${ch.filter((r) => r.pallini?.ps?.length).length} chiamate · diametro ${per2(ps, 'd')} · alone ${per2(ps, 'alone')} · contorno ${per2(ps, 'contorno')} · anello bianco visibile ${per2(ps, 'aloneAnello')}`);
  const bordo = ps.map((q) => Math.max(q.cAloneFondo, q.cContornoFondo));
  console.log(`   bordo esterno migliore (max alone/fondo, contorno/fondo) ${stat(bordo)}; sotto 3: ${bordo.filter((v) => v < 3).length}`);
  console.log(`   alone/fondo ${stat(ps.map((q) => q.cAloneFondo))}; contorno/alone ${stat(ps.map((q) => q.cContornoAlone))}`);
  const sotto = ps.filter((q) => Math.max(q.cAloneFondo, q.cContornoFondo) < 3); const g = {}; for (const q of sotto) { const k = `${q.evento} fondo ${q.fondo} riempimento ${q.fill}`; g[k] = (g[k] ?? []).concat(`${q.ep}:${q.scena.replace('chiamata-', '')}`); }
  for (const [k, v] of Object.entries(g)) console.log(`    <3: ${k}: ${v.length} (${[...new Set(v)].slice(0, 4).join(', ')})`);
}
function per2(ps, k) { return [...new Set(ps.map((q) => q[k]))].join('/'); }
// confronto altezza del fumetto verde/rosso per la stessa chiamata
for (const r of rossi) { const v = verdi.find((x) => x.W === r.W); if (!v) continue;
  const d = []; for (const c of r.RIS.filter((x) => x.icona)) { const g = v.RIS.find((x) => x.ep === c.ep && x.scena === c.scena); if (g) d.push({ k: `${c.ep} ${c.scena}`, rosso: c.icona.fumetto, verde: g.icona.fumetto, corpoR: c.icona.corpo, corpoV: g.icona.corpo }); }
  const div = d.filter((x) => x.rosso !== x.verde);
  console.log(`\n== rosso ${r.ROSSI} a ${r.W}: chiamate confrontate ${d.length}, altezza del fumetto diversa ${div.length}${div.slice(0, 6).map((x) => `\n   ${x.k}: rosso ${x.rosso} verde ${x.verde} (corpo ${x.corpoR}→${x.corpoV})`).join('')}`);
  const pr = r.RIS.flatMap((c) => c.pallini?.ps ?? []); if (pr.length) console.log(`   pallini rossi: ${pr.length}, diametro ${per2(pr, 'd')}, bordo migliore ${stat(pr.map((q) => Math.max(q.cAloneFondo ?? 0, q.cContornoFondo ?? 0, q.cFillFondoSotto)))}`);
}
