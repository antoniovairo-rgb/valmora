// Schieramento compatto (S-24, C16-02): ogni ondata dei 36 episodi, ripresa dalla home con uno stato calcolato dal
// motore (giocatore equilibrato), a 360×760: zero scorrimento e la barra in basso non copre niente. e03 ondata 3
// anche a 375×812 e 412×915, con foto (è la schermata della foto del PO).
import { join } from 'node:path';
import { leggiDati } from './dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, iniziaMissione, missioneFinita, rispondi, schiera } from '../src/logica/missione.ts';
import { equilibrata } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import { salvataggioTutti } from './foto-bozze.mjs';

/** Stati all'inizio di ogni ondata, per missione. */
function partenze(dirDati) {
  const dati = leggiDati(dirDati);
  const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
  const v0 = variabiliIniziali(dich.values());
  const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x).sort((a, b) => a.episodio - b.episodio);
  const stati = [];
  for (const m of missioni) {
    const g = equilibrata(creaCaso(1), dich);
    let s = iniziaMissione(m, v0, dich);
    while (!missioneFinita(m, s)) {
      stati.push({ m, n: s.ondata, s });
      s = schiera(m, s, g.schiera(m, s));
      for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, g.scegli(m, s, c), dich);
      s = chiudiOndata(m, s, dich);
    }
  }
  return { missioni, v0, stati };
}

/** Rettangoli di testo e comandi che la barra fissa dello schieramento copre (S-24). */
export const copertiDallaBarra = (pagina) => pagina.evaluate(() => {
  const barra = document.querySelector('[data-barra]');
  if (!barra) return [];
  const b = barra.getBoundingClientRect();
  const inter = (a) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return [...document.querySelectorAll('main button, main a, main [role="status"], main p, main .unita, main .settore-nome, main .pastiglia')]
    .filter((e) => !barra.contains(e) && e.getClientRects().length && inter(e.getBoundingClientRect()) > 1)
    .map((e) => (e.dataset.risorsa ?? e.dataset.azione ?? e.textContent.trim().slice(0, 24)));
});

export async function controllaSchieramenti(browser, url, dirDati, cartella, atteso, rossi = []) {
  // ogni pagina nuova riceve gli stessi interruttori rossi del giro (altrimenti il braccio rosso qui è cieco)
  const nuova = async (o) => { const q = await browser.newPage(o); if (rossi.length) await q.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, rossi); return q; };
  const { missioni, v0, stati } = partenze(dirDati);
  const base = salvataggioTutti(missioni, v0);
  const prova = async (pagina, st, nome, fotografa) => {
    await pagina.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify({ ...base, in_corso: st.s }));
    await pagina.reload();
    await pagina.getByRole('button', { name: 'Riprendi' }).click();
    const ok = await pagina.waitForSelector('[data-barra]', { timeout: 5000 }).then(() => true, () => false);
    if (!ok) { atteso(`${nome}: lo schieramento non si apre`, false); return; }
    await pagina.waitForTimeout(120);
    const [h, alt] = await pagina.evaluate(() => [document.documentElement.scrollHeight, innerHeight]);
    atteso(`${nome}: ${h - alt} px di scorrimento nello schieramento (S-24)`, h <= alt);
    const coperti = await copertiDallaBarra(pagina);
    atteso(`${nome}: la barra in basso copre ${coperti.join(', ')} (S-24, C16-02)`, coperti.length === 0);
    if (fotografa) await pagina.screenshot({ path: join(cartella, `${nome.replace(/[^a-z0-9]+/gi, '-')}.png`) });
  };
  const p = await nuova({ viewport: { width: 360, height: 760 }, reducedMotion: 'reduce' });
  await p.goto(url);
  for (const st of stati) await prova(p, st, `${st.m.id} ondata ${st.n} 360×760`, st.m.id === 'e03' && st.n === 3);
  await p.close();
  const e03 = stati.find((x) => x.m.id === 'e03' && x.n === 3);
  for (const [w, h] of [[375, 812], [412, 915]]) {
    const q = await nuova({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    await q.goto(url);
    if (e03) await prova(q, e03, `e03 ondata 3 ${w}×${h}`, true);
    await q.close();
  }
  return stati.length;
}
