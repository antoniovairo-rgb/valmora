// C25-08: a 375×667 l'icona di chi chiama (C22-01) restava a metà sotto il bordo della finestra all'apertura della
// chiamata (33/383 nel C-025). Se un riquadro è tagliato dal fondo della finestra, la pagina scorre quanto basta per
// mostrarlo intero, più un margine; se è già intero, o tutto sotto, non si muove. Rosso C71S01: non si muove mai.
import { spento } from '../interruttori.ts';

/** Di quanti px scorrere (0 = niente) perché il riquadro [alto, basso] (coordinate della finestra) si veda intero. */
export function scorriPerIntero(alto: number, basso: number, finestra: number, margine: number): number {
  if (spento('C71S01') || basso <= finestra || alto >= finestra) return 0;
  return Math.ceil(basso - finestra + margine);
}

/** Posizione verticale nella pagina dall'impaginazione (offsetTop), senza le trasformazioni delle animazioni d'entrata. */
export function altoNellaPagina(el: HTMLElement): number {
  let y = 0;
  for (let e: HTMLElement | null = el; e; e = e.offsetParent as HTMLElement | null) y += e.offsetTop;
  return y;
}
