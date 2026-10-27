import { readFileSync } from 'node:fs';
const f = process.argv[2]; const { ris, modo, schema } = JSON.parse(readFileSync(f));
const per = {}; for (const r of ris) (per[`${r.w}×${r.h}`] ??= []).push(r);
console.log(modo, schema, 'stati', ris.length);
for (const [k, L] of Object.entries(per)) {
  const mx = (g) => Math.max(...L.map(g)), mn = (g) => Math.min(...L.map(g));
  const bt = L.flatMap((r) => r.bt.map((b) => ({ ...b, r })));
  const sopra = L.filter((r) => r.striscia).flatMap((r) => r.striscia.sopra);
  const tagli = L.filter((r) => r.tagli.length), sov = L.filter((r) => r.sov.length);
  console.log(k, `sv max ${mx((r) => r.sv)} sh max ${mx((r) => r.sh)} | striscia ${L[0].striscia ? L[0].striscia.h : '—(testata)'} sopra teste ${sopra.length ? mn(() => 0) && Math.min(...sopra) + '..' + Math.max(...sopra) : '—'} | mappa h ${mn((r) => r.mappa.h)}..${mx((r) => r.mappa.h)} | tagli ${tagli.length} sov ${sov.length} | bt n=${bt.length} sx≥${bt.length ? Math.min(...bt.map((b) => b.sx)) : '-'} dx≥${bt.length ? Math.min(...bt.map((b) => b.dx)) : '-'} giu≥${bt.length ? Math.min(...bt.map((b) => b.giu)) : '-'} | fondo ${mn((r) => r.fondo)}..${mx((r) => r.fondo)}`);
}
