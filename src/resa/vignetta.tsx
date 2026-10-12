// Vignette a fumetto (S-23, PO-078, stile C D-066/D-096): disegnate dal codice in SVG, senza asset esterni.
// Colori solo da token: le forme usano classi «v-*» definite in stile.css. Riquadro nero spesso, retino giallo
// di fondo. La vignetta si rimpicciolisce (altezza dal CSS) prima di far scorrere la pagina.
// Rosso C26V01: nessuna vignetta.
import type { ReactNode } from 'react';
import { spento } from '../interruttori.ts';

export function Vignetta(p: { nome: string; titolo: string; children: ReactNode }) {
  if (spento('C26V01')) return null;
  return (
    <svg className="vignetta" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" role="img" aria-label={p.titolo} data-vignetta={p.nome}>
      <defs>
        <pattern id="v-retino" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.2" className="v-retino" /></pattern>
      </defs>
      <rect x="0" y="0" width="320" height="180" className="v-giallo" />
      <rect x="0" y="0" width="320" height="180" fill="url(#v-retino)" />
      {p.children}
      <rect x="1.5" y="1.5" width="317" height="177" className="v-cornice" />
    </svg>
  );
}

/** Persona stilizzata a fumetto (testa, capelli, busto); «f» = capelli lunghi. Espressione: bocca su/giù/dritta. */
export function Persona(p: { x: number; y: number; s?: number; giacca: string; capelli: 'corti' | 'lunghi' | 'berretto'; bocca?: 'su' | 'giu' | 'dritta'; baffi?: boolean }) {
  const s = p.s ?? 1;
  const bocca = p.bocca === 'giu' ? 'M-6 12 Q0 7 6 12' : p.bocca === 'dritta' ? 'M-5 10 L5 10' : 'M-6 8 Q0 14 6 8';
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${s})`}>
      <path d="M-26 70 Q-26 34 0 32 Q26 34 26 70 Z" className={`${p.giacca} v-tratto`} />
      <path d="M-6 33 L0 46 L6 33" className="v-bianco v-tratto" />
      <circle cx="0" cy="0" r="20" className="v-pelle v-tratto" />
      {p.capelli === 'lunghi' && <path d="M-21 2 Q-24 -24 0 -22 Q24 -24 21 2 L22 26 L14 22 L14 -6 Q0 -12 -14 -6 L-14 22 L-22 26 Z" className="v-capelli v-tratto" />}
      {p.capelli === 'corti' && <path d="M-20 -2 Q-20 -24 0 -22 Q20 -24 20 -2 Q10 -12 -20 -2 Z" className="v-capelli v-tratto" />}
      {p.capelli === 'berretto' && <path d="M-21 -4 Q-20 -26 0 -25 Q20 -26 21 -4 Z M18 -6 L32 -4 L20 -1 Z" className="v-nero v-tratto" />}
      <circle cx="-7" cy="-2" r="2.4" className="v-nero" /><circle cx="7" cy="-2" r="2.4" className="v-nero" />
      {p.baffi && <path d="M-9 5 Q0 1 9 5 Q0 8 -9 5 Z" className="v-capelli" />}
      <path d={bocca} className="v-linea" />
    </g>
  );
}
