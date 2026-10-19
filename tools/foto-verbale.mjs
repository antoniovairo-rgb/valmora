// Controlli delle foto sul verbale (bilancio D-085, PO-072, PO-074), a parte da foto.mjs che è al limite delle 400 righe.
import { avanzaFino } from './foto-club.mjs';

/** Bilancio del verbale (D-085): 4 sezioni, ≤ 3 scelte per aiuti e pesi, nessuna fuori (C-005 R03), non vuoto (__NO_C10B01). */
export async function controllaBilancio(pagina, p, atteso) {
  const sezioni = await pagina.$$eval('[data-sezione]', (xs) => xs.map((x) => x.dataset.sezione).join(','));
  atteso(`verbale: sezioni del bilancio «${sezioni}», servono aiuti,pesi,scoperti,stelle (D-085)`, sezioni === 'aiuti,pesi,scoperti,stelle');
  const [aiuti, pesi, fuori] = await pagina.evaluate(() => [
    document.querySelectorAll('[data-sezione="aiuti"] [data-scelta]').length, document.querySelectorAll('[data-sezione="pesi"] [data-scelta]').length,
    [...document.querySelectorAll('[data-scelta]')].filter((x) => !x.closest('[data-sezione]')).length]);
  atteso(`verbale: ${fuori} scelte fuori dal bilancio, ${aiuti} aiuti e ${pesi} pesi (massimo 3 l'uno, C-005 R03)`, fuori === 0 && aiuti <= 3 && pesi <= 3);
  if (p.ondate.some((o) => o.risposte.length)) atteso('verbale: partita con scelte ma bilancio vuoto (D-085)', aiuti + pesi >= 1);
  const stella = await pagina.locator('[data-sezione="stelle"] p').first().textContent({ timeout: 2000 }).catch(() => '');
  atteso(`verbale: «per la stella successiva» senza indicazione («${stella}»)`, !!stella?.trim() && !stella.includes('[['));
}

const URL_GIOCO = 'https://antoniovairo-rgb.github.io/valmora/';

/** «Condividi» (testo con episodio e stelle + link; rosso VALMORA_ROSSI=C20C01) e, a episodio superato,
 *  «Prossimo episodio» con la riga che spiega la mappa nell'ultimo passo (rosso VALMORA_ROSSI=C18V01). */
export async function controllaVerbaleAvanti(pagina, piano, atteso, fotoSe) {
  const bottone = pagina.locator('[data-azione="condividi"]');
  atteso('verbale: manca «Condividi» (PO-074)', (await bottone.count()) === 1);
  if (await bottone.count()) {
    await pagina.evaluate(() => { navigator.share = async (d) => { window.__condiviso = d; }; });
    await bottone.evaluate((b) => b.click()); // sta nel primo passo del verbale, anche se ora se ne vede un altro
    const d = await pagina.waitForFunction(() => window.__condiviso, null, { timeout: 3000 }).then((h) => h.jsonValue(), () => null);
    const ep = `Ep. ${String(piano.m.episodio).padStart(2, '0')}`;
    atteso(`verbale: condiviso «${d?.text}» senza «${ep}» o senza ${piano.stelle} stelle piene`, !!d?.text?.includes(ep) && (d.text.match(/★/g) ?? []).length === piano.stelle);
    atteso(`verbale: condiviso senza il link del gioco («${d?.url}»)`, d?.url === URL_GIOCO);
  }
  await avanzaFino(pagina, '[data-azione="prossimo"]', fotoSe); // il pulsante sta nell'ultimo passo
  const prossimo = pagina.locator('[data-azione="prossimo"]');
  atteso('verbale: manca «Prossimo episodio» a episodio superato (PO-072)', (await prossimo.count()) === 1 && await prossimo.isVisible());
  atteso('verbale: manca la riga che spiega la mappa (PO-072)', (await pagina.locator('[data-spiega="mappa"]').count()) === 1);
}

/** «Prossimo episodio» apre la sala dell'episodio dopo; poi si ricarica e «Riprendi» riporta alla città.
 *  Senza il pulsante (rosso) si va alla città dalla mappa, come prima. */
export async function provaProssimo(pagina, piano, atteso, scena, premi) {
  if (!(await pagina.locator('[data-azione="prossimo"]').count())) { await premi('[data-azione="citta"]'); await scena('citta'); return; }
  await premi('[data-azione="prossimo"]'); await scena('sala');
  const dopo = await pagina.getAttribute('.scena[data-scena="sala"]', 'data-missione');
  atteso(`verbale: «Prossimo episodio» apre «${dopo}» invece dell'episodio dopo ${piano.m.id}`, !!dopo && dopo > piano.m.id);
  await pagina.reload(); await scena('titolo');
  await pagina.getByRole('button', { name: 'Riprendi' }).click(); await scena('citta');
}

/** C17-22 (C-018): all'ultimo passo del verbale, su uno schermo basso (667 px) e a inizio pagina, i pulsanti non
 *  stanno sopra nessun testo. Rosso VALMORA_ROSSI=C42V01: pulsanti fissi in basso, come prima. */
export async function controllaVerbaleBasso(pagina, atteso, dove) {
  const finestra = pagina.viewportSize();
  // D-185 (C41-06): a 760 px di altezza, primo passo, la vignetta del verbale perso si vede sempre e la pagina non
  // scorre (ogni episodio, giocatore peggiore). Rossi: C185V01 (spaziature di prima), C185V01,C66V01 (forzata al minimo).
  await pagina.setViewportSize({ width: finestra.width, height: 760 });
  await pagina.evaluate(() => new Promise((ok) => { scrollTo(0, 0); requestAnimationFrame(() => requestAnimationFrame(ok)); })); await pagina.waitForTimeout(100);
  const [nascosta, alta] = await pagina.evaluate(() => [!!document.querySelector('.passo:not([hidden]) svg.vignetta[data-nascosta]'), document.documentElement.scrollHeight]);
  atteso(`${dove} ${finestra.width}×760: vignetta nascosta (D-185)`, !nascosta);
  atteso(`${dove} ${finestra.width}×760: pagina alta ${alta} px, si scorre (D-182)`, alta <= 760);
  await pagina.setViewportSize(finestra);
  await avanzaFino(pagina, '.passi-nav[data-ultimo]', async () => {});
  await pagina.setViewportSize({ width: finestra.width, height: 667 });
  await pagina.evaluate(() => new Promise((ok) => { scrollTo(0, 0); requestAnimationFrame(() => requestAnimationFrame(ok)); })); await pagina.waitForTimeout(100);
  const sopra = await pagina.evaluate(() => {
    const a = (A, B) => Math.max(0, Math.min(A.right, B.right) - Math.max(A.left, B.left)) * Math.max(0, Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top));
    const nav = [...document.querySelectorAll('.passi-nav button')].map((b) => b.getBoundingClientRect());
    const proprio = (e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    return [...document.querySelectorAll('.passo:not([hidden]) *')].filter((e) => proprio(e) && e.getClientRects().length)
      .filter((e) => nav.some((r) => a(r, e.getBoundingClientRect()) > 1)).map((e) => e.textContent.trim().slice(0, 20));
  });
  await pagina.setViewportSize(finestra);
  // si torna al primo passo, dove stanno «Ricomincia» e «Riparti»
  while (await pagina.locator('[data-azione="indietro"]').isVisible().catch(() => false)) await pagina.click('[data-azione="indietro"]');
  atteso(`${dove} ${finestra.width}×667: pulsanti sopra ${sopra.join(', ')} (C17-22)`, sopra.length === 0);
}
