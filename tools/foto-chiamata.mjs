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
/** C22-01: in ogni chiamata non del vice chi chiama è un'icona HTML accanto alla vignetta, non un riquadro disegnato
 *  dentro: glifo misurato a schermo ≥24×24 px, glifo e contorno a ≥3:1 sul fondo dell'icona (WCAG 1.4.11,
 *  https://www.w3.org/TR/WCAG21/#non-text-contrast), senza coprire il testo. Rosso VALMORA_ROSSI=C54C01. */
export async function controllaChiIcona(pagina, atteso, c, dove) {
  if (c.fonte === 'vice') return;
  const x = await pagina.evaluate(() => {
    const rgb = (s) => (s.match(/[\d.]+/g) ?? ['0', '0', '0']).slice(0, 3).map(Number);
    const lum = (v) => { const [r, g, b] = v.map((u) => { u /= 255; return u <= 0.03928 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    const rap = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((p, q) => q - p); return (l1 + 0.05) / (l2 + 0.05); };
    const i = document.querySelector('.chiamata-corpo [data-chi-icona]'), g = i?.querySelector('svg');
    const riquadro = document.querySelectorAll('.chiamata-corpo svg.vignetta [data-chi-riquadro]').length;
    if (!i || !g) return { manca: true, riquadro };
    const r = g.getBoundingClientRect(), cs = getComputedStyle(i), fondo = rgb(cs.backgroundColor), t = document.querySelector('.chiamata-corpo .testo-radio')?.getBoundingClientRect();
    const q = i.getBoundingClientRect(), sopra = t ? Math.max(0, Math.min(q.right, t.right) - Math.max(q.left, t.left)) * Math.max(0, Math.min(q.bottom, t.bottom) - Math.max(q.top, t.top)) : 0;
    return { riquadro, w: r.width, h: r.height, glifo: rap(rgb(getComputedStyle(g).color), fondo), bordo: rap(rgb(cs.borderTopColor), fondo), sopra, chi: i.dataset.chiIcona };
  });
  atteso(`${dove}: chi chiama è disegnato dentro la vignetta (${x.riquadro} riquadri) o manca l'icona accanto (C22-01)`, !x.manca && !x.riquadro);
  if (x.manca) return;
  atteso(`${dove}: glifo di chi chiama ${x.w.toFixed(1)}×${x.h.toFixed(1)} px, minimo 24×24 (C22-01)`, x.w >= 24 && x.h >= 24);
  atteso(`${dove}: contrasto dell'icona di chi chiama: glifo ${x.glifo.toFixed(2)}:1, contorno ${x.bordo.toFixed(2)}:1, minimo 3:1 (C22-01)`, x.glifo >= 3 && x.bordo >= 3);
  atteso(`${dove}: l'icona di chi chiama copre ${x.sopra.toFixed(0)} px² del testo (C22-01)`, x.sopra === 0);
}
