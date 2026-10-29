// Guardiani dei difetti C15 della home (collaudo C-015), chiamati da tools/foto.mjs a 360 px.
/** C15-09: salvataggio e copia di riserva rovinati → la home dice che la partita è persa e come recuperarla. */
export async function controllaSalvataggiPersi(pagina, { atteso, scena }) {
  const [p, r] = await pagina.evaluate(() => [localStorage.getItem('vandelfalls-salvataggio'), localStorage.getItem('vandelfalls-salvataggio-riserva')]);
  await pagina.evaluate(() => { localStorage.setItem('vandelfalls-salvataggio', '{rotto'); localStorage.setItem('vandelfalls-salvataggio-riserva', '{rotta'); });
  await pagina.reload(); await scena('titolo');
  const avviso = (await pagina.locator('[data-persa]').textContent().catch(() => '')) ?? '';
  atteso(`home: salvataggio e riserva rovinati, avviso «${avviso}» (C15-09)`, /rovinat/.test(avviso) && /Importa/.test(avviso));
  await pagina.evaluate(([a, b]) => { if (a) localStorage.setItem('vandelfalls-salvataggio', a); else localStorage.removeItem('vandelfalls-salvataggio'); if (b) localStorage.setItem('vandelfalls-salvataggio-riserva', b); else localStorage.removeItem('vandelfalls-salvataggio-riserva'); }, [p, r]);
  await pagina.reload(); await scena('titolo');
}

/** C15-04: nella sala la disposizione dei nomi è la migliore fra tutte le combinazioni di posizioni (stesso costo di
 *  src/resa/mappa/etichette.ts: nomi col distacco, punti degli altri, bordi). Restituisce l'area sovrapposta fra nomi. */
export async function controllaNomiSala(pagina, atteso, dove) {
  const [ora, meglio, sovrapposti] = await pagina.evaluate(() => {
    const NOMI = ['sotto', 'sopra', 'destra', 'sinistra', 'sotto-sx', 'sotto-dx', 'sopra-sx', 'sopra-dx'], VERA = 100, STACCO = 6, M = 5;
    const g = (e) => { const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; };
    const mp = document.querySelector('.mappa'), m = g(mp), S = [...mp.querySelectorAll('[data-settore]')].filter((s) => s.querySelector('.settore-nome'));
    const area = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    const largo = (r, d) => ({ left: r.left - d, top: r.top - d, right: r.right + d, bottom: r.bottom + d });
    const fuori = (r) => (r.right - r.left) * (r.bottom - r.top) - area(r, { left: m.left + M, top: m.top + M, right: m.right - M, bottom: m.bottom - M });
    const punti = S.map((s) => g(s.querySelector('.settore-punto')));
    const prima = S.map((s) => s.getAttribute('data-nome'));
    const R = S.map((s) => NOMI.map((n) => { s.setAttribute('data-nome', n); return g(s.querySelector('.settore-nome')); }));
    S.forEach((s, i) => s.setAttribute('data-nome', prima[i]));
    const solo = R.map((rs, i) => rs.map((r) => VERA * 10 * fuori(r) + punti.reduce((c, p, j) => c + (j === i ? 0 : VERA * area(r, p)), 0)));
    const coppia = (x, y) => { const v = area(x, y); return VERA * v + area(x, largo(y, STACCO)) - v; };
    const scelte = prima.map((n) => NOMI.indexOf(n));
    const costo = (sc) => sc.reduce((c, k, a) => c + solo[a][k] + sc.slice(0, a).reduce((d, kk, b) => d + coppia(R[a][k], R[b][kk]), 0), 0);
    let best = Infinity; const sc = [];
    const giu = (a, c) => { if (c >= best) return; if (a === S.length) { best = c; return; } for (let k = 0; k < NOMI.length; k++) { let d = solo[a][k]; for (let b = 0; b < a; b++) d += coppia(R[a][k], R[b][sc[b]]); sc[a] = k; giu(a + 1, c + d); } };
    giu(0, 0);
    let sov = 0; for (let a = 0; a < S.length; a++) for (let b = 0; b < a; b++) sov += area(R[a][scelte[a]], R[b][scelte[b]]);
    return [Math.round(costo(scelte)), Math.round(best), Math.round(sov)];
  });
  atteso(`${dove}: nomi dei settori disposti con costo ${ora}, la disposizione migliore costa ${meglio} (C15-04)`, ora <= meglio + 1);
  return sovrapposti;
}
