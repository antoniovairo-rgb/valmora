// Tavole grandi del finale (D-165, D-167): cornice 4:3 e figure a mezzo busto più curate delle vignette piccole.
// Volti: busto della seconda bozza PO-119 di S-01 (busto.tsx, D-171), ombre del volto a campitura piena, mai il retino
// (D-167: la mezza faccia a puntini sembrava un difetto); il retino resta sui vestiti e sugli sfondi (stile C, D-066).
// Colori solo dalle classi «v-*» (stile-schermate.css, stile-c18.css).
import type { ReactNode } from 'react';
import { Busto } from './busto.tsx';

export const L = 320, A = 240; // misure del disegno (unità SVG), 4:3

/** Cornice della tavola: fondo, retini, contenuto, riquadro nero spesso. */
export function Tavola(p: { nome: string; titolo: string; children: ReactNode }) {
  return (
    <svg className="vignetta tavola-svg" viewBox={`0 0 ${L} ${A}`} role="img" aria-label={p.titolo} data-vignetta={p.nome}>
      <defs>
        <pattern id="t-retino" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.1" className="v-retino" /></pattern>
        <pattern id="t-ombra" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" className="v-nero" /></pattern>
        {/* «v-ombra» del busto (busto.tsx): lo stesso retino delle vignette (vignetta.tsx) */}
        <pattern id="v-ombra" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" className="v-retino-ombra-fondo" /><circle cx="2.5" cy="2.5" r="1.4" className="v-nero" /></pattern>
        <linearGradient id="t-luce" x1="0" y1="0" x2="0" y2="1"><stop offset="0" className="v-stop-luce" /><stop offset="1" className="v-stop-vuoto" /></linearGradient>
      </defs>
      {p.children}
      <rect x="2" y="2" width={L - 4} height={A - 4} className="v-cornice" />
    </svg>
  );
}

/** Ombra a puntini neri (solo vestiti e sfondi). */
export const Retino = (p: { d: string }) => <path d={p.d} fill="url(#t-ombra)" className="v-retino-ombra" />;

export type Capelli = 'corti' | 'lunghi' | 'berretto' | 'rasati';
type Bocca = 'sorriso' | 'dritta' | 'giu' | 'aperta';

/** Figura delle tavole = busto della seconda bozza PO-119 (busto.tsx, D-171), messo alla misura delle scene:
 *  origine al centro del volto come la prima prova. «civile»: senza spalline, taschini e distintivo (Fabbro, testimone,
 *  Lavezzari). */
export function Figura(p: { x: number; y: number; s?: number; giacca: string; capelli: Capelli; bocca?: Bocca; ciglia?: 'su' | 'giu' | 'dritte';
  baffi?: boolean; distintivo?: boolean; cravatta?: boolean; rughe?: boolean; occhi?: 'aperti' | 'stretti'; civile?: boolean }) {
  const s = p.s ?? 1;
  return <Busto x={p.x} y={p.y + 22 * s} s={s} giacca={p.giacca} capelli={p.capelli === 'rasati' ? 'corti' : p.capelli}
    bocca={p.bocca === 'sorriso' || p.bocca === 'aperta' ? 'su' : p.bocca ?? 'dritta'} sopracciglia={p.ciglia === 'dritte' ? undefined : p.ciglia}
    baffi={p.baffi} distintivo={p.distintivo} divisa={!p.civile} cravatta={p.cravatta ?? (p.capelli !== 'berretto' && !p.civile ? true : undefined)} />;
}

/** Folla lontana sugli spalti: teste e spalle piccole, a file, coi colori della folla della mappa. */
export function Folla(p: { x: number; y: number; l: number; file: number; passo?: number }) {
  const passo = p.passo ?? 9;
  return (
    <g data-folla>
      {Array.from({ length: p.file }, (_, f) => Array.from({ length: Math.floor(p.l / passo) }, (_, i) => {
        const x = p.x + i * passo + (f % 2) * passo / 2, y = p.y + f * 8;
        return <g key={`${f}-${i}`}><rect x={x - 3} y={y} width="6" height="6" className={`v-folla-${1 + ((i + f) % 3)}`} /><circle cx={x} cy={y - 2} r="2.4" className={`v-folla-${1 + ((i * 2 + f) % 3)}`} /></g>;
      }))}
    </g>
  );
}
