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
export async function controllaDinamica(pagina, atteso, m, c, dove, ondata, club) {
  if (!c.settore || (await pagina.getAttribute('.mappa', 'data-mappa').catch(() => null)) !== 'webgl') return;
  const voluto = `${m.mappa.settori.find((s) => s.id === c.settore)?.tipo === 'strada' ? 'corteo' : 'folla'}:${c.settore}`;
  let visto = null;
  for (let k = 0; k < 20 && visto !== voluto; k++) { if (k) await pagina.waitForTimeout(50); visto = await pagina.getAttribute('.mappa', 'data-dinamica'); }
  atteso(`${dove}: sulla mappa si muove «${visto}» invece di «${voluto}» (PO-089)`, visto === voluto);
  // C23-01: il corteo della chiamata ha i colori del club che i dati mettono lì: club dell'evento dell'ondata, poi della
  // strada, poi della curva omonima, altrimenti neutro. Rosso VALMORA_ROSSI=C53D01: il club dell'evento si perde.
  if (!ondata || !club || !voluto.startsWith('corteo:')) return;
  const s = m.mappa.settori.find((x) => x.id === c.settore);
  const curva = m.mappa.settori.find((x) => x.tipo === 'curva' && x.id === `curva_${c.settore.replace(/^[a-z]+_/, '')}`);
  const di = (ondata.eventi ?? []).find((e) => e.settore === c.settore && e.club)?.club ?? s?.club ?? curva?.club;
  const atteso_ = di ? club[di]?.colori?.primario ?? 'neutro' : 'neutro';
  const colori = await pagina.getAttribute('.mappa', 'data-dinamica-colori');
  atteso(`${dove}: il corteo della chiamata ha i colori «${colori}», i dati dicono «${di ?? 'non si sa'}» (${atteso_}) (C23-01)`, colori === atteso_);
}
export async function controllaVoloRisposta(pagina, atteso, c, op, dove) {
  const sq = c.opzioni.find((x) => x.id === op)?.effetti.find((e) => 'riserva' in e && e.valore < 0);
  if (!sq || !c.settore) return;
  const visto = await pagina.evaluate(() => document.documentElement.dataset.volo ?? '');
  atteso(`${dove}: le squadre impegnate non raggiungono il punto («${visto}» invece di «${sq.riserva}>${c.settore}») (PO-089)`, visto === `${sq.riserva}>${c.settore}`);
}
