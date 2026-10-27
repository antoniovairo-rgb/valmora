// C-052 (PO-148): dopo aver toccato un'opzione si può cambiare idea toccandone un'altra? Il secondo tocco è raggiungibile (barra Annulla/Conferma che copre)?
import { avvia, apriCitta, salvTutti, missioni, CHIAVE } from './lib.mjs';
const a = await avvia(); const D = process.argv[2];
for (const [w, h] of [[360, 640], [360, 760], [412, 915]]) {
  const ctx = await a.browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, reducedMotion: 'reduce' }); const p = await ctx.newPage(); p.setDefaultTimeout(4000); await p.addInitScript(() => { globalThis.__VALMORA_SECONDO_MS = 1; });
  await p.goto(a.url); const s = salvTutti(); const i = missioni.findIndex((m) => m.id === 'e25'); for (const m of missioni.slice(i)) { delete s.episodi[m.id]; } s.missioni_concluse = s.missioni_concluse.filter((x) => !missioni.slice(i).some((m) => m.id === x));
  await p.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [CHIAVE, s]); await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('.scena[data-scena="citta"]');
  await p.click('[data-azione="avvia-episodio"]');
  for (let k = 0; k < 12 && !(await p.locator('[data-azione="conferma"]').count()); k++) { const b = p.locator('.scena [data-azione="avanti"], .scena [data-azione="inizia"], .scena [data-azione="passo"], .scena [data-azione="prossimo"], .scena button:has-text("Avanti"), .scena button:has-text("Ascolta le fonti"), .scena button:has-text("Alla prima ondata")').first(); if (await b.count()) await b.click().catch(() => {}); await p.waitForTimeout(150); }
  await p.click('[data-risorsa="squadre"]'); await p.click('[data-settore="stazione"] .settore-punto'); await p.click('[data-azione="conferma"]'); await p.click('[data-azione="conferma-davvero"]'); await p.waitForSelector('.opzione');
  const stato = () => p.evaluate(() => ({ sel: [...document.querySelectorAll('.opzione')].map((o) => o.getAttribute('aria-pressed') ?? o.getAttribute('aria-checked') ?? o.className.includes('scelta') ?? '?').join(','), conferma: !!document.querySelector('[data-azione="conferma-risposta"]'), n: document.querySelectorAll('.opzione').length }));
  const out = [`${w}×${h} opzioni ${(await stato()).n}`];
  await p.locator('.opzione').nth(0).click(); out.push('dopo tocco A: ' + JSON.stringify(await stato()));
  let ok = true; try { await p.locator('.opzione').nth(1).click(); } catch (e) { ok = false; out.push('TOCCO B FALLITO: ' + e.message.split('\n').slice(0, 6).join(' / ')); }
  out.push('dopo tocco B: ' + JSON.stringify(await stato()));
  const cop = await p.evaluate(() => { const o = document.querySelectorAll('.opzione')[1].getBoundingClientRect(), b = document.querySelector('[data-azione="conferma-risposta"]')?.getBoundingClientRect(); const t = document.elementFromPoint(o.left + o.width / 2, Math.min(o.top + o.height / 2, innerHeight - 1)); return { opzB: [Math.round(o.top), Math.round(o.bottom)], barra: b && [Math.round(b.top), Math.round(b.bottom)], inCimaAlCentroDiB: t?.closest('.opzione') ? 'opzione' : (t?.tagName + '.' + t?.className).slice(0, 40), ih: innerHeight }; });
  out.push('copertura: ' + JSON.stringify(cop)); console.log(out.join('\n  ')); if (D) await p.screenshot({ path: `${D}/cambia-opzione-${w}x${h}.jpg`, type: 'jpeg', quality: 70 }); await ctx.close();
}
await a.chiudi();
