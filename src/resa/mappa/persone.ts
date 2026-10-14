// C22-03 (collaudo C-022): sulla mappa le persone erano quadratini da 1,3-2,6 px senza contorno, e i colori dei club
// sul viale scuro stavano sotto 3:1 in 7 casi su 14 (i neri sparivano). Ora ogni persona è un disco col colore del
// club dentro un contorno nero, sopra un alone bianco: sul fondo scuro si stacca l'alone, sul chiaro il contorno.
// Misure in px CSS (la scena Pixi è in px CSS). Rosso C56P01: i quadratini di prima.
import { Texture } from 'pixi.js';
import { spento } from '../../interruttori.ts';
import { token } from './sfondo.ts';

/** Lato della persona (contorno compreso) e dell'alone, in px CSS. */
export const MISURE = { corteo: { persona: 6, alone: 8 }, folla: { persona: 6, alone: 8 }, spalti: { persona: 3, alone: 4 } } as const;
export type Gente = keyof typeof MISURE;
/** Alfa minima della persona (gli spalti ondeggiano fra 0,75 e 1; l'alone resta pieno): il guardiano ne tiene conto. */
export const ALFA_MIN: Record<Gente, number> = { corteo: 1, folla: 1, spalti: 0.75 };
/** Raggio del riempimento rispetto al disco: il resto è contorno nero (1,1 px su una persona da 6). */
const DENTRO = 0.62;
const LATO = 64;

let tex: { persona: Texture; alone: Texture } | null = null;
/** Le due texture (bianco = colore della tinta; il nero resta nero con qualsiasi tinta). */
export function texPersone() {
  if (tex) return tex;
  const disco = (dentro?: number) => {
    const c = document.createElement('canvas'); c.width = c.height = LATO; const x = c.getContext('2d')!;
    x.fillStyle = token(dentro ? '--nero' : '--bianco'); x.beginPath(); x.arc(LATO / 2, LATO / 2, LATO / 2, 0, 7); x.fill();
    if (dentro) { x.fillStyle = token('--bianco'); x.beginPath(); x.arc(LATO / 2, LATO / 2, (LATO / 2) * dentro, 0, 7); x.fill(); }
    return Texture.from(c);
  };
  tex = { persona: disco(DENTRO), alone: disco() };
  return tex;
}

/** Come disegnare la gente di quel tipo: texture e scala della persona e dell'alone (null: niente alone, come prima). */
export function gente(tipo: Gente, primaLato: number) {
  if (spento('C56P01')) return { persona: Texture.WHITE, scala: primaLato / Texture.WHITE.width, alone: null, lato: primaLato };
  const t = texPersone(), m = MISURE[tipo];
  return { persona: t.persona, scala: m.persona / LATO, alone: { tex: t.alone, scala: m.alone / LATO }, lato: m.persona };
}
