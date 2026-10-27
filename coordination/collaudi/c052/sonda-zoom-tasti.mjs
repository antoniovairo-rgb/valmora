// C-052: a zoom testo 130% (token --testo-* ×1,3, emulazione dichiarata) i tasti Stagione/Home escono dallo schermo?
import { avvia, apriCitta, salvNessuno } from './lib.mjs';
const Z = Number(process.argv[2] ?? 1.3); const a = await avvia();
for (const w of [360, 375, 412]) for (const h of [640, 760]) {
  const { ctx, p } = await apriCitta(a.browser, a.url, w, h, salvNessuno());
  if (Z !== 1) await p.addStyleTag({ content: `:root { --testo-mini: ${12 * Z}px; --testo-piccolo: ${13 * Z}px; --testo-base: ${16 * Z}px; --testo-grande: ${20 * Z}px; --testo-titolo: ${26 * Z}px; --testo-numero: ${34 * Z}px; }` });
  await p.waitForTimeout(200);
  const r = await p.evaluate(() => [...document.querySelectorAll('[data-stagioni] > *')].map((b) => { const q = b.getBoundingClientRect(); return `${(b.dataset.stagione ? 'S' + b.dataset.stagione : 'home')} ${Math.round(q.left)}→${Math.round(q.right)}`; }).join(' · ') + ` | larghezza ${innerWidth} | sh ${document.documentElement.scrollWidth - innerWidth}`);
  console.log(`zoom ${Z * 100}% ${w}×${h}:`, r); await ctx.close();
}
await a.chiudi();
