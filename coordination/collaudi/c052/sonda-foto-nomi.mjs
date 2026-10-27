// C-052: foto della mappa con l'episodio «da giocare» scelto, per i nomi che escono dal riquadro (412×800 e 412×915).
import { avvia, apriCitta, salvTutti, missioni } from './lib.mjs';
const primi = (n) => { const s = salvTutti(); const fuori = missioni.slice(n).map((m) => m.id); for (const id of fuori) delete s.episodi[id]; s.missioni_concluse = s.missioni_concluse.filter((x) => !fuori.includes(x)); return s; };
const D = process.argv[2]; const a = await avvia();
for (const e of ['e13', 'e12', 'e09', 'e16']) { const i = missioni.findIndex((m) => m.id === e);
  const { ctx, p } = await apriCitta(a.browser, a.url, 412, 800, primi(i)); await p.click(`[data-stagione="${missioni[i].stagione}"]`); await p.locator(`[data-episodio="${e}"] .settore-punto`).click(); await p.waitForTimeout(500);
  await p.locator('.mappa.citta').screenshot({ path: `${D}/nome-${e}-412x800.jpg`, type: 'jpeg', quality: 75 }); await ctx.close(); }
await a.chiudi();
