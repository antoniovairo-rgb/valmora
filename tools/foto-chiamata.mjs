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
  if ((await pagina.getAttribute('.mappa', 'data-mappa').catch(() => null)) === 'webgl') await controllaPersone(pagina, atteso, dove);
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
  // C25-04: si misura il glifo DISEGNATO (unione dei tracciati più il tratto), non il riquadro dell'svg; il contrasto del
  // contorno contro il fondo vero del fumetto; la sovrapposizione contro tutti i testi del messaggio.
  const x = await pagina.evaluate(() => {
    const rgb = (s) => (s.match(/[\d.]+/g) ?? ['0', '0', '0']).slice(0, 3).map(Number);
    const lum = (v) => { const [r, g, b] = v.map((u) => { u /= 255; return u <= 0.03928 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    const rap = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((p, q) => q - p); return (l1 + 0.05) / (l2 + 0.05); };
    const i = document.querySelector('.chiamata-corpo [data-chi-icona]'), g = i?.querySelector('svg');
    const riquadro = document.querySelectorAll('.chiamata-corpo svg.vignetta [data-chi-riquadro]').length;
    if (!i || !g) return { manca: true, riquadro };
    const rs = [...g.querySelectorAll('*')].map((e) => e.getBoundingClientRect()).filter((r) => r.width || r.height);
    const tratto = (parseFloat(getComputedStyle(g).strokeWidth) * g.getBoundingClientRect().width) / 24;
    const w = Math.max(...rs.map((r) => r.right)) - Math.min(...rs.map((r) => r.left)) + tratto, h = Math.max(...rs.map((r) => r.bottom)) - Math.min(...rs.map((r) => r.top)) + tratto;
    const cs = getComputedStyle(i), fondo = rgb(cs.backgroundColor), m = i.closest('.messaggio') ?? document.body;
    let su = m; while (su && !(rgb(getComputedStyle(su).backgroundColor).length && (getComputedStyle(su).backgroundColor.match(/[\d.]+/g)?.[3] ?? '1') !== '0')) su = su.parentElement;
    const fumetto = rgb(getComputedStyle(su ?? document.body).backgroundColor);
    const q = i.getBoundingClientRect(), proprio = (e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    const sopra = [...m.querySelectorAll('*')].filter((e) => !i.contains(e) && proprio(e) && e.getClientRects().length).map((e) => e.getBoundingClientRect())
      .reduce((a, t) => a + Math.max(0, Math.min(q.right, t.right) - Math.max(q.left, t.left)) * Math.max(0, Math.min(q.bottom, t.bottom) - Math.max(q.top, t.top)), 0);
    return { riquadro, w, h, glifo: rap(rgb(getComputedStyle(g).color), fondo), bordo: rap(rgb(cs.borderTopColor), fumetto), sopra };
  });
  atteso(`${dove}: chi chiama è disegnato dentro la vignetta (${x.riquadro} riquadri) o manca l'icona accanto (C22-01)`, !x.manca && !x.riquadro);
  if (x.manca) return;
  atteso(`${dove}: glifo di chi chiama disegnato ${x.w.toFixed(1)}×${x.h.toFixed(1)} px, lato maggiore minimo 24 (C22-01, C25-04)`, Math.max(x.w, x.h) >= 24);
  atteso(`${dove}: contrasto dell'icona di chi chiama: glifo ${x.glifo.toFixed(2)}:1 sul suo fondo, contorno ${x.bordo.toFixed(2)}:1 sul fumetto, minimo 3:1 (C22-01, C25-04)`, x.glifo >= 3 && x.bordo >= 3);
  atteso(`${dove}: l'icona di chi chiama copre ${x.sopra.toFixed(0)} px² di testo (C22-01, C25-04)`, x.sopra === 0);
}
/** C22-03: sulla mappa le persone (spalti, cortei, folla della chiamata) hanno una misura minima, un contorno nero e un
 *  alone bianco: il contorno sta a ≥3:1 sull'alone, e su ogni fondo della mappa almeno uno dei due sta a ≥3:1 (WCAG
 *  1.4.11). Le misure sono quelle con cui Pixi disegna (data-persone, px CSS), non lette dai pixel: la tela WebGL non si
 *  legge senza conservarne il buffer. Rosso VALMORA_ROSSI=C56P01: i quadratini di prima. */
const MINIMO = { spalti: 3, corteo: 6, folla: 6 };
export async function controllaPersone(pagina, atteso, dove) {
  const x = await pagina.evaluate(() => {
    // ogni colore passa dal browser (la build accorcia #111111 in #111): valore del token → rgb calcolato
    const rgb = (n) => { const e = document.createElement('i'); e.style.color = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); document.body.append(e); const c = getComputedStyle(e).color; e.remove(); return c.match(/[\d.]+/g).slice(0, 3).map(Number); };
    const lum = (v) => v.map((u) => { u /= 255; return u <= 0.03928 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4; }).reduce((s, u, i) => s + u * [0.2126, 0.7152, 0.0722][i], 0);
    const rap = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((p, q) => q - p); return (l1 + 0.05) / (l2 + 0.05); };
    const nero = rgb('--nero'), bianco = rgb('--bianco');
    const fondi = ['--mappa-viale', '--mappa-asfalto', '--mappa-gradinata-1', '--mappa-gradinata-2', '--mappa-piazzale'];
    // il contorno con l'alfa minima della persona (data-persone: lato/alone/alfa) sopra l'alone bianco
    const persone = document.querySelector('.mappa')?.dataset.persone ?? '', alfa = Math.min(...persone.split(',').map((p) => Number(p.split('/')[2] ?? 1)));
    const misto = nero.map((c, i) => c * alfa + bianco[i] * (1 - alfa));
    return { persone, anello: rap(misto, bianco), deboli: fondi.filter((n) => Math.max(rap(misto, rgb(n)), rap(bianco, rgb(n))) < 3) };
  });
  if (!x.persone) return;
  const male = x.persone.split(',').map((p) => p.split(/[:/]/).slice(0, 3)).filter(([n, l, a]) => Number(l) < MINIMO[n] || a !== 'alone').map(([n, l, a]) => `${n} ${l} px${a === 'alone' ? '' : ' senza contorno né alone'}`);
  atteso(`${dove}: persone sulla mappa piccole o senza contorno: ${male.join(', ')} (C22-03)`, !male.length);
  atteso(`${dove}: contorno sull'alone ${x.anello.toFixed(2)}:1, fondi senza contrasto: ${x.deboli.join(', ')} (C22-03)`, x.anello >= 3 && !x.deboli.length);
}
