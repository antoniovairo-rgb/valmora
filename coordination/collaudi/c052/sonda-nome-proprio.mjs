// C-052: il nome acceso sulla mappa copre il disco del suo stesso episodio? (c23-citta-copre conta anche «proprio», ma solo a 3 formati; qui tutti i 13, 36 episodi)
import { avvia, apriCitta, salvTutti } from './lib.mjs';
const a = await avvia(); const righe = [];
for (const [w, h] of [[360, 640], [360, 760], [360, 915], [375, 667], [375, 760], [375, 915], [412, 640], [412, 760], [412, 800], [412, 915]]) {
  const { ctx, p } = await apriCitta(a.browser, a.url, w, h, salvTutti());
  for (const s of [1, 2, 3]) { await p.click(`[data-stagione="${s}"]`); await p.waitForTimeout(100);
    for (const e of await p.locator('[data-episodio] .settore-punto:not([disabled])').evaluateAll((l) => l.map((x) => x.closest('[data-episodio]').dataset.episodio))) {
      await p.locator(`[data-episodio="${e}"] .settore-punto`).click(); await p.waitForTimeout(60);
      const r = await p.evaluate((e) => { const s = document.querySelector(`[data-episodio="${e}"]`), n = s.querySelector('.settore-nome'), d = s.querySelector('.settore-punto'); if (!n) return null; const a = n.getBoundingClientRect(), b = d.getBoundingClientRect(), m = document.querySelector('.mappa.citta').getBoundingClientRect();
        const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); const disco = Math.PI * (b.width / 2) ** 2;
        return { cop: ox > 0 && oy > 0 ? +(100 * Math.min(ox, b.width) * Math.min(oy, b.height) / (b.width * b.height)).toFixed(0) : 0, fuoriSx: +(m.left - a.left).toFixed(1), fuoriDx: +(a.right - m.right).toFixed(1), testo: n.textContent, lato: s.className.match(/lato-\w+/)?.[0] }; }, e);
      if (r) righe.push({ w, h, s, e, ...r }); } }
  await ctx.close();
}
await a.chiudi();
const peggio = righe.filter((r) => r.cop > 0 || r.fuoriSx > 0.5 || r.fuoriDx > 0.5);
console.log('nomi acceso misurati', righe.length, '· con sovrapposizione al proprio disco o fuori mappa', peggio.length);
const per = {}; for (const r of peggio) (per[`${r.e} ${r.lato} «${r.testo}»`] ??= []).push(`${r.w}×${r.h}:cop ${r.cop}%${r.fuoriSx > 0.5 ? ' fuoriSx ' + r.fuoriSx : ''}${r.fuoriDx > 0.5 ? ' fuoriDx ' + r.fuoriDx : ''}`);
for (const [k, v] of Object.entries(per)) console.log(k, '→', v.slice(0, 4).join(' | '), v.length > 4 ? `(+${v.length - 4})` : '');
