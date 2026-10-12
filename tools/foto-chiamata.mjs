// Guardiani della mappa durante le chiamate (PO-088, PO-089), chiamati da tools/foto.mjs.
/** PO-088: sulla mappa pulsa SOLO il settore della chiamata in corso («attesi»; nessuno fuori dalle chiamate). */
export async function controllaLampeggio(pagina, atteso, attesi, dove) {
  if ((await pagina.getAttribute('.mappa', 'data-mappa').catch(() => null)) !== 'webgl') return;
  const voluti = [...attesi].sort().join(',');
  let visti = null;
  for (let k = 0; k < 20 && visti !== voluti; k++) { if (k) await pagina.waitForTimeout(50); visti = ((await pagina.getAttribute('.mappa', 'data-lampeggianti')) ?? '').split(',').filter(Boolean).sort().join(','); }
  atteso(`${dove}: pulsano «${visti}», dovrebbe pulsare solo «${voluti}» (PO-088)`, visti === voluti);
}

/** PO-089: nella chiamata la gente si muove dove la chiamata parla (corteo sulla strada, folla altrove); dopo una
 * risposta che impegna squadre, l'unità vola al punto (data-volo, scritto anche quando il volo non si vede). */
export async function controllaDinamica(pagina, atteso, m, c, dove) {
  if (!c.settore || (await pagina.getAttribute('.mappa', 'data-mappa').catch(() => null)) !== 'webgl') return;
  const voluto = `${m.mappa.settori.find((s) => s.id === c.settore)?.tipo === 'strada' ? 'corteo' : 'folla'}:${c.settore}`;
  let visto = null;
  for (let k = 0; k < 20 && visto !== voluto; k++) { if (k) await pagina.waitForTimeout(50); visto = await pagina.getAttribute('.mappa', 'data-dinamica'); }
  atteso(`${dove}: sulla mappa si muove «${visto}» invece di «${voluto}» (PO-089)`, visto === voluto);
}
export async function controllaVoloRisposta(pagina, atteso, c, op, dove) {
  const sq = c.opzioni.find((x) => x.id === op)?.effetti.find((e) => 'riserva' in e && e.valore < 0);
  if (!sq || !c.settore) return;
  const visto = await pagina.evaluate(() => document.documentElement.dataset.volo ?? '');
  atteso(`${dove}: le squadre impegnate non raggiungono il punto («${visto}» invece di «${sq.riserva}>${c.settore}») (PO-089)`, visto === `${sq.riserva}>${c.settore}`);
}
