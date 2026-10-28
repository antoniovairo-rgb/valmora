// C52-01/02 (D-242): la striscia della città prende lo spazio libero (PO-149) come se sotto la mappa ci fosse il blocco più
// alto possibile (scheda di un episodio in qualsiasi stato, o invito, più «Rileggi l'epilogo»): così la mappa non si sposta
// quando cambi episodio, stagione o salvataggio (prima saltava fino a 110 px). Le varianti si misurano in un contenitore
// dentro la scena, creato e tolto nella stessa chiamata: non le vede né il giocatore né gli strumenti. Il massimo dipende
// solo dalla larghezza (i dati non cambiano mentre si gioca) e si tiene solo coi caratteri caricati. Rosso C242M01 (Citta.tsx): conta la scheda di adesso.
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const massimi = new Map<number, number>();
const px = (e: Element, k: 'marginTop' | 'marginBottom' | 'paddingLeft' | 'paddingRight') => parseFloat(getComputedStyle(e)[k]) || 0;

/** Quanto in più del blocco di adesso occupa il blocco più alto (px, ≥ 0). */
export function riservaCitta(varianti: () => ReactElement[]): number {
  const mappa = document.querySelector('.scena .mappa.citta'), scena = mappa?.parentElement;
  if (!mappa || !scena) return 0;
  const dopo: Element[] = [];
  for (let e = mappa.nextElementSibling; e; e = e.nextElementSibling) dopo.push(e);
  const primo = dopo[0], ultimo = dopo.at(-1);
  if (!primo || !ultimo) return 0;
  // dal bordo sotto della mappa al margine sotto dell'ultimo: il margine sopra del primo si fonde con quello della mappa
  const ora = ultimo.getBoundingClientRect().bottom + px(ultimo, 'marginBottom') - mappa.getBoundingClientRect().bottom, sottoMappa = px(mappa, 'marginBottom');
  const largo = scena.clientWidth - px(scena, 'paddingLeft') - px(scena, 'paddingRight');
  let max = massimi.get(largo);
  if (max === undefined) {
    const box = document.createElement('div');
    box.setAttribute('aria-hidden', 'true');
    box.style.cssText = `position: absolute; left: 0; top: 0; width: ${largo}px; visibility: hidden; pointer-events: none`;
    box.innerHTML = varianti().map((v) => `<div style="display: flow-root">${renderToStaticMarkup(v)}</div>`).join('');
    scena.appendChild(box);
    // come nella pagina (stile-home.css, PO-149): l'ultimo elemento della scena non ha margine sotto
    for (const w of box.children) (w.lastElementChild as HTMLElement | null)?.style.setProperty('margin-bottom', '0');
    // l'altezza del contenitore flow-root conta tutto il margine sopra del primo; nella pagina vale il più grande fra quello e
    // il margine sotto della mappa (si fondono: l'invito e la scheda non hanno lo stesso margine)
    max = Math.max(...[...box.children].map((w) => { const m = w.firstElementChild ? px(w.firstElementChild, 'marginTop') : 0; return w.getBoundingClientRect().height - m + Math.max(m, sottoMappa); }));
    box.remove();
    if (document.fonts?.status !== 'loading') massimi.set(largo, max); // coi caratteri ancora in arrivo la misura non vale: si rifà
  }
  return Math.max(0, max - ora);
}
