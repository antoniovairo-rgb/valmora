// D-187 (PO-052, PO-058): nelle schermate di gioco la mappa si abbassa quanto basta perché la pagina non scorra, fino a
// --mappa-altezza-min (sotto, i settori non si leggono più); la tela segue il contenitore (C28-01). La chiamata no: D-114
// vuole la mappa intera e accetta lo scorrimento. Le vignette nascondibili (D-126 d) cedono per prime: nel conto valgono
// come nascoste, così si nascondono loro (useRiempi) e la mappa si abbassa solo per il resto; quelle che si riempiono
// (PO-092) valgono al loro minimo. Rosso C187M01: altezza dalla sola proporzione, come prima.
import { useLayoutEffect, type RefObject } from 'react';
import { spento } from '../../interruttori.ts';

const ESCLUSE = new Set(['chiamata']);
const NASCONDIBILE = /^(apertura|esito|ondata)-/;

let ridisponi: (m: HTMLElement) => void = () => {};

function adatta(m: HTMLElement) {
  const main = m.closest('main');
  m.removeAttribute('data-adatta'); m.style.removeProperty('--mappa-alta');
  if (spento('C187M01') || !main || ESCLUSE.has(main.dataset.schermata ?? '')) return;
  let ecc = (document.scrollingElement ?? document.documentElement).scrollHeight - innerHeight;
  if (ecc <= 0) return;
  for (const v of main.querySelectorAll<SVGSVGElement>('svg.vignetta')) {
    const r = v.getBoundingClientRect(), cs = getComputedStyle(v);
    if (!r.height || cs.display === 'none') continue;
    if (NASCONDIBILE.test(v.dataset.vignetta ?? '')) ecc -= r.height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
    else if (v.style.height) ecc -= r.height - (parseFloat(cs.minHeight) || 0);
  }
  if (ecc <= 0) return;
  const min = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mappa-altezza-min')) || 0;
  const nat = m.getBoundingClientRect().height;
  let alta = Math.max(min, nat - ecc);
  // S-21: il pulsante «Home» nell'angolo non deve coprire punti o nomi dei settori (CI rossa a 375: il rapporto abbassato
  // portava la curva sotto la casa). Si rialza di un passo finché non li tocca, al più fino all'altezza naturale.
  const casa = m.querySelector(':scope > .tasto-home'), passo = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--spazio-2')) || 8;
  const tocca = () => { if (!casa) return false; ridisponi(m); const h = casa.getBoundingClientRect();
    return [...m.querySelectorAll('.settore-punto, .settore-nome')].some((e) => { const r = e.getBoundingClientRect(); return Math.min(h.right, r.right) - Math.max(h.left, r.left) > 2 && Math.min(h.bottom, r.bottom) - Math.max(h.top, r.top) > 2; }); };
  for (;;) {
    m.style.setProperty('--mappa-alta', `${Math.round(alta)}px`); m.setAttribute('data-adatta', '');
    if (alta >= nat || !tocca()) break;
    alta = Math.min(nat, alta + passo);
  }
  if (alta >= nat) { m.removeAttribute('data-adatta'); m.style.removeProperty('--mappa-alta'); ridisponi(m); }
}

/** Si rifà quando la pagina cambia (passi, testi, caratteri) e quando cambia la finestra. */
export function useAdatta(el: RefObject<HTMLDivElement | null>, disponi: (m: HTMLElement) => void) {
  ridisponi = disponi;
  useLayoutEffect(() => {
    const m = el.current, main = m?.closest('main');
    if (!m || !main) return;
    let ultimo = '';
    const fai = () => adatta(m);
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => { const ora = `${innerHeight}:${Math.round(main.getBoundingClientRect().height)}`; if (ora !== ultimo) { ultimo = ora; fai(); } });
    fai(); ro?.observe(main);
    addEventListener('resize', fai); void document.fonts?.ready.then(fai);
    return () => { ro?.disconnect(); removeEventListener('resize', fai); };
  }, [el]);
}
