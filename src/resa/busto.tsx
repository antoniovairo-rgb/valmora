// Busto della seconda bozza PO-119 di S-01 (0ec4262, coordination/handoffs/sviluppatrice/po119/bozza2/bozza-persona-2.mjs),
// approvata dal PO «a busto» per le tavole del finale (D-171). Stessi tracciati della bozza, da stringa SVG a JSX.
// Volto di tre quarti con ombre a campitura, occhi con palpebra e pupilla, labbra; uomo e donna diversi; divisa con
// pieghe, colletto, cravatta, distintivo a stella, spalline cucite. Colori solo dalle classi v-*.
// Aggiunte per le tavole: «divisa» (spalline, taschini) e «cravatta» si spengono per i civili (Fabbro, testimone, Lavezzari).
import type { ReactNode } from 'react';

const T = 'v-tratto', L = 'v-linea', FINE = 'v-linea v-fine';
const P = (p: { d: string; c: string }) => <path d={p.d} className={p.c} />;

/** Mano con quattro dita e il pollice, in coordinate locali (dita verso l'alto); ruotata e spostata. */
function Mano(p: { x: number; y: number; r?: number; k?: number }) {
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.r ?? 0}) scale(${p.k ?? 1})`}>
      <P d="M-6 5 L-6 -3 Q-6 -9 -4.2 -9 Q-2.4 -9 -2.4 -4 L-2.4 -10.5 Q-2.4 -13 -0.6 -13 Q1.2 -13 1.2 -10.5 L1.2 -4.5 Q1.2 -11 3 -11 Q4.8 -11 4.8 -6 L4.8 -2 Q4.8 -7 6.4 -7 Q8 -7 8 -3 L8 4 Q2 10 -6 5 Z" c={`v-pelle ${T}`} />
      <P d="M-6 2 Q-11 0 -11.5 -4.5 Q-10.5 -7 -8.5 -5 L-6 -1.5" c={`v-pelle ${T}`} />
      <P d="M-2.4 -4 L-2.4 1 M1.2 -4.5 L1.2 1.5 M4.8 -2 L4.8 2" c={L} />
    </g>
  );
}

export interface BustoProps {
  x: number; y: number; s?: number; giacca: string; capelli: 'corti' | 'lunghi' | 'berretto';
  bocca?: 'su' | 'giu' | 'dritta'; sopracciglia?: 'su' | 'giu'; baffi?: boolean; distintivo?: boolean;
  braccia?: 'su' | 'nuca' | 'conserte'; giro?: number; divisa?: boolean; cravatta?: boolean;
}

export function Busto(p: BustoProps) {
  const s = (p.s ?? 1) * 1.32, vice = p.capelli === 'berretto', donna = p.capelli === 'lunghi';
  const giro = p.giro ?? 3, F = (x: number) => x + giro, giacca = p.giacca, divisa = p.divisa ?? true, cravatta = p.cravatta ?? !vice;
  const g: ReactNode[] = [];
  const add = (d: string, c: string) => g.push(<P key={g.length} d={d} c={c} />);
  if (p.braccia === 'su') {
    add('M-36 46 Q-48 22 -58 -6 L-46 -10 Q-38 14 -26 40 Z', `${giacca} ${T}`); add('M38 42 Q50 16 56 -14 L68 -11 Q62 18 48 46 Z', `${giacca} ${T}`);
    g.push(<Mano key="m1" x={-52} y={-12} r={-18} k={1.05} />, <Mano key="m2" x={62} y={-18} r={14} k={1.05} />);
  }
  // busto: spalla sinistra più bassa, ombra a retino sul lato in ombra, pieghe
  add('M-52 112 Q-56 56 -37 40 L-11 29 L0 41 L11 27 L36 33 Q55 46 51 112 Z', `${giacca} ${T}`);
  add('M19 31 Q48 43 51 112 L29 112 Q33 66 19 31 Z', 'v-ombra');
  add('M-31 66 q7 9 2 20 M-20 92 q5 -7 11 -4 M30 62 q-5 11 0 22 M-44 58 q4 6 3 14', L);
  // camicia e cravatta col nodo
  add('M-11 29 L0 54 L11 27 Z', `${vice ? 'v-giacca-scura' : 'v-bianco'} ${T}`);
  if (cravatta) { add('M-4 37 L4 37 L3 43 L-3 43 Z', 'v-nero'); add('M-3 43 L3 43 L6 66 L0 73 L-6 66 Z', 'v-nero'); add('M1 46 L2.4 63', `${L} v-bianco-linea`); }
  // colletto con volume
  const lembo = vice ? 'v-giacca-scura' : 'v-bianco';
  add('M-12 27 L-20 41 L-3 44 L-6 34 Z', `${lembo} ${T}`); add('M-12 28 L-16 37 L-8 36 Z', 'v-ombra');
  add('M12 26 L20 40 L3 44 L6 33 Z', `${lembo} ${T}`); add('M12 27 L16 36 L8 35 Z', 'v-ombra');
  if (divisa) {
    // spalline cucite (impuntura tratteggiata)
    add('M-49 43 L-29 35 L-27 42 L-47 50 Z', `v-giallo ${T}`); g.push(<path key="i1" d="M-46 47 L-29 40" className={L} strokeDasharray="2 2" />);
    add('M46 37 L27 33 L25 40 L44 45 Z', `v-giallo ${T}`); g.push(<path key="i2" d="M43 42 L27 37" className={L} strokeDasharray="2 2" />);
    add('M-40 76 h16 v5 h-16 Z M24 74 h16 v5 h-16 Z', L);
  }
  if (p.distintivo) { add('M-34 54 l8 -4.5 l8 4.5 l-1 10 l-7 4.5 l-7 -4.5 Z', `v-giallo ${T}`); add('M-26 55.5 l1.3 2.8 3 0.3 -2.3 2 0.7 3 -2.7 -1.5 -2.7 1.5 0.7 -3 -2.3 -2 3 -0.3 Z', 'v-nero'); }
  // collo con l'ombra sotto il mento
  add('M-7 8 L-7 29 Q0 34 7 29 L7 8', `v-pelle ${T}`); add('M-7 11 Q0 20 7 11 L7 18 Q0 24 -7 18 Z', 'v-ombra-pelle');
  const testa = donna ? 'M-16 -17 Q-17 -42 1 -43 Q18 -42 17 -17 Q16 3 2 15 Q-14 5 -16 -17 Z' : 'M-17 -17 Q-18 -43 1 -44 Q19 -43 18 -17 L17 -1 Q15 12 2 16 Q-13 13 -16 -1 Z';
  add('M-16 -20 q-8 -2 -7.5 7 q0.5 7 7 6', `v-pelle ${T}`); add('M-18 -15 q-3 1 -2 5', FINE);
  add(testa, `v-pelle ${T}`);
  add('M17 -20 q4 0 4 5 q-1 5 -4 5', `v-pelle ${T}`);
  // ombre del volto a campitura: guancia e zigomo sul lato lontano, mento, sotto il naso
  add(`M${F(8)} -11 Q${F(15)} -9 ${F(14)} 1 Q${F(11)} 9 ${F(4)} 13 Q${F(11)} 2 ${F(9)} -6 Z`, 'v-ombra-pelle');
  add(`M${F(-5)} 11.5 Q${F(0)} 15 ${F(5)} 11.5 Q${F(0)} 17 ${F(-5)} 11.5 Z`, 'v-ombra-pelle');
  add(`M${F(-2)} -1 Q${F(1)} 1.5 ${F(4)} -1 Q${F(1)} 0.4 ${F(-2)} -1 Z`, 'v-ombra-pelle');
  // capelli
  if (p.capelli === 'corti') { add('M-18 -15 Q-25 -46 -1 -50 Q16 -54 22 -41 Q26 -30 20 -17 Q18 -28 10 -32 Q11 -25 4 -26 Q3 -35 -6 -33 Q-5 -26 -11 -26 Q-15 -22 -18 -15 Z', `v-capelli ${T}`); add('M-7 -45 Q0 -41 -2 -33 M7 -47 Q14 -42 11 -34 M15 -44 Q20 -38 18 -31', L); }
  if (donna) { add('M-18 -13 Q-26 -46 1 -47 Q27 -46 20 -13 L25 22 Q21 30 16 25 L18.5 -8 Q17 -28 6 -33 Q-2 -23 -15 -23 L-15 25 Q-21 30 -25 22 Z', `v-capelli ${T}`); add('M-10 -40 Q-4 -33 -7 -25 M6 -42 Q12 -35 10 -27 M-20 2 Q-18 12 -21 18 M20 2 Q18 12 21 18', L); }
  if (vice) { add('M-19 -25 Q-20 -48 1 -49 Q21 -48 20 -25 Z', `v-giacca-scura ${T}`); add('M-21 -25 H27 L37 -20 L-19 -19.5 Z', `v-nero ${T}`); add('M-14 -24 H24', `${FINE} v-bianco-linea`); add('M-4 -44 l5 -4 l5 4 l-1 6 l-4 3 l-4 -3 Z', `v-giallo ${T}`); }
  // sopracciglia: uomo spesse (campite), donna sottili (linea)
  const alto = p.sopracciglia === 'su' ? -3 : 0, giu = p.sopracciglia === 'giu';
  if (donna) add(giu ? `M${F(-11)} -20 Q${F(-6)} -22 ${F(-2)} -19 M${F(3)} -19 Q${F(7)} -22 ${F(11)} -20` : `M${F(-11)} ${-21 + alto} Q${F(-6)} ${-24 + alto} ${F(-2)} ${-21 + alto} M${F(3)} ${-21 + alto} Q${F(7)} ${-24 + alto} ${F(11)} ${-21 + alto}`, L);
  else add(giu ? `M${F(-12)} -23 L${F(-2)} -19 L${F(-2)} -17 L${F(-12)} -21 Z M${F(2)} -19 L${F(12)} -23 L${F(12)} -21 L${F(2)} -17 Z`
    : `M${F(-12)} ${-21 + alto} Q${F(-7)} ${-25 + alto} ${F(-2)} ${-22 + alto} L${F(-2)} ${-20 + alto} Q${F(-7)} ${-23 + alto} ${F(-12)} ${-19 + alto} Z M${F(2)} ${-22 + alto} Q${F(7)} ${-25 + alto} ${F(12)} ${-21 + alto} L${F(12)} ${-19 + alto} Q${F(7)} ${-23 + alto} ${F(2)} ${-20 + alto} Z`, 'v-capelli');
  // occhi: bianco, pupilla con la luce, palpebra superiore marcata; la donna ha le ciglia
  for (const cx of [F(-6.5), F(6.5)]) {
    add(`M${cx - 4.5} -15 Q${cx} -19 ${cx + 4.5} -15 Q${cx} -11.8 ${cx - 4.5} -15 Z`, 'v-bianco');
    g.push(<circle key={`p${cx}`} cx={cx + 0.8} cy={-15.1} r={1.9} className="v-nero" />, <circle key={`l${cx}`} cx={cx + 1.4} cy={-15.8} r={0.6} className="v-bianco" />);
    add(`M${cx - 5} -15.2 Q${cx} -20 ${cx + 5} -15.2`, L); add(`M${cx - 3.5} -12.8 Q${cx} -11.4 ${cx + 3.5} -12.8`, FINE);
    if (donna) add(`M${cx + 4.6} -15.6 l2 -1.6 M${cx + 3.6} -17.2 l1.4 -2`, FINE);
  }
  add(`M${F(1)} -13 Q${F(-2.5)} -5 ${F(0.5)} -2.5 Q${F(2.5)} -1.5 ${F(4.5)} -2.8`, FINE);
  if (p.baffi) add(`M${F(-9)} 1.5 Q${F(0)} -3.5 ${F(9)} 1.5 Q${F(4)} 4 ${F(0)} 2 Q${F(-4)} 4 ${F(-9)} 1.5 Z`, `v-capelli ${T}`);
  // bocca con le labbra (festa: aperta coi denti); la donna ha le labbra più piene
  const pieno = donna ? 1.4 : 1;
  if (p.bocca === 'su' && p.braccia === 'su') { add(`M${F(-6)} 4 Q${F(0)} 13 ${F(6)} 4 Z`, `v-nero ${T}`); add(`M${F(-5)} 4.6 Q${F(0)} 6 ${F(5)} 4.6 L${F(4.5)} 6.2 Q${F(0)} 7.6 ${F(-4.5)} 6.2 Z`, 'v-bianco'); }
  else {
    const labbro = p.bocca === 'giu' ? `M${F(-6)} 8 Q${F(0)} 3 ${F(6)} 8` : p.bocca === 'dritta' ? `M${F(-5)} 6 Q${F(0)} 5.5 ${F(5)} 6` : `M${F(-6)} 4 Q${F(0)} 9 ${F(6)} 4`;
    const sotto = p.bocca === 'giu' ? 9.5 : p.bocca === 'dritta' ? 7 : 7.5;
    add(`M${F(-3.5)} ${sotto} Q${F(0)} ${sotto + 2.6 * pieno} ${F(3.5)} ${sotto} Q${F(0)} ${sotto + 1} ${F(-3.5)} ${sotto} Z`, donna ? 'v-rosa' : 'v-ombra-pelle');
    add(labbro, FINE);
  }
  if (p.braccia === 'nuca') { add('M36 58 Q50 30 40 2 L28 -10 L20 -4 L30 6 Q38 30 26 54 Z', `${giacca} ${T}`); g.push(<Mano key="mn" x={24} y={-18} r={-40} k={1.05} />); }
  if (p.braccia === 'conserte') {
    add('M-46 66 Q0 84 44 64 L46 80 Q0 98 -44 82 Z', `${giacca} ${T}`); add('M-44 82 Q0 98 46 80 L44 86 Q0 102 -42 88 Z', 'v-ombra');
    add('M-40 78 Q-6 66 30 84 L28 94 Q-6 78 -38 90 Z', `${giacca} ${T}`); g.push(<Mano key="c1" x={36} y={76} r={70} k={0.95} />, <Mano key="c2" x={-48} y={72} r={-100} k={0.95} />);
  }
  return <g transform={`translate(${p.x} ${p.y}) scale(${s})`} data-busto={p.capelli} data-braccia={p.braccia ?? ''}>{g}</g>;
}
