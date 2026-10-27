// C-052: foto di riferimento della città (stato del PO: episodi 1-18 conclusi, scelto e19 da giocare) e casi limite.
import { avvia, apriCitta, salvTutti, salvNessuno, missioni } from './lib.mjs';
const D = process.argv[2]; const a = await avvia();
const primi = (n) => { const s = salvTutti(); const fuori = missioni.slice(n).map((m) => m.id); for (const id of fuori) delete s.episodi[id]; s.missioni_concluse = s.missioni_concluse.filter((x) => !fuori.includes(x)); return s; };
const ZOOM = `:root { --testo-mini: 15.6px; --testo-piccolo: 16.9px; --testo-base: 20.8px; --testo-grande: 26px; --testo-titolo: 33.8px; --testo-numero: 44.2px; }`;
const casi = [
  ['po18-e19', primi(18), 412, 915, 2, 'e19'], ['po18-e19', primi(18), 360, 760, 2, 'e19'], ['po18-e19', primi(18), 412, 800, 2, 'e19'], ['po18-e19', primi(18), 375, 667, 2, 'e19'], ['po18-e19', primi(18), 360, 640, 2, 'e19'],
  ['tutti-e01', salvTutti(), 360, 760, 1, 'e01'], ['tutti-e01', salvTutti(), 412, 915, 1, 'e01'], ['nessuno-e01', salvNessuno(), 412, 915, 1, 'e01'],
  ['zoom130-parz-e04', primi(8), 360, 760, 1, 'e04', ZOOM], ['zoom130-nessuno-e01', salvNessuno(), 412, 760, 1, 'e01', ZOOM],
];
for (const [nome, sal, w, h, s, e, css] of casi) {
  const { ctx, p } = await apriCitta(a.browser, a.url, w, h, sal); if (css) await p.addStyleTag({ content: css });
  await p.click(`[data-stagione="${s}"]`); await p.waitForTimeout(150); await p.locator(`[data-episodio="${e}"] .settore-punto`).click(); await p.waitForTimeout(250);
  await p.screenshot({ path: `${D}/${nome}-${w}x${h}.jpg`, type: 'jpeg', quality: 70 }); await ctx.close();
}
await a.chiudi();
