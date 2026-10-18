// C117B01 nelle tavole del finale (PO: «manca un braccio all'uomo - verifica la donna»): ogni busto (src/resa/busto.tsx,
// copia di persona2.ts di S-01) ha due braccia, una a sinistra e una a destra, che partono entro 6 unità dalla spalla e
// sono disegnate dopo il busto (salvo le braccia alzate della festa, dichiarate dietro). Si provano tutte le pose per uomo,
// donna e vice, e le tavole come le disegna il gioco. Rosso __NO_C117B01: come nella quarta prova.
// PO-137 (C118S01): nessun braccio con spigoli al polso o alla spalla. Rosso __NO_C118S01: il contorno di prima.
import { afterEach, describe, expect, it } from 'vitest';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Busto, spallaDi, type BustoProps } from '../src/resa/busto.tsx';
import { TAVOLE, TavolaBar, TavolaFilo } from '../src/resa/tavole-finale.tsx';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C117B01; delete g.__NO_C118S01; });
const N = 6;
const CAPELLI = ['corti', 'lunghi', 'berretto'] as const;
const POSE = [undefined, 'su', 'nuca', 'conserte', 'cinturone'] as const;

/** Problemi delle braccia in un pezzo di SVG con uno o più busti (ognuno nel suo <g data-busto="…">). */
export function braccia(nome: string, html: string): string[] {
  const male: string[] = [];
  for (const f of html.split('<g data-busto="').slice(1)) {
    const chi = f.slice(0, f.indexOf('"')) as BustoProps['capelli'];
    const br = [...f.matchAll(/data-braccio="(sx|dx)" data-spalla="([-\d.]+) ([-\d.]+)"( data-dietro="1")?/g)], busto = f.indexOf('data-busto="1"');
    for (const x of br) if (!x[4] && (busto < 0 || (x.index ?? 0) < busto)) male.push(`${nome} ${chi}: braccio ${x[1]} disegnato prima del busto`);
    for (const [lato, k] of [['sx', -1], ['dx', 1]] as const) {
      const b = br.filter((x) => x[1] === lato);
      if (b.length !== 1) { male.push(`${nome} ${chi}: ${b.length} braccia ${lato}`); continue; }
      const [sx, sy] = spallaDi(chi, k), d = Math.hypot(Number(b[0]![2]) - sx, Number(b[0]![3]) - sy);
      if (d > N) male.push(`${nome} ${chi}: braccio ${lato} a ${d.toFixed(1)} unità dalla spalla`);
    }
  }
  return male;
}

// PO-137 (C118S01): svolta massima del contorno di un braccio, copiata da tests/braccia.test.ts di S-01 (032ff92).
/** PO-137 (C118S01): svolta massima, in gradi, fra un tratto e il successivo del contorno di un braccio (M, Q, L, Z).
 *  Un contorno raccordato ha svolte vicine a 0; uno spigolo è una svolta brusca. */
function svoltaMassima(d: string): number {
  const t = d.match(/[MQLZ]|-?[\d.]+/g) ?? [], seg: { a: [number, number]; b: [number, number] }[] = [];
  let i = 0, cur: [number, number] = [0, 0], ini: [number, number] = [0, 0];
  const n = () => Number(t[i++]);
  while (i < t.length) {
    const c = t[i++];
    if (c === 'M') { cur = [n(), n()]; ini = cur; }
    else if (c === 'Q') { const k: [number, number] = [n(), n()], e: [number, number] = [n(), n()]; seg.push({ a: [k[0] - cur[0], k[1] - cur[1]], b: [e[0] - k[0], e[1] - k[1]] }); cur = e; }
    else if (c === 'L') { const e: [number, number] = [n(), n()]; seg.push({ a: [e[0] - cur[0], e[1] - cur[1]], b: [e[0] - cur[0], e[1] - cur[1]] }); cur = e; }
    else if (c === 'Z') { if (Math.hypot(ini[0] - cur[0], ini[1] - cur[1]) > 0.05) seg.push({ a: [ini[0] - cur[0], ini[1] - cur[1]], b: [ini[0] - cur[0], ini[1] - cur[1]] }); cur = ini; }
  }
  let max = 0;
  seg.forEach((x, j) => { const y = seg[(j + 1) % seg.length]!, u = x.b, v = y.a, lu = Math.hypot(u[0], u[1]), lv = Math.hypot(v[0], v[1]);
    if (lu < 0.05 || lv < 0.05) return; const c = Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (lu * lv))); max = Math.max(max, Math.acos(c) * 180 / Math.PI); });
  return max;
}
const SOGLIA = 30; // gradi, come in tests/braccia.test.ts
function spigoli() {
  const html = [...CAPELLI.flatMap((capelli) => POSE.map((posa) => svg(createElement(Busto, { x: 0, y: 0, giacca: 'v-ciano', capelli, braccia: posa })))),
    ...(['m', 'f'] as const).map((genere) => renderToStaticMarkup(createElement(TavolaBar, { genere, carriera: 'prorogato', numeri: [] })))].join('');
  const v = [...html.matchAll(/<path d="([^"]+)" class="[^"]*" data-arto="1"/g)].map((x) => svoltaMassima(x[1]!));
  return { braccia: v.length, spigoli: v.filter((x) => x > SOGLIA).length };
}

const svg = (el: ReactElement) => renderToStaticMarkup(createElement('svg', null, el));
function tutte() {
  const male: string[] = [];
  for (const capelli of CAPELLI) for (const posa of POSE) male.push(...braccia(`posa ${posa ?? 'riposo'}`, svg(createElement(Busto, { x: 0, y: 0, giacca: 'v-ciano', capelli, braccia: posa }))));
  for (const genere of ['m', 'f'] as const) male.push(...braccia(`tavola bar ${genere}`, renderToStaticMarkup(createElement(TavolaBar, { genere, carriera: 'prorogato', numeri: [] }))));
  for (const [tavola] of TAVOLE) male.push(...braccia(`tavola ${tavola}`, renderToStaticMarkup(createElement(TavolaFilo, { tavola, valore: tavola === 'fabbro' ? 'rispetto' : tavola === 'testimone' ? 'protetto' : tavola === 'talpa' ? 3 : 'procura' }))));
  return male;
}

describe('braccia nelle tavole del finale (C117B01)', () => {
  it('ogni busto, in ogni posa e in ogni tavola, ha due braccia attaccate alle spalle e disegnate dopo il busto', () => {
    expect(tutte()).toEqual([]);
  });
  it('PO-137: nessun braccio con spigoli (svolta oltre 30°); rosso C118S01: gli spigoli di prima', () => {
    const verde = spigoli();
    expect(verde.braccia).toBeGreaterThan(0);
    expect(verde.spigoli).toBe(0);
    g.__NO_C118S01 = true;
    expect(spigoli().spigoli).toBe(verde.braccia);
  });
  it('braccio rosso: senza la correzione la mano alla nuca perde un braccio e stacca l\'altro', () => {
    g.__NO_C117B01 = true;
    const male = tutte();
    expect(male.some((x) => x.includes('posa nuca corti') && x.includes('0 braccia sx'))).toBe(true);
    expect(male.some((x) => x.includes('posa nuca lunghi') && x.includes('prima del busto'))).toBe(true);
  });
});
