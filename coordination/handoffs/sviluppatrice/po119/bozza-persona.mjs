// Bozza PO-119: Persona ridisegnata (stile C), come stringa SVG, per le tavole. Poi va portata in vignetta.tsx.
export function persona(p) {
  const s = (p.s ?? 1) * 0.95, vice = p.capelli === 'berretto';
  const bocca = p.bocca === 'giu' ? 'M-6 8 Q0 2 6 8' : p.bocca === 'dritta' ? 'M-5 6 L5 6' : 'M-6 4 Q0 10 6 4';
  const ciglia = p.sopracciglia === 'su' ? 'M-11 -22 q4 -4 8 -1 M3 -23 q4 -1 8 1' : p.sopracciglia === 'giu' ? 'M-11 -17 L-3 -21 M3 -21 L11 -17' : 'M-11 -19 q4 -3 8 0 M3 -19 q4 -3 8 0';
  const g = [];
  // braccia alzate dietro il busto
  if (p.braccia === 'su') g.push(`<path d="M-38 50 L-56 4 L-45 0 L-28 44 Z M38 50 L56 4 L45 0 L28 44 Z" class="${p.giacca} v-tratto"/><circle cx="-51" cy="-2" r="6" class="v-pelle v-tratto"/><circle cx="51" cy="-2" r="6" class="v-pelle v-tratto"/>`);
  // busto con spalle vere e ombra a retino
  g.push(`<path d="M-48 98 Q-52 48 -34 34 L-10 26 L0 36 L10 26 L34 34 Q52 48 48 98 Z" class="${p.giacca} v-tratto"/>`);
  g.push(`<path d="M16 30 Q46 42 48 98 L24 98 Q30 60 16 30 Z" class="v-ombra"/>`);
  // camicia e cravatta (vice: camicia scura, niente cravatta)
  g.push(`<path d="M-10 26 L0 50 L10 26 Z" class="${vice ? 'v-giacca-scura' : 'v-bianco'} v-tratto"/>`);
  if (!vice) g.push(`<path d="M-3 34 L3 34 L5 58 L0 64 L-5 58 Z" class="v-nero"/>`);
  // colletto
  g.push(`<path d="M-11 25 L-17 37 L-3 40 Z M11 25 L17 37 L3 40 Z" class="${vice ? 'v-giacca-scura' : 'v-bianco'} v-tratto"/>`);
  // spalline
  g.push(`<path d="M-45 38 L-27 32 L-25 38 L-43 44 Z M45 38 L27 32 L25 38 L43 44 Z" class="v-giallo v-tratto"/>`);
  // distintivo e taschini
  if (p.distintivo) g.push(`<path d="M-30 52 l6 -4 l6 4 l-1 8 l-5 3 l-5 -3 Z" class="v-giallo v-tratto"/>`);
  g.push(`<path d="M-36 70 h14 M22 70 h14" class="v-linea"/>`);
  // collo e testa (più piccola), orecchie, ombra della mandibola
  g.push(`<path d="M-7 8 L-7 26 Q0 31 7 26 L7 8" class="v-pelle v-tratto"/>`);
  g.push(`<path d="M-17 -14 Q-18 -39 0 -40 Q18 -39 17 -14 Q17 6 0 15 Q-17 6 -17 -14 Z" class="v-pelle v-tratto"/>`);
  g.push(`<path d="M5 -36 Q17 -30 16 -12 Q15 6 2 13 Q11 -2 10 -18 Z" class="v-ombra"/>`);
  g.push(`<path d="M-17 -16 q-6 1 -4 8 q2 4 6 2 M17 -16 q6 1 4 8 q-2 4 -6 2" class="v-pelle v-tratto"/>`);
  // capelli con volume e ciocche
  if (p.capelli === 'corti') g.push(`<path d="M-18 -14 Q-24 -44 -2 -48 Q14 -52 20 -40 Q24 -30 19 -16 Q17 -27 9 -31 Q10 -24 3 -25 Q2 -34 -7 -32 Q-6 -25 -12 -25 Q-15 -21 -18 -14 Z" class="v-capelli v-tratto"/><path d="M-8 -44 Q-1 -40 -3 -32 M6 -46 Q13 -41 10 -33 M14 -43 Q19 -37 17 -30" class="v-linea"/>`);
  if (p.capelli === 'lunghi') g.push(`<path d="M-18 -12 Q-25 -44 0 -45 Q25 -44 18 -12 L23 20 Q19 28 12 23 L13 -6 Q11 -27 1 -31 Q-6 -22 -15 -21 L-13 23 Q-19 28 -23 20 Z" class="v-capelli v-tratto"/><path d="M-11 -38 Q-5 -32 -8 -24 M5 -40 Q11 -33 9 -26 M-19 2 Q-17 12 -20 18 M19 2 Q17 12 20 18" class="v-linea"/>`);
  if (vice) g.push(`<path d="M-19 -18 Q-20 -40 0 -41 Q20 -40 19 -18 Z" class="v-giacca-scura v-tratto"/><path d="M-21 -18 H25 L34 -13 L-19 -12 Z" class="v-nero v-tratto"/><path d="M-5 -36 l5 -4 l5 4 l-1 6 l-4 3 l-4 -3 Z" class="v-giallo v-tratto"/>`);
  // volto: sopracciglia, occhi con la luce, naso, baffi, bocca
  g.push(`<path d="${ciglia}" class="v-linea" data-sopracciglia="${p.sopracciglia ?? ''}"/>`);
  g.push(`<ellipse cx="-6" cy="-12" rx="1.9" ry="2.5" class="v-nero"/><ellipse cx="6" cy="-12" rx="1.9" ry="2.5" class="v-nero"/><circle cx="-5.4" cy="-12.9" r="0.7" class="v-bianco"/><circle cx="6.6" cy="-12.9" r="0.7" class="v-bianco"/>`);
  g.push(`<path d="M1 -11 Q-3 -3 0 -1 Q2 0 3 -1" class="v-linea"/>`);
  if (p.baffi) g.push(`<path d="M-9 2 Q0 -3 9 2 Q4 4 0 2 Q-4 4 -9 2 Z" class="v-capelli v-tratto"/>`);
  g.push(`<path d="${bocca}" class="v-linea"/>`);
  if (p.braccia === 'nuca') g.push(`<path d="M34 56 L44 20 L28 -14 L18 -10 L33 20 L24 50 Z" class="${p.giacca} v-tratto"/><circle cx="22" cy="-14" r="6" class="v-pelle v-tratto"/>`);
  return `<g transform="translate(${p.x} ${p.y + 8}) scale(${s})" data-braccia="${p.braccia ?? ''}">${g.join('')}</g>`;
}
