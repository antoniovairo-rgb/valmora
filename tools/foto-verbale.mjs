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
