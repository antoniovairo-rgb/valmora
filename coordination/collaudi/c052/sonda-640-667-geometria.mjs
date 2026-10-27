import { avvia, salvTutti, missioni, CHIAVE } from './lib.mjs';
const primi = (n) => { const s = salvTutti(); const fuori = missioni.slice(n).map((m) => m.id); for (const id of fuori) delete s.episodi[id]; s.missioni_concluse = s.missioni_concluse.filter((x) => !fuori.includes(x)); return s; };
const a = await avvia();
for (const [w, h] of [[360, 640], [375, 640], [360, 667], [375, 667]]) for (const ep of ['e04', 'e09']) {
  const g = [];
  for (const ros of [[], ['C237S01']]) {
    const ctx = await a.browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, reducedMotion: 'reduce' }); await ctx.addInitScript((xs) => { for (const x of xs) globalThis['__NO_' + x] = true; }, ros);
    const p = await ctx.newPage(); await p.goto(a.url); await p.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [CHIAVE, primi(8)]); await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('.scena[data-scena="citta"]');
    await p.locator(`[data-episodio="${ep}"] .settore-punto`).click(); await p.waitForTimeout(400);
    g.push(await p.evaluate(() => JSON.stringify([...document.querySelectorAll('.scena *')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.left * 10), Math.round(r.top * 10), Math.round(r.width * 10), Math.round(r.height * 10)].join(','); })) + '|' + (document.documentElement.scrollHeight - innerHeight)));
    await ctx.close();
  }
  console.log(`${w}×${h} ${ep}: geometria di tutti gli elementi della scena ${g[0] === g[1] ? 'IDENTICA' : 'DIVERSA'} fra verde e rosso C237S01 (${g[0].length} byte)`);
}
await a.chiudi();
