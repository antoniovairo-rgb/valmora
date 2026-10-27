import { avvia, apriCitta, salvTutti, missioni } from './lib.mjs';
const a = await avvia();
for (const ros of [[], ['C237S01'], ['C237S01', 'C237P01']]) {
  const ctx = await a.browser.newContext({ viewport: { width: 360, height: 915 }, hasTouch: true, reducedMotion: 'reduce' }); await ctx.addInitScript((xs) => { for (const x of xs) globalThis['__NO_' + x] = true; }, ros);
  const p = await ctx.newPage(); await p.addInitScript(() => { globalThis.__VALMORA_SECONDO_MS = 1; }); await p.goto(a.url);
  const s = salvTutti(); const fuori = missioni.slice(8).map((m) => m.id); for (const id of fuori) delete s.episodi[id]; s.missioni_concluse = s.missioni_concluse.filter((x) => !fuori.includes(x));
  await p.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), ['valmora-salvataggio', s]); await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('.scena[data-scena="citta"]'); await p.waitForTimeout(300);
  const out = [];
  for (const e of ['e01', 'e04', 'e09']) { await p.locator(`[data-episodio="${e}"] .settore-punto`).click(); await p.waitForTimeout(150); out.push(await p.evaluate(() => ({ mt: Math.round(document.querySelector('.mappa.citta').getBoundingClientRect().top), str: Math.round(document.querySelector('[data-citta-striscia] svg')?.getBoundingClientRect().height) }))); }
  console.log('rosso', ros.join('+') || '(verde)', JSON.stringify(out)); await ctx.close();
}
await a.chiudi();
