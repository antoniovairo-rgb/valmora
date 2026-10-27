// C-052: a 640 e 667 di altezza la 0.52.0 è identica pixel per pixel al braccio rosso (C237S01+C237P01 = comportamento di prima)?
// Stati: nessuno/parziale/tutti, episodio scelto e Tripla. Il braccio rosso è la sola fonte del «prima» (nessuna build 0.51.0 ricostruita).
import { createHash } from 'node:crypto';
import { avvia, salvTutti, salvNessuno, missioni, CHIAVE } from './lib.mjs';
const primi = (n) => { const s = salvTutti(); const fuori = missioni.slice(n).map((m) => m.id); for (const id of fuori) delete s.episodi[id]; s.missioni_concluse = s.missioni_concluse.filter((x) => !fuori.includes(x)); return s; };
const BRACCI = JSON.parse(process.env.BRACCI ?? '[[],["C237S01","C237P01"]]'); // BRACCI='[[],[]]' = controllo di determinismo
const a = await avvia(); let uguali = 0; const diversi = [];
for (const [w, h] of [[360, 640], [375, 640], [412, 640], [360, 667], [375, 667], [412, 667]]) {
  for (const [nome, sal, ep, st, tri] of [['nessuno', salvNessuno(), 'e01', 1, false], ['parz', primi(8), 'e04', 1, false], ['parz-disp', primi(8), 'e09', 1, false], ['tutti', salvTutti(), 'e19', 2, false], ['tutti-tripla', salvTutti(), 'e19', 2, true]]) {
    const h2 = [];
    for (const ros of BRACCI) {
      const ctx = await a.browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, reducedMotion: 'reduce', deviceScaleFactor: 1 });
      await ctx.addInitScript((xs) => { for (const x of xs) globalThis['__NO_' + x] = true; }, ros);
      const p = await ctx.newPage(); await p.goto(a.url);
      await p.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [CHIAVE, sal]); await p.reload();
      await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('.scena[data-scena="citta"]');
      await p.click(`[data-stagione="${st}"]`); await p.locator(`[data-episodio="${ep}"] .settore-punto`).click();
      if (tri) await p.click('[data-azione="avvia-episodio"]');
      await p.waitForTimeout(500);
      h2.push(createHash('sha1').update(await p.screenshot({ type: 'png', animations: 'disabled' })).digest('hex').slice(0, 10));
      await ctx.close();
    }
    if (h2[0] === h2[1]) uguali++; else diversi.push(`${w}×${h} ${nome}: ${h2.join(' ≠ ')}`);
  }
}
console.log('identici', uguali, 'su', uguali + diversi.length, diversi.length ? '\ndiversi:\n' + diversi.join('\n') : '');
await a.chiudi();
