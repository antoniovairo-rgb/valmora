// Tavole grandi del finale (D-165, D-167): cornice 4:3 e figure a mezzo busto più curate delle vignette piccole.
// Volti puliti: l'ombra del volto è un tono pieno della pelle (--vignetta-pelle-ombra), mai il retino (D-167: la mezza
// faccia a puntini sembrava un difetto); il retino resta sui vestiti e sugli sfondi, come nello stile C (D-066).
// Colori solo dalle classi «v-*» (stile.css, stile-c18.css).
import type { ReactNode } from 'react';

export const L = 320, A = 240; // misure del disegno (unità SVG), 4:3

/** Cornice della tavola: fondo, retini, contenuto, riquadro nero spesso. */
export function Tavola(p: { nome: string; titolo: string; children: ReactNode }) {
  return (
    <svg className="vignetta tavola-svg" viewBox={`0 0 ${L} ${A}`} role="img" aria-label={p.titolo} data-vignetta={p.nome}>
      <defs>
        <pattern id="t-retino" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.1" className="v-retino" /></pattern>
        <pattern id="t-ombra" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" className="v-nero" /></pattern>
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

/** Mezzo busto di tre quarti, la luce viene da sinistra: ombra piena a destra del volto e del collo. */
export function Figura(p: { x: number; y: number; s?: number; giacca: string; capelli: Capelli; bocca?: Bocca; ciglia?: 'su' | 'giu' | 'dritte';
  baffi?: boolean; distintivo?: boolean; cravatta?: boolean; rughe?: boolean; occhi?: 'aperti' | 'stretti' }) {
  const s = p.s ?? 1;
  const bocca = { sorriso: 'M-9 17 Q0 25 9 17', dritta: 'M-8 19 L8 19', giu: 'M-9 21 Q0 15 9 21', aperta: 'M-8 16 Q0 28 8 16 Z' }[p.bocca ?? 'dritta'];
  const ciglia = { su: 'M-17 -11 Q-10 -17 -3 -12 M3 -12 Q10 -17 17 -11', giu: 'M-17 -9 L-4 -5 M4 -5 L17 -9', dritte: 'M-17 -9 Q-10 -12 -3 -9 M3 -9 Q10 -12 17 -9' }[p.ciglia ?? 'dritte'];
  const occhioY = p.occhi === 'stretti' ? 1.4 : 2.8;
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${s})`} data-figura={p.capelli}>
      {/* busto: giacca, ombra a retino sul lato in ombra, risvolti, camicia, cravatta o distintivo */}
      <path d="M-62 120 Q-64 66 -30 56 L0 66 L30 56 Q64 66 62 120 Z" className={`${p.giacca} v-tratto`} />
      <Retino d="M14 62 Q52 70 58 120 L24 120 Q26 86 14 62 Z" />
      <path d="M-30 56 L-12 96 L-4 70 Z M30 56 L12 96 L4 70 Z" className={`${p.giacca} v-tratto`} />
      <path d="M-14 58 L0 84 L14 58 L8 54 L0 66 L-8 54 Z" className="v-bianco v-tratto" />
      {p.cravatta && <path d="M-4 68 L4 68 L7 100 L0 108 L-7 100 Z" className="v-nero v-tratto" />}
      {p.distintivo && <path d="M-40 80 l8 -5 l8 5 l-1.5 10 l-6.5 4 l-6.5 -4 Z" className="v-giallo v-tratto" />}
      {/* collo con l'ombra del mento */}
      <path d="M-11 30 L-11 58 Q0 66 11 58 L11 30 Z" className="v-pelle v-tratto" />
      <path d="M-11 34 Q0 46 11 34 L11 46 Q0 52 -11 44 Z" className="v-ombra-pelle" />
      {/* orecchie, volto, ombra piena del lato destro */}
      <path d="M-27 -2 q-9 1 -7 11 q2 7 8 4" className="v-pelle v-tratto" /><path d="M27 -2 q9 1 7 11 q-2 7 -8 4" className="v-pelle v-tratto" />
      <path d="M-26 -6 Q-27 -40 0 -42 Q27 -40 26 -6 Q25 24 0 37 Q-25 24 -26 -6 Z" className="v-pelle v-tratto" />
      <path d="M13 -38 Q27 -30 26 -6 Q25 22 3 36 Q19 18 18 -6 Q17 -26 13 -38 Z" className="v-ombra-pelle" />
      {/* capelli */}
      {p.capelli === 'corti' && <path d="M-27 -4 Q-30 -44 0 -45 Q30 -44 27 -4 L24 -16 Q18 -28 6 -27 L-2 -33 L-8 -27 Q-20 -28 -24 -14 Z" className="v-capelli v-tratto" />}
      {p.capelli === 'rasati' && <path d="M-26 -8 Q-28 -42 0 -43 Q28 -42 26 -8 Q20 -30 0 -31 Q-20 -30 -26 -8 Z" className="v-capelli v-tratto" />}
      {p.capelli === 'lunghi' && <>
        <path d="M-29 0 Q-34 -46 0 -46 Q34 -46 29 0 L32 52 Q22 58 16 50 L18 -6 Q10 -24 -6 -28 Q-12 -14 -20 -10 L-18 50 Q-24 58 -32 52 Z" className="v-capelli v-tratto" />
        <path d="M-6 -28 Q8 -36 18 -8" className="v-linea-chiara" />
      </>}
      {p.capelli === 'berretto' && <>
        <path d="M-28 -10 Q-28 -48 0 -48 Q28 -48 28 -10 Z" className="v-giacca-scura v-tratto" />
        <rect x="-28" y="-16" width="56" height="8" className="v-nero" />
        <path d="M-30 -9 H32 Q44 -6 46 0 L-26 -2 Z" className="v-nero v-tratto" />
        <path d="M-7 -40 l7 -5 l7 5 l-1.5 9 l-5.5 4 l-5.5 -4 Z" className="v-giallo v-tratto" />
      </>}
      {/* sopracciglia, occhi con l'iride e la luce, naso con l'ombra, rughe, baffi, bocca */}
      <path d={ciglia} className="v-ciglia" />
      {[-10, 10].map((cx) => <g key={cx}><ellipse cx={cx} cy="0" rx="5" ry={occhioY} className="v-bianco" /><circle cx={cx + 0.6} cy="0" r={Math.min(2.6, occhioY)} className="v-nero" /><circle cx={cx - 0.4} cy="-0.8" r="0.8" className="v-bianco" /></g>)}
      <path d="M1 2 Q-3 12 0 14 Q3 15 5 13" className="v-linea" /><path d="M3 4 Q6 10 5 13 Q3 12 3 4 Z" className="v-ombra-pelle" />
      {p.rughe && <path d="M-18 6 q2 3 0 6 M18 6 q-2 3 0 6 M-8 -22 h16" className="v-linea-fine" />}
      {p.baffi && <path d="M-13 14 Q0 7 13 14 Q5 17 0 15 Q-5 17 -13 14 Z" className="v-capelli v-tratto" />}
      <path d={bocca} className={p.bocca === 'aperta' ? 'v-nero v-tratto' : 'v-linea'} />
    </g>
  );
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
