// D-187 (PO-052, PO-058): nelle schermate di gioco la mappa si abbassa quanto basta perché la pagina non scorra, fino a
// --mappa-altezza-min (sotto, i settori non si leggono più); la tela segue il contenitore (C28-01). La chiamata no: D-114
// vuole la mappa intera e accetta lo scorrimento. Le vignette nascondibili (D-126 d) cedono per prime: nel conto valgono
// come nascoste, così si nascondono loro (useRiempi) e la mappa si abbassa solo per il resto; quelle che si riempiono
// (PO-092) valgono al loro minimo. Rosso C187M01: altezza dalla sola proporzione, come prima.
import { useLayoutEffect, type RefObject } from 'react';
import { spento } from '../../interruttori.ts';

const ESCLUSE = new Set(['chiamata']);
// D-191: dove la mappa non si tocca (risposta, sala, briefing) può scendere fino a --mappa-altezza-min-lettura (160 px).
// Rosso C191L01: il minimo di sempre.
const LETTURA = new Set(['risposta', 'sala', 'briefing']);
// D-191: nel rapporto, se la pagina scorre anche con la mappa al minimo, la mappa non si mostra (resta la scheda dei
// settori, che dice lo stato di ognuno) e «Home» passa nella testata. Rosso C191R01: la mappa resta.
const SENZA_MAPPA = new Set(['rapporto']);
const NASCONDIBILE = /^(apertura|esito|ondata)-/;

let avvisa: (nascosta: boolean) => void = () => {};
let ridisponi: (m: HTMLElement) => void = () => {};

function adatta(m: HTMLElement) {
  const main = m.closest('main');
  const era = m.hasAttribute('data-nascosta');
  m.removeAttribute('data-adatta'); m.removeAttribute('data-nascosta'); m.style.removeProperty('--mappa-alta');
  const schermata = main?.dataset.schermata ?? '';
  const fine = (nascosta: boolean) => { if (nascosta) m.setAttribute('data-nascosta', ''); if (nascosta !== era) avvisa(nascosta); };
  if (spento('C187M01') || !main || ESCLUSE.has(schermata)) return fine(false);
  // eccedenza della pagina, con le vignette nascondibili come nascoste e quelle che si riempiono al loro minimo
  const eccedenza = () => {
    let e = (document.scrollingElement ?? document.documentElement).scrollHeight - innerHeight;
    if (e <= 0) return e;
    for (const v of main.querySelectorAll<SVGSVGElement>('svg.vignetta')) {
      const r = v.getBoundingClientRect(), cs = getComputedStyle(v);
      if (!r.height || cs.display === 'none') continue;
      if (NASCONDIBILE.test(v.dataset.vignetta ?? '')) e -= r.height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
      else if (v.style.height) e -= r.height - (parseFloat(cs.minHeight) || 0);
    }
    return e;
  };
  let ecc = eccedenza();
  if (ecc <= 0) return fine(false);
  const radice = getComputedStyle(document.documentElement);
  const min = parseFloat(radice.getPropertyValue(LETTURA.has(schermata) && !spento('C191L01') ? '--mappa-altezza-min-lettura' : '--mappa-altezza-min')) || 0;
  const nat = m.getBoundingClientRect().height;
  let alta = Math.max(min, nat - ecc);
  // S-21: il pulsante «Home» nell'angolo non deve coprire punti e nomi dei settori (CI rossa a 375: il rapporto abbassato portava
  // la curva sotto la casa). Si rialza di un passo finché non li tocca, al più fino all'altezza naturale. Solo i punti
  // (fermi) e, quando sono liberi, i nomi appena ridisposti: la ridisposizione costa, si fa solo lì (a ogni passo rallentava
  // ogni disegno; IPOTESI: in CI a 375 i segni della risposta, 1,8 s, sparivano prima del controllo PO-085).
  const casa = m.querySelector(':scope > .tasto-home'), passo = parseFloat(radice.getPropertyValue('--spazio-2')) || 8;
  const sotto = (sel: string) => { if (!casa) return false; const h = casa.getBoundingClientRect();
    return [...m.querySelectorAll(sel)].some((e) => { const r = e.getBoundingClientRect(); return Math.max(0, Math.min(h.right, r.right) - Math.max(h.left, r.left)) * Math.max(0, Math.min(h.bottom, r.bottom) - Math.max(h.top, r.top)) > 4; }); }; // come S-21 (px²)
  // prima i punti (fermi); i nomi si ridispongono e si controllano solo quando i punti sono liberi
  for (;;) {
    m.style.setProperty('--mappa-alta', `${Math.round(alta)}px`); m.setAttribute('data-adatta', '');
    if (alta >= nat) break;
    if (!sotto('.settore-punto')) { ridisponi(m); if (!sotto('.settore-nome')) break; }
    alta = Math.min(nat, alta + passo);
  }
  if (alta >= nat) { m.removeAttribute('data-adatta'); m.style.removeProperty('--mappa-alta'); ridisponi(m); }
  fine(SENZA_MAPPA.has(schermata) && !spento('C191R01') && eccedenza() > 0);
}

/** Si rifà quando la pagina cambia (passi, testi, caratteri) e quando cambia la finestra. */
export function useAdatta(el: RefObject<HTMLDivElement | null>, disponi: (m: HTMLElement) => void, nascosta?: (si: boolean) => void) {
  ridisponi = disponi; avvisa = nascosta ?? (() => {});
  useLayoutEffect(() => {
    const m = el.current, main = m?.closest('main');
    if (!m || !main) return;
    let ultimo = '';
    const fai = () => adatta(m);
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => { const ora = `${innerHeight}:${Math.round(main.getBoundingClientRect().height)}`; if (ora !== ultimo) { ultimo = ora; fai(); } });
    fai(); ro?.observe(main);
    addEventListener('resize', fai); void document.fonts?.ready.then(fai);
    return () => { ro?.disconnect(); removeEventListener('resize', fai); avvisa(false); };
  }, [el]);
}
