// Sonda C-022: riepilogo delle uscite di c22-grafica.mjs (una o più, DPR 1 e 2). Raggruppa per elemento
// (tipo|nome|contesto) e larghezza: lato del riquadro e del glifo (px CSS), tratto (px CSS e px reali × DPR), contrasto
// minimo sul fondo (WCAG 2.1), schermate e numero di comparse; poi le vignette per tipo e larghezza.
// Uso: node coordination/sonde/c22-analisi.mjs <uscita1.json> [uscita2.json …]
import { readFileSync } from 'node:fs';
const tutti = process.argv.slice(2).map((f) => JSON.parse(readFileSync(f, 'utf8')));
const RIS = tutti.flatMap((j) => j.RIS); const errori = tutti.flatMap((j) => j.errori);
const conf = [...new Set(RIS.map((r) => `${r.w}@${r.dpr}`))];
console.log(`schermate misurate: ${RIS.length} (${conf.map((c) => `${c}: ${RIS.filter((r) => `${r.w}@${r.dpr}` === c).length}`).join(', ')}); episodi ${[...new Set(RIS.map((r) => r.ep))].join(',')}; errori di console ${errori.length}`);
const fam = (s) => s.replace(/-[\w]+$/, '').replace(/-\d+$/, '');
const G = new Map();
for (const r of RIS.filter((r) => r.dpr === 1)) for (const e of r.el) {
  if (e.tipo === 'vignetta' || e.tipo === 'pallino-passi') continue;
  const ctx = /^settore:/.test(e.ctx) ? 'settore:*' : e.ctx; const nome = e.tipo === 'disco-settore' || e.tipo === 'disco-citta' ? '*' : e.tipo === 'pastiglia' || e.tipo === 'tasto-lettera' ? '*' : e.nome;
  const k = `${e.tipo}|${nome}|${ctx}`; const g = G.get(k) ?? { k, n: 0, sc: new Set(), w: {}, cmin: 99, cminAttivo: 99, tr: 99, gl: 99, lato: 99, spenti: 0 }; G.set(k, g);
  g.n++; g.sc.add(fam(r.scena)); g.lato = Math.min(g.lato, Math.min(e.w, e.h)); g.gl = Math.min(g.gl, e.glifo ?? 99); g.tr = Math.min(g.tr, e.tratto ?? 99);
  const c = e.tipo === 'stemma' ? Math.min(e.contrasto, 99) : e.contrasto ?? 99; g.cmin = Math.min(g.cmin, c); if (!e.spento) g.cminAttivo = Math.min(g.cminAttivo, c); else g.spenti++;
  (g.w[r.w] ??= new Set()).add(`${e.w}×${e.h}`); g.es = g.es ?? e;
}
const f = (x) => (x === 99 ? '–' : x);
console.log('\n## Elementi (DPR 1; px CSS)\ntipo|nome|contesto · comparse · lato min · glifo min · tratto min · contrasto min (attivi) [spenti] · schermate · misure per larghezza');
for (const g of [...G.values()].sort((a, b) => a.k.localeCompare(b.k)))
  console.log(`${g.k} · ${g.n} · ${f(g.lato)} · ${f(g.gl)} · ${f(g.tr)} · ${f(g.cminAttivo)}${g.spenti ? ` [${g.spenti} spenti, ${g.cmin}]` : ''} · ${[...g.sc].join(',')} · ${Object.entries(g.w).map(([w, s]) => `${w}:${[...s].slice(0, 3).join('/')}`).join(' ')}${g.es.colore ? ` · ${g.es.colore} su ${g.es.fondo}` : ''}`);
console.log('\n## Vignette (per tipo, larghezza e DPR)');
const V = new Map();
for (const r of RIS) for (const e of r.el.filter((e) => e.tipo === 'vignetta')) {
  const t = e.nome.startsWith('chiamata-') ? `chiamata-*-${e.nome.split('-').pop()}` : e.nome.replace(/-e\d+$/, '-eNN');
  const k = `${t}|${r.w}|${r.dpr}`; const v = V.get(k) ?? { k, n: 0, w: new Set(), h: new Set(), sc: new Set(), tr: new Set(), ln: new Set(), riq: new Set(), chi: new Set(), pall: new Set(), escl: new Set() }; V.set(k, v);
  v.n++; v.w.add(e.w); v.h.add(e.h); v.sc.add(e.scala); v.tr.add(e.trattoPx); v.ln.add(e.lineaPx); if (e.riquadro) v.riq.add(e.riquadro); if (e.glifoChi) v.chi.add(e.glifoChi); if (e.pallino) v.pall.add(e.pallino); if (e.esclamativo) v.escl.add(e.esclamativo);
}
const span = (s) => { const a = [...s].map(Number).filter((x) => !Number.isNaN(x)); return a.length ? (Math.min(...a) === Math.max(...a) ? `${Math.min(...a)}` : `${Math.min(...a)}–${Math.max(...a)}`) : [...s].join('/') || '–'; };
for (const v of [...V.values()].sort((a, b) => a.k.localeCompare(b.k)))
  console.log(`${v.k} · n ${v.n} · ${span(v.w)}×${span(v.h)} px · scala ${span(v.sc)} · tratto ${span(v.tr)} · linea ${span(v.ln)}${v.riq.size ? ` · riquadro ${[...v.riq].join('/')} · glifo ${[...v.chi].join('/')}` : ''}${v.pall.size ? ` · pallino ${span(v.pall)}` : ''}${v.escl.size ? ` · «!» ${[...v.escl].join('/')}` : ''}`);
console.log('\n## Immagini <img>');
for (const r of RIS) for (const e of r.el.filter((e) => e.tipo === 'img')) console.log(`${r.w}@${r.dpr} ${r.scena}: ${e.nome} mostrato ${e.w}×${e.h} px CSS, servono ${e.serve} px, nativo ${e.nativo}, sgranato ${e.sgranato}`);
console.log('\n## Testo più piccolo dei nomi sulla mappa (px):', [...new Set(RIS.map((r) => r.nomiFont).filter(Boolean))].join(','));
