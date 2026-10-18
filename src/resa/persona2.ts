// PO-119 / D-171, D-176 (PO-133, PO-135): protagonista e vice della quarta prova approvata dal PO (taglio «a busto»). Il
// disegno è quello delle tavole (coordination/handoffs/sviluppatrice/po119/bozza4), copiato senza cambiare una forma: braccia
// separate dal busto (spazio dal fianco, gomito piegato, avambraccio in avanti), spostamento di peso sui fianchi (`peso`, in
// gradi), mano sul cinturone (`braccia: 'cinturone'`), figura femminile con seno appena accennato dalla linea della giacca.
// Stringa SVG con soli numeri e classi «v-*» (nessun testo da fuori), montata da Persona in vignetta.tsx.
export interface PersonaDati { x: number; y: number; s?: number; scala?: number; giro?: number; peso?: number; giacca: string; capelli: 'corti' | 'lunghi' | 'berretto';
  bocca?: 'su' | 'giu' | 'dritta'; baffi?: boolean; distintivo?: boolean; sopracciglia?: 'su' | 'giu'; braccia?: 'su' | 'nuca' | 'conserte' | 'cinturone' }
type P2 = [number, number];
const T = 'v-tratto', L = 'v-linea', FINE = 'v-linea v-fine';
const path = (d: string, c: string) => `<path d="${d}" class="${c}"/>`;
const f = (n: number) => Math.round(n * 10) / 10;

function mano(x: number, y: number, r = 0, k = 1) {
  const d = 'M-6 5 L-6 -3 Q-6 -9 -4.2 -9 Q-2.4 -9 -2.4 -4 L-2.4 -10.5 Q-2.4 -13 -0.6 -13 Q1.2 -13 1.2 -10.5 L1.2 -4.5 Q1.2 -11 3 -11 Q4.8 -11 4.8 -6 L4.8 -2 Q4.8 -7 6.4 -7 Q8 -7 8 -3 L8 4 Q2 10 -6 5 Z';
  const pollice = 'M-6 2 Q-11 0 -11.5 -4.5 Q-10.5 -7 -8.5 -5 L-6 -1.5';
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(r)}) scale(${k})">${path(d, `v-pelle ${T}`)}${path(pollice, `v-pelle ${T}`)}${path('M-2.4 -4 L-2.4 1 M1.2 -4.5 L1.2 1.5 M4.8 -2 L4.8 2', L)}</g>`;
}
/** Arto che si assottiglia lungo i punti P (spalla, gomito, polso) con le larghezze W: contorno morbido, gomito arrotondato. */
function arto(P: P2[], W: number[], cls: string) {
  const lato = (s: number): P2[] => P.map((p, i) => { const a = P[Math.max(0, i - 1)]!, b = P[Math.min(P.length - 1, i + 1)]!, n = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [p[0] - s * (b[1] - a[1]) / n * W[i]! / 2, p[1] + s * (b[0] - a[0]) / n * W[i]! / 2]; });
  const A = lato(1), B = lato(-1).reverse(), a0 = A[0]!, b0 = B[0]!, q = (pts: P2[]) => pts.slice(1).map((p, i) => (i === pts.length - 2 ? `L${f(p[0])} ${f(p[1])}` : `Q${f(p[0])} ${f(p[1])} ${f((p[0] + pts[i + 2]![0]) / 2)} ${f((p[1] + pts[i + 2]![1]) / 2)}`)).join(' ');
  return path(`M${f(a0[0])} ${f(a0[1])} ${q(A)} L${f(b0[0])} ${f(b0[1])} ${q(B)} Z`, cls);
}
/** Polsino al polso e mano in asse con l'avambraccio (dita nella direzione gomito → polso). */
function polso(e: P2, w: P2, k: number, _giacca: string, larg: number) {
  const a = Math.atan2(w[1] - e[1], w[0] - e[0]), r = a * 180 / Math.PI + 90, nx = -Math.sin(a), ny = Math.cos(a), h = larg / 2;
  return path(`M${f(w[0] + nx * h)} ${f(w[1] + ny * h)} L${f(w[0] - nx * h)} ${f(w[1] - ny * h)}`, L) + mano(w[0] + Math.cos(a) * 6 * k, w[1] + Math.sin(a) * 6 * k, r, k);
}

export function persona(p: PersonaDati): string {
  const s = (p.s ?? 1) * (p.scala ?? 1.32), vice = p.capelli === 'berretto', donna = p.capelli === 'lunghi';
  const g: string[] = [], giro = p.giro ?? 3, F = (x: number) => x + giro, giacca = p.giacca, G = `${giacca} ${T}`;
  const tw = donna ? 27 : 33, sp = tw + 4; // mezza larghezza del petto; attacco della spalla
  const mezzo = (y: number) => (donna ? (y < 92 ? 27 : 25) : (y < 92 ? 34 : 32));
  // festa: gomiti aperti all'altezza delle spalle, avambracci in su, palmi aperti (dietro il busto: la spalla si attacca)
  if (p.braccia === 'su') {
    g.push(arto([[-sp + 4, 46], [-sp - 24, 18], [-sp - 20, -22]], [19, 15, 11], G), polso([-sp - 24, 18], [-sp - 20, -22], 1.05, giacca, 11));
    g.push(arto([[sp - 4, 44], [sp + 24, 14], [sp + 22, -26]], [19, 15, 11], G), polso([sp + 24, 14], [sp + 22, -26], 1.05, giacca, 11));
  }
  // mano alla nuca: braccio destro col gomito alto e in fuori, avambraccio dietro la testa (la mano si disegna dopo i capelli)
  const nuca: { e: P2; w: P2 } | null = p.braccia === 'nuca' ? { e: [sp + 18, -6], w: [14, -30] } : null;
  if (nuca) g.push(arto([[sp - 4, 44], nuca.e, nuca.w], [19, 15, 11], G));
  // busto fino ai fianchi: petto, vita (segnata nella figura femminile), cinturone; lato destro in ombra
  g.push(path(donna ? 'M-25 132 L-25 106 Q-25.5 94 -27.5 80 Q-31.5 60 -25 42 L-10 31 L0 42 L10 30 L24 36 Q31.5 50 28 63 Q25.5 82 26.5 94 Q25.5 100 24 106 L24 132 Z'
    : 'M-32 132 L-32 106 Q-35 82 -34 62 Q-36 46 -30 39 L-11 29 L0 41 L11 27 L29 34 Q36 44 34 62 Q35 82 31 106 L31 132 Z', G));
  g.push(path(donna ? 'M14 34 Q28 46 26 64 Q23 84 25 96 L24 132 L16 132 Q20 70 14 34 Z' : 'M17 31 Q35 44 33 64 Q34 84 31 106 L31 132 L21 132 Q26 70 17 31 Z', 'v-ombra'));
  g.push(path(donna ? 'M-14 71 Q-11 86 -13 100 M14 71 Q11 86 12 100' : 'M-24 64 q6 9 2 20 M22 62 q-5 11 0 22', L));
  // PO-135: seno appena accennato dalla linea della giacca (curva sotto il petto da cui partono le pinces, ombra morbida),
  // senza scollature né forme marcate
  if (donna) g.push(path('M-23 66 Q-14 74 -6 68.5 Q-14 71 -23 66 Z M6 68.5 Q14 74 23 66 Q14 71 6 68.5 Z', 'v-ombra'), path('M-24 64.5 Q-14 74 -6 68.5 M6 68.5 Q14 74 24 64.5', L));
  // camicia e cravatta (più sottile nella divisa femminile; il vice senza cravatta)
  const c = donna ? 0.8 : 1;
  g.push(path(`M${-11 * c} ${29 + 2 * (1 - c)} L0 54 L${11 * c} 27 Z`, `${vice ? 'v-giacca-scura' : 'v-bianco'} ${T}`));
  if (!vice) { g.push(path(`M${-4 * c} 37 L${4 * c} 37 L${3 * c} 43 L${-3 * c} 43 Z`, 'v-nero'), path(`M${-3 * c} 43 L${3 * c} 43 L${6 * c} 66 L0 73 L${-6 * c} 66 Z`, 'v-nero'), path('M1 46 L2.2 63', `${L} v-bianco-linea`)); }
  const lembo = vice ? 'v-giacca-scura' : 'v-bianco';
  g.push(path(`M${-12 * c} 27 L${-20 * c} 41 L-3 44 L${-6 * c} 34 Z`, `${lembo} ${T}`), path(`M${-12 * c} 28 L${-16 * c} 37 L${-8 * c} 36 Z`, 'v-ombra'));
  g.push(path(`M${12 * c} 26 L${20 * c} 40 L3 44 L${6 * c} 33 Z`, `${lembo} ${T}`), path(`M${12 * c} 27 L${16 * c} 36 L${8 * c} 35 Z`, 'v-ombra'));
  if (p.distintivo) { const bx = donna ? -22 : -27; g.push(path(`M${bx} 54 l7 -4 l7 4 l-1 9 l-6 4 l-6 -4 Z`, `v-giallo ${T}`), path(`M${bx + 7} 55.5 l1.2 2.5 2.7 0.3 -2 1.8 0.6 2.7 -2.5 -1.4 -2.5 1.4 0.6 -2.7 -2 -1.8 2.7 -0.3 Z`, 'v-nero')); }
  const ty = donna ? 81 : 76; g.push(path(`M${-tw + 4} ${ty} h${tw - 10} v5 h${10 - tw} Z M${6} ${ty - 2} h${tw - 10} v5 h${10 - tw} Z`, L));
  // cinturone con la fibbia
  g.push(path(`M${-mezzo(100) - 0.5} 100 H${mezzo(100) - 0.5} V107 H${-mezzo(100) - 0.5} Z`, `${vice ? 'v-nero' : 'v-giacca-scura'} ${T}`), path('M-4 99.5 h8 v8 h-8 Z', `v-giallo ${T}`));
  // braccia: sagome proprie sopra il busto, con lo spazio dal fianco; gomito un po' piegato, avambraccio in avanti
  const riposo = (lato: number) => { const k = lato, e: P2 = [k * (tw + 19), 88], w: P2 = [k * (tw + 13), 118];
    return arto([[k * (tw + 3), 42], e, w], [18, 15, 12], G) + polso(e, w, 1, giacca, 12) + path(`M${k * (tw + 14)} 86 q${k * 4} 3 ${k * 9} 2`, L); };
  const cinturone = (lato: number) => { const k = lato, e: P2 = [k * (tw + 22), 78], w: P2 = [k * (tw - 3), 100];
    return arto([[k * (tw + 2), 42], e, w], [19, 16, 12], G) + polso(e, w, 1, giacca, 12); };
  if (!p.braccia) g.push(riposo(-1), riposo(1));
  if (p.braccia === 'cinturone') g.push(riposo(-1), cinturone(1));
  // braccia conserte: braccia staccate dai fianchi fino al gomito, avambracci incrociati a X, mani sul braccio opposto
  if (p.braccia === 'conserte') {
    g.push(arto([[-(tw + 3), 42], [-(tw + 15), 90]], [18, 16], G), arto([[tw + 3, 42], [tw + 15, 88]], [18, 16], G));
    g.push(arto([[tw + 13, 92], [-tw + 2, 74]], [17, 13], G), mano(-tw - 2, 72, -60, 0.95));
    g.push(arto([[-tw - 13, 94], [tw - 4, 76]], [17, 13], G), path(`M${-tw - 6} 102 Q0 94 ${tw - 4} 84 L${tw - 4} 88 Q0 98 ${-tw - 4} 104 Z`, 'v-ombra'), mano(tw, 74, 62, 0.95));
  }
  // spalline cucite sopra le spalle (dopo le braccia)
  g.push(path(`M${-tw - 9} 45 L${-tw + 9} 36 L${-tw + 11} 42 L${-tw - 7} 51 Z`, `v-giallo ${T}`), `<path d="M${-tw - 6} 48 L${-tw + 9} 40" class="${L}" stroke-dasharray="2 2"/>`);
  g.push(path(`M${tw + 8} 39 L${tw - 10} 33 L${tw - 12} 39 L${tw + 6} 46 Z`, `v-giallo ${T}`), `<path d="M${tw + 5} 43 L${tw - 10} 37" class="${L}" stroke-dasharray="2 2"/>`);
  // collo (più sottile nella figura femminile) con l'ombra sotto il mento
  const cl = donna ? 5.5 : 7;
  if (donna) g.push(path('M-18 -20 Q-24 -50 2 -50 Q27 -50 21 -18 Q21 6 26 28 Q19 34 10 29 L-8 29 Q-18 34 -24 28 Q-19 6 -18 -20 Z', `v-capelli ${T}`));
  g.push(path(`M${-cl} 8 L${-cl} 29 Q0 34 ${cl} 29 L${cl} 8`, `v-pelle ${T}`), path(`M${-cl} 11 Q0 20 ${cl} 11 L${cl} 18 Q0 24 ${-cl} 18 Z`, 'v-ombra-pelle'));
  // testa: uomo mascella squadrata; donna ovale, zigomi alti, mento fine
  const testa = donna ? 'M-14.5 -18 Q-15.5 -42 1 -43 Q17 -42 15.5 -18 Q15 -2 7 9 Q3 14 0 14 Q-4 13 -8 7 Q-14 -3 -14.5 -18 Z'
    : 'M-17 -17 Q-18 -43 1 -44 Q19 -43 18 -17 L17 -1 Q15 12 2 16 Q-13 13 -16 -1 Z';
  if (!donna) g.push(path('M-16 -20 q-8 -2 -7.5 7 q0.5 7 7 6', `v-pelle ${T}`), path('M-18 -15 q-3 1 -2 5', FINE));
  else g.push(path('M-14 -19 q-6 -1 -5.5 5.5 q0.5 5 5 4.5', `v-pelle ${T}`));
  g.push(path(testa, `v-pelle ${T}`));
  if (!donna) g.push(path('M17 -20 q4 0 4 5 q-1 5 -4 5', `v-pelle ${T}`));
  // ombre del volto (più leggere e alte sullo zigomo nella figura femminile)
  g.push(path(donna ? `M${F(7)} -12 Q${F(13)} -10 ${F(12)} -1 Q${F(9)} 6 ${F(4)} 10 Q${F(9)} 1 ${F(8)} -6 Z` : `M${F(8)} -11 Q${F(15)} -9 ${F(14)} 1 Q${F(11)} 9 ${F(4)} 13 Q${F(11)} 2 ${F(9)} -6 Z`, 'v-ombra-pelle'));
  if (!donna) g.push(path(`M${F(-5)} 11.5 Q${F(0)} 15 ${F(5)} 11.5 Q${F(0)} 17 ${F(-5)} 11.5 Z`, 'v-ombra-pelle'));
  g.push(path(`M${F(-2)} -1 Q${F(1)} 1.5 ${F(4)} -1 Q${F(1)} 0.4 ${F(-2)} -1 Z`, 'v-ombra-pelle'));
  // capelli
  if (p.capelli === 'corti') g.push(path('M-18 -15 Q-25 -46 -1 -50 Q16 -54 22 -41 Q26 -30 20 -17 Q18 -28 10 -32 Q11 -25 4 -26 Q3 -35 -6 -33 Q-5 -26 -11 -26 Q-15 -22 -18 -15 Z', `v-capelli ${T}`), path('M-7 -45 Q0 -41 -2 -33 M7 -47 Q14 -42 11 -34 M15 -44 Q20 -38 18 -31', L));
  // donna: riga di lato, ciocca che scende sulla fronte e incornicia il viso fino alle spalle
  if (donna) g.push(path('M-15.5 -18 Q-18 -44 0 -46 Q19 -47 17.5 -26 Q16.5 -16 18 -8 Q13 -17 11 -28 Q4 -36 -6 -35 Q-12 -29 -15.5 -18 Z', `v-capelli ${T}`),
    path('M3 -44 Q11 -41 14 -31 M-6 -42 Q-1 -40 2 -36 M-21 0 Q-20 14 -23 25 M21 -2 Q20 12 23 25', FINE));
  if (vice) g.push(path('M-19 -25 Q-20 -48 1 -49 Q21 -48 20 -25 Z', `v-giacca-scura ${T}`), path('M-21 -25 H27 L37 -20 L-19 -19.5 Z', `v-nero ${T}`), path('M-14 -24 H24', `${FINE} v-bianco-linea`), path('M-4 -44 l5 -4 l5 4 l-1 6 l-4 3 l-4 -3 Z', `v-giallo ${T}`));
  // sopracciglia: uomo spesse; donna sottili e arcuate
  const alto = p.sopracciglia === 'su' ? -3 : 0, giu = p.sopracciglia === 'giu';
  if (donna) g.push(path(giu ? `M${F(-10.5)} -20 Q${F(-6)} -22.5 ${F(-2.5)} -19.5 M${F(2.5)} -19.5 Q${F(6)} -22.5 ${F(10.5)} -20` : `M${F(-10.5)} ${-20.5 + alto} Q${F(-6.5)} ${-24.5 + alto} ${F(-2.5)} ${-21.5 + alto} M${F(2.5)} ${-21.5 + alto} Q${F(6.5)} ${-24.5 + alto} ${F(10.5)} ${-20.5 + alto}`, L));
  else g.push(path(giu ? `M${F(-12)} -23 L${F(-2)} -19 L${F(-2)} -17 L${F(-12)} -21 Z M${F(2)} -19 L${F(12)} -23 L${F(12)} -21 L${F(2)} -17 Z`
    : `M${F(-12)} ${-21 + alto} Q${F(-7)} ${-25 + alto} ${F(-2)} ${-22 + alto} L${F(-2)} ${-20 + alto} Q${F(-7)} ${-23 + alto} ${F(-12)} ${-19 + alto} Z M${F(2)} ${-22 + alto} Q${F(7)} ${-25 + alto} ${F(12)} ${-21 + alto} L${F(12)} ${-19 + alto} Q${F(7)} ${-23 + alto} ${F(2)} ${-20 + alto} Z`, 'v-capelli'));
  // occhi: nella figura femminile un po' più grandi, con le ciglia sulla palpebra
  const oc = donna ? 5 : 4.5;
  for (const cx of [F(donna ? -6 : -6.5), F(donna ? 6 : 6.5)]) {
    g.push(path(`M${cx - oc} -15 Q${cx} -19.5 ${cx + oc} -15 Q${cx} -11.5 ${cx - oc} -15 Z`, 'v-bianco'));
    g.push(`<circle cx="${cx + 0.8}" cy="-15.1" r="1.9" class="v-nero"/><circle cx="${cx + 1.4}" cy="-15.8" r="0.6" class="v-bianco"/>`);
    g.push(path(`M${cx - oc - 0.5} -15.2 Q${cx} -20.5 ${cx + oc + 0.5} -15.2`, L), path(`M${cx - 3.5} -12.8 Q${cx} -11.4 ${cx + 3.5} -12.8`, FINE));
    if (donna) g.push(path(`M${cx + 5} -15.6 l2.2 -1.4 M${cx + 3.8} -17.6 l1.6 -1.8 M${cx - 5} -15.6 l-1.6 -1`, FINE));
  }
  // naso (più piccolo nella figura femminile)
  g.push(path(donna ? `M${F(1)} -11 Q${F(-1.5)} -5 ${F(0.5)} -3 Q${F(2)} -2.2 ${F(3.5)} -3.2` : `M${F(1)} -13 Q${F(-2.5)} -5 ${F(0.5)} -2.5 Q${F(2.5)} -1.5 ${F(4.5)} -2.8`, FINE));
  if (p.baffi) g.push(path(`M${F(-9)} 1.5 Q${F(0)} -3.5 ${F(9)} 1.5 Q${F(4)} 4 ${F(0)} 2 Q${F(-4)} 4 ${F(-9)} 1.5 Z`, `v-capelli ${T}`));
  // bocca: labbro superiore disegnato nella figura femminile, inferiore pieno
  const pieno = donna ? 1.5 : 1, dy = donna ? 0.5 : 0;
  if (p.bocca === 'su' && p.braccia === 'su') g.push(path(`M${F(-6)} ${4 + dy} Q${F(0)} ${13 + dy} ${F(6)} ${4 + dy} Z`, `v-nero ${T}`), path(`M${F(-5)} ${4.6 + dy} Q${F(0)} ${6 + dy} ${F(5)} ${4.6 + dy} L${F(4.5)} ${6.2 + dy} Q${F(0)} ${7.6 + dy} ${F(-4.5)} ${6.2 + dy} Z`, 'v-bianco'));
  else {
    const labbro = p.bocca === 'giu' ? `M${F(-5.5)} ${8 + dy} Q${F(0)} ${3 + dy} ${F(5.5)} ${8 + dy}` : p.bocca === 'dritta' ? `M${F(-5)} ${6 + dy} Q${F(0)} ${5.5 + dy} ${F(5)} ${6 + dy}` : `M${F(-5.5)} ${4 + dy} Q${F(0)} ${9 + dy} ${F(5.5)} ${4 + dy}`;
    const sotto = (p.bocca === 'giu' ? 9.5 : p.bocca === 'dritta' ? 7 : 7.5) + dy;
    if (donna) { const sopra = sotto - 2.6; g.push(path(`M${F(-4)} ${sopra + 0.8} Q${F(-2)} ${sopra - 0.8} ${F(0)} ${sopra} Q${F(2)} ${sopra - 0.8} ${F(4)} ${sopra + 0.8} Q${F(0)} ${sopra + 1.4} ${F(-4)} ${sopra + 0.8} Z`, 'v-rosa')); }
    g.push(path(`M${F(-3.5)} ${sotto} Q${F(0)} ${sotto + 2.6 * pieno} ${F(3.5)} ${sotto} Q${F(0)} ${sotto + 1} ${F(-3.5)} ${sotto} Z`, donna ? 'v-rosa' : 'v-ombra-pelle'));
    g.push(path(labbro, FINE));
  }
  // mano alla nuca: sopra i capelli, dietro l'orecchio, in asse con l'avambraccio
  if (nuca) g.push(mano(nuca.w[0] - 4, nuca.w[1] - 4, Math.atan2(nuca.w[1] - nuca.e[1], nuca.w[0] - nuca.e[0]) * 180 / Math.PI + 90, 1.05));
  const peso = p.peso ?? 0;
  return `<g transform="translate(${p.x} ${p.y}) scale(${s})" data-braccia="${p.braccia ?? ''}" data-sopracciglia="${p.sopracciglia ?? ''}"><g transform="rotate(${peso} 0 130)">${g.join('')}</g></g>`;
}
