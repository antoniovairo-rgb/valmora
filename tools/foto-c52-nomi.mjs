// C52-03 (D-242, dentro l'idea A di D-241): a 412 di larghezza il nome dell'episodio scelto sulla mappa della città usciva
// dal bordo (e12 di 29 px) o copriva il proprio disco (e13): il riquadro stretto da etichette.ts era più stretto della
// parola più lunga e il testo ne usciva senza che la misura lo vedesse. Qui si misura il TESTO (Range), non il riquadro:
// per ognuno dei 36 episodi scelti, dentro la mappa con margine ≥ 0 e fuori dal disco visibile del proprio episodio.
// Solo dove il nome si vede (--citta-nome-da, D-123: da 412). Rosso CSS C241N01: il riquadro può stringersi sotto la parola.
import { join } from 'node:path';
import { missioniDai, salvataggioTutti } from './foto-bozze.mjs';

export const ALTEZZE_C52 = [760, 800, 915];
const { missioni, v0 } = missioniDai('data'), tutto = JSON.stringify(salvataggioTutti(missioni, v0));

const misura = (p) => p.evaluate(() => {
  const n = document.querySelector('.mappa.citta [data-episodio].acceso .settore-nome'); if (!n) return null;
  const rg = document.createRange(); rg.selectNodeContents(n);
  const rs = [...rg.getClientRects()].filter((r) => r.width > 0 && r.height > 0); if (!rs.length) return null;
  const t = { left: Math.min(...rs.map((r) => r.left)), right: Math.max(...rs.map((r) => r.right)), top: Math.min(...rs.map((r) => r.top)), bottom: Math.max(...rs.map((r) => r.bottom)) };
  const m = n.closest('.mappa').getBoundingClientRect(), b = n.closest('[data-episodio]').querySelector('.settore-punto').getBoundingClientRect();
  const d = { left: b.left + b.width * 0.22, right: b.right - b.width * 0.22, top: b.top + b.height * 0.22, bottom: b.bottom - b.height * 0.22 }; // il disco visibile (::after, inset 22%)
  const fuori = Math.max(m.left - t.left, t.right - m.right, m.top - t.top, t.bottom - m.bottom, 0);
  // area del disco coperta dalle righe del testo (righe vere, non il loro riquadro unico)
  const copre = rs.reduce((a, r) => a + Math.max(0, Math.min(r.right, d.right) - Math.max(r.left, d.left)) * Math.max(0, Math.min(r.bottom, d.bottom) - Math.max(r.top, d.top)), 0);
  return { fuori: Math.round(fuori * 10) / 10, copre: Math.round(copre), testo: n.textContent };
});

/** Problemi alla larghezza data (solo se lì il nome si vede), alle altezze di ALTEZZE_C52. */
export async function controllaNomiCitta(browser, url, larghezza, rossi = [], cartella = '') {
  const male = [], ris = [];
  for (const h of ALTEZZE_C52) {
    const vp = `${larghezza}x${h}`, p = await browser.newPage({ viewport: { width: larghezza, height: h }, reducedMotion: 'reduce' });
    if (rossi.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, rossi);
    await p.goto(url); await p.evaluate((v) => localStorage.setItem('vandelfalls-salvataggio', v), tutto); await p.reload();
    await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('.scena[data-scena="citta"]'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    for (const m of missioni) {
      await p.click(`[data-stagione="${m.stagione}"]`).catch(() => {}); await p.click(`[data-episodio="${m.id}"] .settore-punto`, { timeout: 5000 }).catch(() => male.push(`${vp}: non trovo ${m.id} (C52-03)`));
      await p.waitForTimeout(150);
      const x = await misura(p); if (!x) continue; // a questa larghezza il nome non c'è (D-123)
      ris.push({ vp, ep: m.id, ...x });
      if (x.fuori > 0.5 || x.copre > 0) { male.push(`${vp} città ${m.id}: il nome «${x.testo}» ${x.fuori > 0.5 ? `esce di ${x.fuori} px dalla mappa` : ''}${x.fuori > 0.5 && x.copre ? ' e ' : ''}${x.copre ? `copre ${x.copre} px² del suo disco` : ''} (C52-03)`);
        if (cartella) await p.screenshot({ path: join(cartella, `${vp}-c52-nome-${m.id}.png`) }); }
    }
    await p.close();
  }
  return { ris, male };
}
