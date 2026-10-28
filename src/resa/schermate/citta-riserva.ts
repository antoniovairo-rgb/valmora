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
  if (!mappa || !(scena instanceof HTMLElement)) return 0;
  // la scena entra scalata e ruotata (Scena.tsx): misurata così, la riserva usciva sbagliata e restava (28/10: in tutti36 la mappa
  // 12 px più su che negli altri stati). Si misura senza trasformazione, tolta e rimessa uguale nella stessa chiamata (nessun disegno)
  const trasformata = scena.style.transform;
  scena.style.transform = 'none';
  try { return misura(varianti, mappa, scena); } finally { scena.style.transform = trasformata; }
}

function misura(varianti: () => ReactElement[], mappa: Element, scena: HTMLElement): number {
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
    // le varianti possono usare un carattere che la pagina non ha ancora chiesto (titoli h2 con l'invito: 28/10, 375×915, mappa 18 px
    // più giù): la misura vale solo se tutti i loro caratteri sono pronti; altrimenti si chiedono e, arrivati, useRiempi rifà il conto
    // («loadingdone»)
    const pronto = (f: string) => { try { return document.fonts?.check?.(f) ?? true; } catch { return true; } }; // «font» può essere vuoto: si salta
    const caratteri = [...new Set([...box.querySelectorAll('*')].map((e) => getComputedStyle(e).font))].filter((f) => f && !pronto(f));
    box.remove();
    if (!caratteri.length) massimi.set(largo, max);
    else for (const f of caratteri) void document.fonts?.load?.(f);
  }
  return Math.max(0, max - ora);
}
