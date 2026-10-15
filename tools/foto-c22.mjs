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

/** C22-09: nella chiamata l'avatar del mittente ha la stessa icona di chi chiama accanto alla vignetta (stesso disegno
 *  SVG). Rosso VALMORA_ROSSI=C59A01: l'avatar dalla regola di prima (icone.tsx). */
export async function controllaAvatarChi(pagina, atteso, dove) {
  const [avatar, chi] = await pagina.evaluate(() => [document.querySelector('[data-messaggio^="chiamata-"] .avatar svg'), document.querySelector('.chiamata-corpo [data-chi-icona] svg')].map((s) => s?.innerHTML ?? null));
  if (!chi) return; // il vice non ha l'icona accanto alla vignetta
  atteso(`${dove}: l'avatar del mittente ha un'icona diversa da quella di chi chiama accanto alla vignetta (C22-09)`, avatar === chi);
}

/** C22-10: le icone dei pulsanti misurano a schermo almeno 20×20 px (Material: 20 dp minimo,
 *  https://m3.material.io/styles/icons/designing-icons). Pastiglie ed effetti hanno la loro misura (C22-05).
 *  Rosso VALMORA_ROSSI=C60I01: 18 px come prima. */
export async function controllaIconePulsanti(pagina, atteso, dove) {
  const piccole = await pagina.evaluate(() => [...document.querySelectorAll('button .icona, .pulsante .icona')].filter((i) => i.getClientRects().length && !i.closest('.pastiglia, .effetto-chip'))
    .map((i) => i.getBoundingClientRect()).filter((r) => r.width < 20 || r.height < 20).map((r) => `${r.width.toFixed(1)}×${r.height.toFixed(1)}`));
  atteso(`${dove}: ${piccole.length} icone di pulsanti sotto 20 px: ${[...new Set(piccole)].slice(0, 3).join(', ')} (C22-10)`, !piccole.length);
}

/** S-23, PO-078: la vignetta di sala («apertura-») e del verbale («esito-»). */
export async function controllaVignetta(pagina, prefisso, atteso, dove) {
  // D-126 d (C22-04): sala e verbale nascondono la vignetta se lo spazio libero non arriva al minimo; nascosta solo
  // allora, e mai al minimo con la pagina che scorre (prova anche a 375×667). Rosso VALMORA_ROSSI=C66V01: resta al minimo.
  const misura = () => pagina.evaluate((pre) => {
    const v = document.querySelector(`[data-vignetta^="${pre}"]`); if (!v) return null;
    const main = v.closest('main') ?? document.body, app = main.parentElement ?? document.body, px = (e, k) => parseFloat(getComputedStyle(e)[k]) || 0;
    const fondo = main.getBoundingClientRect().bottom + scrollY + px(main, 'marginBottom') + px(app, 'paddingBottom') + (app === document.body ? 0 : px(document.body, 'paddingBottom'));
    const libero = innerHeight - fondo - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--vignetta-margine')) || 0);
    return { nascosta: v.hasAttribute('data-nascosta'), vista: v.getClientRects().length > 0, h: v.getBoundingClientRect().height, min: parseFloat(getComputedStyle(v).minHeight) || 0, libero, margini: Number(v.dataset.margini) || 0 };
  }, prefisso);
  const giudica = (r, qui) => {
    atteso(`${qui}: manca la vignetta «${prefisso}…» (S-23, PO-078)`, !!r && (r.vista || r.nascosta));
    if (!r) return;
    if (r.nascosta) atteso(`${qui}: vignetta «${prefisso}…» nascosta con ${(r.libero - r.margini).toFixed(0)} px liberi, minimo ${r.min} (D-126 d)`, r.libero - r.margini < r.min);
    else atteso(`${qui}: vignetta «${prefisso}…» alta ${r.h.toFixed(0)} px (minimo ${r.min}) con la pagina che scorre di ${(-r.libero).toFixed(0)} px: va nascosta (D-126 d)`, r.h >= r.min - 0.5 && r.libero > -1);
  };
  giudica(await misura(), dove);
  if (!/^(apertura|esito)-/.test(prefisso)) return;
  const prima = pagina.viewportSize();
  await pagina.setViewportSize({ width: 375, height: 667 }); await pagina.waitForTimeout(250);
  giudica(await misura(), `${dove} a 375×667`);
  await pagina.setViewportSize(prima); await pagina.waitForTimeout(150);
}
