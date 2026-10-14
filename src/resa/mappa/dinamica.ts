// Dinamica della chiamata sulla mappa (PO-089): quando una chiamata parla di un settore, lì si vede gente che si
// muove. Se il settore è una strada col suo viale, un corteo la percorre (verso lo stadio prima della partita, via
// dallo stadio dopo); altrimenti la folla si raduna e gira attorno al punto. Solo decorazione: nessun dato nuovo,
// solo chiamata.settore e il tipo del settore. Rosso C32D01: niente dinamica, come prima.
import { Container, Sprite } from 'pixi.js';
import { spento } from '../../interruttori.ts';
import { bezier, lista, type Pt } from './sfondo.ts';
import { gente as stile } from './persone.ts';

export interface Dinamica { tipo: 'corteo' | 'folla'; settore: string }

/** Che cosa si muove per la chiamata sul settore «citato» (null: niente). */
export function dinamicaDi(citato: string | undefined, tipo: string | undefined, viali: { id: string }[]): Dinamica | null {
  if (!citato || spento('C32D01')) return null;
  return { tipo: tipo === 'strada' && viali.some((v) => v.id === citato) ? 'corteo' : 'folla', settore: citato };
}

/** Riempie «livello» con le persone della dinamica e restituisce come muoverle al tempo t (secondi). */
export function costruisciDinamica(livello: Container, d: Dinamica, dove: Pt, viale: Pt[] | null, colori: [string, string], esce: boolean): (t: number) => void {
  // C22-03: persona con contorno nero e alone bianco (persone.ts); l'alone segue la persona. Rosso C56P01: quadratini.
  const persona = (tinta: string, lato: number) => {
    const g = stile(d.tipo, lato), c = new Container();
    if (g.alone) { const h = new Sprite(g.alone.tex); h.scale.set(g.alone.scala); h.anchor.set(0.5); c.addChild(h); }
    const s = new Sprite(g.persona); s.scale.set(g.scala); s.tint = tinta; s.anchor.set(0.5); c.addChild(s);
    livello.addChild(c); return c;
  };
  if (d.tipo === 'corteo' && viale) {
    const gente = Array.from({ length: 40 }, (_, i) => ({ s: persona(colori[i % 3 ? 0 : 1], 2.6), u: (i * 0.618) % 1, off: ((i * 7) % 11) - 5 }));
    return (t) => {
      for (const g of gente) {
        const u = ((g.u + t * 0.04) % 1) * 0.8;
        const p = bezier(viale, esce ? 1 - u : u);
        g.s.position.set(p.x + g.off, p.y + g.off * 0.4);
      }
    };
  }
  const tinte = lista('--mappa-folla', 3);
  // C22-03: con le persone grandi 48 si fondevano in una macchia: 28; e niente alfa che ondeggia (schiariva contorno e alone)
  const nuove = !!stile('folla', 2.4).alone;
  const gente = Array.from({ length: nuove ? 28 : 48 }, (_, i) => ({ s: persona(tinte[i % 3]!, 2.4), a: i * (nuove ? 4.1 : 2.4), r: 12 + ((i * 13) % 19), v: (i % 2 ? 1 : -1) * (0.2 + (i % 5) * 0.06) }));
  return (t) => {
    for (const g of gente) {
      const a = g.a + t * g.v;
      g.s.position.set(dove.x + Math.cos(a) * g.r, dove.y + Math.sin(a) * g.r * 0.7);
      if (!nuove) g.s.alpha = 0.7 + 0.3 * Math.sin(t * 3 + g.a);
    }
  };
}
