// D-176 (segnalazione di S-11 via principale): ogni vignetta con i protagonisti (guida, chiamata del vice, rapporto,
// verbale) li disegna con persona2.ts (quarta prova, data-persona="4"), mai con un disegno vecchio. Rosso __NO_C114P01
// (disegno della 0.38.0): nessuna figura della quarta prova.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { VignettaGuida } from '../src/resa/vignette-guida.tsx';
import { VignettaChiamata } from '../src/resa/vignette-chiamata.tsx';
import { VignettaEsito, VignettaOndata } from '../src/resa/vignette-gioco.tsx';
import type { Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C114P01; });
const m = JSON.parse(readFileSync('data/missioni/e01.json', 'utf8')) as Missione;

/** Figure dei protagonisti attese per vignetta (misurate su e3e3fe4) e figure della quarta prova trovate. */
function conta() {
  const casi: [string, ReactElement, number][] = [];
  for (const genere of ['m', 'f'] as const) {
    casi.push([`guida 2 ${genere}`, createElement(VignettaGuida, { n: 2, genere }), 2], [`guida 4 ${genere}`, createElement(VignettaGuida, { n: 4, genere }), 1]);
    for (const tono of ['calmo', 'teso', 'critico'] as const) casi.push([`rapporto ${tono} ${genere}`, createElement(VignettaOndata, { tono, genere }), 2]);
    for (const tono of ['bene', 'medio', 'male', 'fallita'] as const) casi.push([`verbale ${tono} ${genere}`, createElement(VignettaEsito, { m, tono, genere }), 2]);
  }
  for (const o of m.ondate) for (const c of o.chiamate ?? []) if (c.fonte === 'vice') casi.push([`chiamata vice ${c.id}`, createElement(VignettaChiamata, { m, c }), 1]);
  return casi.map(([n, el, attese]) => { const h = renderToStaticMarkup(el); return { n, attese, quarta: (h.match(/data-persona="4"/g) ?? []).length, altre: (h.match(/data-persona="(?!4")/g) ?? []).length }; });
}

describe('protagonisti della quarta prova in ogni vignetta', () => {
  it('verde: tutte le figure attese sono della quarta prova', () => {
    const c = conta(); expect(c.length).toBe(21); // 2 generi × (2 guida + 3 rapporti + 4 verbali) + 3 chiamate del vice
    expect(c.filter((x) => x.quarta !== x.attese || x.altre > 0).map((x) => `${x.n}: ${x.quarta}/${x.attese}`)).toEqual([]);
  });
  it('rosso C114P01: nessuna figura della quarta prova', () => {
    g.__NO_C114P01 = true;
    expect(conta().filter((x) => x.quarta !== x.attese).length).toBe(21);
  });
});
