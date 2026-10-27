// C-052: foto prima/dopo il tocco di un episodio (la mappa si sposta?), con la posizione del punto toccato.
import { avvia, apriCitta, salvTutti, salvNessuno, missioni } from './lib.mjs';
const D = process.argv[2]; const a = await avvia();
const parz = () => { const s = salvTutti(); const fuori = missioni.slice(8).map((m) => m.id); for (const id of fuori) delete s.episodi[id]; s.missioni_concluse = s.missioni_concluse.filter((x) => !fuori.includes(x)); return s; };
const pos = (p, id) => p.evaluate((id) => { const r = document.querySelector(`[data-episodio="${id}"] .settore-punto`).getBoundingClientRect(); const s = document.querySelector('[data-citta-striscia] svg')?.getBoundingClientRect(); return { y: Math.round(r.top + r.height / 2), striscia: s ? Math.round(s.height) : null, mappaTop: Math.round(document.querySelector('.mappa.citta').getBoundingClientRect().top) }; }, id);
for (const [nome, sal, w, h, passi] of [['tutti', salvTutti(), 360, 915, [['s2', 'e19']]], ['parz', parz(), 360, 915, [['s1', 'e01'], ['s1', 'e04'], ['s1', 'e09']]], ['parz', parz(), 412, 800, [['s1', 'e01'], ['s1', 'e09']]]]) {
  const { ctx, p } = await apriCitta(a.browser, a.url, w, h, sal);
  for (const [s, e] of passi) {
    await p.click(`[data-stagione="${s[1]}"]`); await p.waitForTimeout(200);
    const prima = await pos(p, e); await p.screenshot({ path: `${D}/salto-${nome}-${w}x${h}-${e}-prima.jpg`, type: 'jpeg', quality: 70 });
    await p.locator(`[data-episodio="${e}"] .settore-punto`).click(); await p.waitForTimeout(200);
    const dopo = await pos(p, e); await p.screenshot({ path: `${D}/salto-${nome}-${w}x${h}-${e}-dopo.jpg`, type: 'jpeg', quality: 70 });
    console.log(nome, `${w}×${h}`, e, 'prima', JSON.stringify(prima), 'dopo', JSON.stringify(dopo), 'spostamento del punto', dopo.y - prima.y, 'px');
  }
  await ctx.close();
}
await a.chiudi();
