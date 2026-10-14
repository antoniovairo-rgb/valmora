// Guardiani del collaudo C-022 (grafica piccola), chiamati dagli altri guardiani del giro foto.

/** C22-06: in ogni stemma visibile il simbolo (o le iniziali) sta a ≥3:1 sulla forma; se no ha un contorno che sta a
 *  ≥3:1 sia sulla forma sia sul simbolo (WCAG 1.4.11, https://www.w3.org/TR/WCAG21/#non-text-contrast).
 *  Rosso VALMORA_ROSSI=C57S01: nessun contorno. */
export async function controllaStemmi(pagina, atteso, dove) {
  const deboli = await pagina.evaluate(() => {
    const rgb = (s) => (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const lum = (v) => v.map((u) => { u /= 255; return u <= 0.03928 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4; }).reduce((s, u, i) => s + u * [0.2126, 0.7152, 0.0722][i], 0);
    const rap = (a, b) => { const [l1, l2] = [lum(rgb(a)), lum(rgb(b))].sort((p, q) => q - p); return (l1 + 0.05) / (l2 + 0.05); };
    return [...document.querySelectorAll('svg.stemma')].filter((s) => s.getClientRects().length).flatMap((s) => {
      const forma = s.querySelector('.stemma-forma > *'), segno = s.querySelector('[data-simbolo] > *');
      if (!forma || !segno || !/^rgb/.test(getComputedStyle(forma).fill)) return [];
      const f = getComputedStyle(forma).fill, g = getComputedStyle(segno).fill;
      if (rap(f, g) >= 3) return [];
      const a = s.querySelector('[data-alone-stemma] > *'), c = a && getComputedStyle(a).fill;
      return c && rap(c, f) >= 3 && rap(c, g) >= 3 ? [] : [`${s.dataset.stemma} simbolo ${rap(f, g).toFixed(2)}:1${c ? `, contorno ${rap(c, f).toFixed(2)}:1` : ', senza contorno'}`];
    });
  });
  atteso(`${dove}: stemmi col simbolo poco visibile: ${[...new Set(deboli)].join('; ')} (C22-06)`, !deboli.length);
}

/** C22-05: le icone nelle pastiglie e negli effetti sotto le opzioni misurano a schermo almeno 16×16 px (metro del
 *  C-022: sotto 16 px è un difetto medio). Rosso VALMORA_ROSSI=C58I01: 13 e 12 px, come prima. */
export async function controllaIconePiccole(pagina, atteso, dove) {
  const piccole = await pagina.evaluate(() => [...document.querySelectorAll('.pastiglia .icona, .effetto-chip .icona')].filter((i) => i.getClientRects().length)
    .map((i) => [i.closest('.pastiglia') ? 'pastiglia' : 'effetto', i.getBoundingClientRect()]).filter(([, r]) => r.width < 16 || r.height < 16).map(([k, r]) => `${k} ${r.width.toFixed(1)}×${r.height.toFixed(1)}`));
  atteso(`${dove}: ${piccole.length} icone sotto 16 px: ${[...new Set(piccole)].slice(0, 4).join(', ')} (C22-05)`, !piccole.length);
}
