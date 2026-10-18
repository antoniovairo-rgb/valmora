// C117B01 nelle tavole del finale (PO: «manca un braccio all'uomo - verifica la donna»): ogni busto (src/resa/busto.tsx,
// copia di persona2.ts di S-01) ha due braccia, una a sinistra e una a destra, che partono entro 6 unità dalla spalla e
// sono disegnate dopo il busto (salvo le braccia alzate della festa, dichiarate dietro). Si provano tutte le pose per uomo,
// donna e vice, e le tavole come le disegna il gioco. Rosso __NO_C117B01: come nella quarta prova.
import { afterEach, describe, expect, it } from 'vitest';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Busto, spallaDi, type BustoProps } from '../src/resa/busto.tsx';
import { TAVOLE, TavolaBar, TavolaFilo } from '../src/resa/tavole-finale.tsx';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C117B01; });
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
  it('braccio rosso: senza la correzione la mano alla nuca perde un braccio e stacca l\'altro', () => {
    g.__NO_C117B01 = true;
    const male = tutte();
    expect(male.some((x) => x.includes('posa nuca corti') && x.includes('0 braccia sx'))).toBe(true);
    expect(male.some((x) => x.includes('posa nuca lunghi') && x.includes('prima del busto'))).toBe(true);
  });
});
