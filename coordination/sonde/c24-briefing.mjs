// Sonda C-024 (sola lettura): PO-078 (D-118, D-122), vignetta della fonte 42×42 al posto dell'avatar nel briefing.
// Per ogni episodio e ogni passo del briefing, a ogni larghezza, due bracci (verde e rosso C51A01 = avatar di prima):
// altezza del documento e scorrimento, misura della figura, righe del nome, quale vignetta (luogo, chi), quanto del
// riquadro di «chi chiama» resta dentro il ritaglio e quanto è grande il suo glifo in px CSS. Foto della finestra
// (primo passo) e foto ingrandite della sola figura (scala 3) per ogni coppia luogo-chi distinta.
// Uso: node coordination/sonde/c24-briefing.mjs <radice> <foto> · env EP=e01,e07 LARGHEZZE=360x760,375x667,412x915
import { mkdirSync, writeFileSync } from 'node:fs';
import { missioni, avvia, alBriefing } from './c24-comune.mjs';
const DIR = process.argv[3] ?? 'docs/foto/c24'; mkdirSync(DIR, { recursive: true });
const EP = process.env.EP?.split(',') ?? missioni.map((m) => m.id);
const LARG = (process.env.LARGHEZZE ?? '360x760,375x667,412x915').split(',').map((x) => x.split('x').map(Number));
const { pagina, errori, chiudi } = await avvia();
const misura = (p) => p.evaluate(() => {
  const m = [...document.querySelectorAll('.scena [data-messaggio^="fonte-"]')].find((x) => x.getClientRects().length && !x.closest('[hidden]'));
  const se = document.scrollingElement; const f = m?.querySelector('[data-figura-fonte]'), av = m?.querySelector('.avatar'), nome = m?.querySelector('.chi-nome');
  const svg = f?.querySelector('svg.vignetta'); const r = (e) => { const q = e.getBoundingClientRect(); return { x: q.left, y: q.top, w: q.width, h: q.height }; };
  let chi = null;
  if (svg) {
    const box = svg.querySelector('g[transform="translate(232 18)"]'), s = r(svg);
    if (box) { const rb = r(box.querySelector('rect')); const glifo = box.querySelector('rect + g'); const rg = glifo ? r(glifo) : null;
      const ix = Math.max(0, Math.min(rb.x + rb.w, s.x + s.w) - Math.max(rb.x, s.x)) * Math.max(0, Math.min(rb.y + rb.h, s.y + s.h) - Math.max(rb.y, s.y));
      chi = { riquadro: `${rb.w.toFixed(1)}×${rb.h.toFixed(1)}`, dentro: ix / (rb.w * rb.h), glifo: rg ? `${rg.w.toFixed(1)}×${rg.h.toFixed(1)}` : null, glifoMax: rg ? Math.max(rg.w, rg.h) : null }; }
    else chi = { vice: true };
  }
  const lh = nome ? parseFloat(getComputedStyle(nome).lineHeight) || parseFloat(getComputedStyle(nome).fontSize) * 1.2 : 0;
  return { doc: se.scrollHeight, maxY: se.scrollHeight - innerHeight, msg: m ? Math.round(m.getBoundingClientRect().height) : null,
    figura: f ? `${Math.round(r(f).w)}×${Math.round(r(f).h)}` : null, avatar: av ? `${Math.round(r(av).w)}×${Math.round(r(av).h)}` : null,
    righeNome: nome ? Math.round(nome.getBoundingClientRect().height / lh) : null, vignetta: svg?.dataset.vignetta ?? null, titolo: svg?.getAttribute('aria-label') ?? null, chi,
    fonte: m?.querySelector('.chi-nome')?.textContent ?? null };
});
const RIS = []; const fotoFatte = new Set();
for (const [w, h] of LARG) for (const braccio of ['verde', 'C51A01']) {
  const p = await pagina({ w, h, rossi: braccio === 'verde' ? [] : [braccio], etichetta: braccio });
  for (const ep of EP) {
    try { await alBriefing(p, ep); } catch (e) { RIS.push({ w, braccio, ep, errore: e.message.slice(0, 80) }); continue; }
    let k = 0;
    for (;;) {
      k++; const x = await misura(p); RIS.push({ w, braccio, ep, passo: k, ...x });
      if (braccio === 'verde' && k === 1 && ['e01', 'e07', 'e13', 'e15', 'e28'].includes(ep)) await p.screenshot({ path: `${DIR}/briefing-${w}-${ep}-1.jpg`, type: 'jpeg', quality: 80 });
      if (braccio === 'C51A01' && k === 1 && w === 360 && ['e01', 'e15'].includes(ep)) await p.screenshot({ path: `${DIR}/briefing-${w}-${ep}-1-rosso.jpg`, type: 'jpeg', quality: 80 });
      if (!(await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count())) break;
      await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.waitForTimeout(120);
    }
  }
  await p.close();
}
// foto ingrandite della sola figura (scala 3, 360): una per coppia luogo-chi
{
  const p = await pagina({ w: 360, h: 760, scala: 3, etichetta: 'zoom' });
  for (const ep of EP) {
    await alBriefing(p, ep);
    for (;;) {
      const v = await p.evaluate(() => [...document.querySelectorAll('.scena [data-messaggio^="fonte-"]')].find((x) => x.getClientRects().length && !x.closest('[hidden]'))?.querySelector('svg.vignetta')?.dataset.vignetta);
      if (v && !fotoFatte.has(v)) { fotoFatte.add(v); await p.locator('.scena [data-messaggio^="fonte-"]:visible .chi').first().screenshot({ path: `${DIR}/figura-${v}-${ep}.png` }); }
      if (!(await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count())) break;
      await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.waitForTimeout(100);
    }
  }
  await p.close();
}
if (process.env.USCITA) writeFileSync(process.env.USCITA, JSON.stringify(RIS));
// confronto verde/rosso passo per passo
for (const [w] of LARG) {
  const v = RIS.filter((r) => r.w === w && r.braccio === 'verde' && r.passo), ro = RIS.filter((r) => r.w === w && r.braccio === 'C51A01' && r.passo);
  const chiave = (r) => `${r.ep}#${r.passo}`; const mr = new Map(ro.map((r) => [chiave(r), r]));
  const diff = v.filter((r) => mr.has(chiave(r)) && mr.get(chiave(r)).doc !== r.doc);
  const piuAlti = diff.filter((r) => r.doc > mr.get(chiave(r)).doc);
  const scorre = v.filter((r) => r.maxY > 0);
  const fig = [...new Set(v.map((r) => r.figura))]; const av = [...new Set(ro.map((r) => r.avatar))];
  const righe2 = v.filter((r) => r.righeNome > 1).length, righe2r = ro.filter((r) => r.righeNome > 1).length;
  const conChi = v.filter((r) => r.chi && !r.chi.vice); const dentro = conChi.map((r) => r.chi.dentro);
  const glifi = conChi.map((r) => r.chi.glifoMax).filter((x) => x != null).sort((a, b) => a - b);
  console.log(`${w}: passi verde ${v.length}, rosso ${ro.length}; documento diverso fra i bracci ${diff.length} (più alto col verde ${piuAlti.length}${piuAlti.length ? `: ${piuAlti.slice(0, 6).map((r) => `${chiave(r)} +${r.doc - mr.get(chiave(r)).doc}`).join(' ')}` : ''})`);
  console.log(`   passi che scorrono (verde) ${scorre.length}, max ${Math.max(0, ...v.map((r) => r.maxY))} px; (rosso) ${ro.filter((r) => r.maxY > 0).length}, max ${Math.max(0, ...ro.map((r) => r.maxY))} px`);
  console.log(`   figura ${fig.join(',')} · avatar del rosso ${av.join(',')} · nome su più righe verde ${righe2}/${v.length}, rosso ${righe2r}/${ro.length}`);
  console.log(`   riquadro di chi chiama dentro il ritaglio: min ${(100 * Math.min(...dentro)).toFixed(0)}%, mediana ${(100 * dentro.sort((a, b) => a - b)[dentro.length >> 1]).toFixed(0)}% · glifo lato maggiore px min ${glifi[0]?.toFixed(1)} mediana ${glifi[glifi.length >> 1]?.toFixed(1)} max ${glifi.at(-1)?.toFixed(1)} (n ${glifi.length}); vice ${v.filter((r) => r.chi?.vice).length}`);
  const vig = {}; for (const r of v) vig[r.vignetta] = (vig[r.vignetta] ?? 0) + 1; console.log(`   vignette: ${Object.entries(vig).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}=${n}`).join(' ')}`);
  console.log(`   esempi chi: ${[...new Set(conChi.map((r) => `${r.vignetta.split('-').at(-1)} ${r.chi.riquadro} glifo ${r.chi.glifo}`))].slice(0, 6).join(' | ')}`);
}
console.log(`errori di aggancio ${RIS.filter((r) => r.errore).length} ${RIS.filter((r) => r.errore).slice(0, 3).map((r) => `${r.w} ${r.braccio} ${r.ep}: ${r.errore}`).join(' | ')}; foto figure ${fotoFatte.size}; errori di console ${errori.length} ${[...new Set(errori)].slice(0, 3).join(' | ')}`);
await chiudi();
