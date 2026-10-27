import { avvia, salvTutti, missioni, CHIAVE } from './lib.mjs';
const primi = (n) => { const s = salvTutti(); const fuori = missioni.slice(n).map((m) => m.id); for (const id of fuori) delete s.episodi[id]; s.missioni_concluse = s.missioni_concluse.filter((x) => !fuori.includes(x)); return s; };
const a = await avvia();
for (const ros of [[], ['C237S01']]) for (const [e, i] of [['e13', 12], ['e12', 11]]) {
  const ctx = await a.browser.newContext({ viewport: { width: 412, height: 800 }, hasTouch: true, reducedMotion: 'reduce' }); await ctx.addInitScript((xs) => { for (const x of xs) globalThis['__NO_' + x] = true; }, ros);
  const p = await ctx.newPage(); await p.goto(a.url); await p.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [CHIAVE, primi(i)]); await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('.scena[data-scena="citta"]'); await p.waitForTimeout(300);
  await p.click(`[data-stagione="${missioni[i].stagione}"]`); await p.locator(`[data-episodio="${e}"] .settore-punto`).click(); await p.waitForTimeout(400);
  const r = await p.evaluate((e) => { const s = document.querySelector(`[data-episodio="${e}"]`), n = s.querySelector('.settore-nome'), m = document.querySelector('.mappa.citta').getBoundingClientRect(), g = document.createRange(); g.selectNodeContents(n); const t = g.getBoundingClientRect(); const d = s.querySelector('.settore-punto').getBoundingClientRect(); return { mappaH: Math.round(m.height), testoSx: Math.round(t.left - m.left), testoDx: Math.round(t.right - m.right), sovrDisco: Math.round(Math.min(t.right, d.right) - Math.max(t.left, d.left)), scrollW: n.scrollWidth, clientW: n.clientWidth, ovf: getComputedStyle(n).overflow }; }, e);
  console.log('rosso', ros.join('+') || '(verde)', e, JSON.stringify(r)); await ctx.close(); }
await a.chiudi();
