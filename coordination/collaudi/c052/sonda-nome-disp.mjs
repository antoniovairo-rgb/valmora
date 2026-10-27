// (misura il TESTO via Range, non il riquadro: il testo può uscire dal riquadro) C-052: con l'episodio scelto «da giocare» (i precedenti conclusi) il suo nome copre il disco o esce dalla mappa?
// Un salvataggio per episodio i (concluso 1..i-1), si sceglie i. Uso: node sonda-nome-disp.mjs [w×h ...]
import { writeFileSync } from 'node:fs';
import { avvia, apriCitta, salvTutti, missioni, CHIAVE } from './lib.mjs';
const primi = (n) => { const s = salvTutti(); const fuori = missioni.slice(n).map((m) => m.id); for (const id of fuori) delete s.episodi[id]; s.missioni_concluse = s.missioni_concluse.filter((x) => !fuori.includes(x)); return s; };
const formati = (process.argv.slice(2).length ? process.argv.slice(2) : ['360×760', '412×800', '412×915', '360×640', '375×667']).map((f) => f.split('×').map(Number));
const a = await avvia(); const righe = [];
for (const [w, h] of formati) {
  const { ctx, p } = await apriCitta(a.browser, a.url, w, h, primi(0));
  for (let i = 0; i < missioni.length; i++) {
    await p.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [CHIAVE, primi(i)]); await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('.scena[data-scena="citta"]'); await p.waitForTimeout(150);
    const e = missioni[i].id; await p.click(`[data-stagione="${missioni[i].stagione}"]`); await p.locator(`[data-episodio="${e}"] .settore-punto`).click(); await p.waitForTimeout(80);
    const r = await p.evaluate((e) => { const s = document.querySelector(`[data-episodio="${e}"]`), n = s.querySelector('.settore-nome'), d = s.querySelector('.settore-punto'); if (!n) return { senzaNome: true, stato: s.dataset.stato };
      const rg = document.createRange(); rg.selectNodeContents(n); const a = rg.getBoundingClientRect(), b = d.getBoundingClientRect(), m = document.querySelector('.mappa.citta').getBoundingClientRect();
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      const altri = [...document.querySelectorAll('[data-episodio]')].filter((x) => x !== s).map((x) => ({ id: x.dataset.episodio, r: x.querySelector('.settore-punto').getBoundingClientRect() })).filter(({ r }) => Math.min(a.right, r.right) - Math.max(a.left, r.left) > 1 && Math.min(a.bottom, r.bottom) - Math.max(a.top, r.top) > 1).map((x) => x.id);
      return { scrollW: n.scrollWidth, clientW: n.clientWidth, cop: ox > 0 && oy > 0 ? Math.round(100 * Math.min(ox, b.width) * Math.min(oy, b.height) / (b.width * b.height)) : 0, fuoriSx: +(m.left - a.left).toFixed(1), fuoriDx: +(a.right - m.right).toFixed(1), altri, testo: n.textContent, lato: s.className.match(/lato-\w+/)?.[0], stato: s.dataset.stato }; }, e);
    righe.push({ w, h, e, ...r });
  }
  if ([[360, 760], [412, 800]].some(([x, y]) => x === w && y === h)) { /* foto dei peggiori a fine giro */ }
  await ctx.close();
}
await a.chiudi(); writeFileSync(process.env.USCITA ?? '/dev/null', JSON.stringify(righe));
console.log('senza nome acceso:', righe.filter((r) => r.senzaNome).map((r) => `${r.w}×${r.h}:${r.e}`).join(' ') || 'nessuno');
const peggio = righe.filter((r) => !r.senzaNome && (r.cop > 0 || r.fuoriSx > 0.5 || r.fuoriDx > 0.5 || r.altri.length));
console.log('misurati', righe.length, '· difettosi', peggio.length);
for (const r of peggio) console.log(`${r.w}×${r.h} ${r.e} ${r.stato} ${r.lato} «${r.testo}» copre il proprio disco ${r.cop}%${r.fuoriSx > 0.5 ? ` · fuori a sinistra ${r.fuoriSx}px` : ''}${r.fuoriDx > 0.5 ? ` · fuori a destra ${r.fuoriDx}px` : ''}${r.altri.length ? ` · sopra i dischi di ${r.altri.join(',')}` : ''}`);
