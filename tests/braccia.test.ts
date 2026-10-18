// C117B01 (PO: «manca un braccio all'uomo - verifica la donna»): in ogni vignetta di fine ondata e di fine episodio,
// per ogni figura (protagonista uomo o donna, vice) ci sono due braccia, una a sinistra e una a destra, e ognuna parte
// entro 6 unità dalla sua spalla ed è disegnata dopo il busto (salvo le braccia alzate della festa, dichiarate dietro). Nella posa «mano alla nuca» (rapporto critico, verbale male) il braccio alzato non si
// attaccava alla spalla e l'altro mancava. Rosso __NO_C117B01: come nella quarta prova.
import { afterEach, describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { VignettaEsito, VignettaOndata } from '../src/resa/vignette-gioco.tsx';
import { spallaDi } from '../src/resa/persona2.ts';
import type { Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C117B01; });
const m = JSON.parse(readFileSync('data/missioni/e01.json', 'utf8')) as Missione;
const N = 6;

function errori() {
  const male: string[] = [];
  const casi = [...(['calmo', 'teso', 'critico'] as const).flatMap((t) => (['m', 'f'] as const).map((genere) => [`rapporto ${t} ${genere}`, createElement(VignettaOndata, { tono: t, genere })] as const)),
    ...(['bene', 'medio', 'male', 'fallita'] as const).flatMap((t) => (['m', 'f'] as const).map((genere) => [`verbale ${t} ${genere}`, createElement(VignettaEsito, { m, tono: t, genere })] as const))];
  for (const [nome, el] of casi) {
    const html = renderToStaticMarkup(el), figure = html.split('data-persona=').slice(1);
    if (figure.length !== 2) { male.push(`${nome}: ${figure.length} figure`); continue; }
    figure.forEach((f, i) => {
      const chi = i === 0 ? (nome.endsWith(' f') ? 'lunghi' : 'corti') : 'berretto';
      const br = [...f.matchAll(/data-braccio="(sx|dx)" data-spalla="([-\d.]+) ([-\d.]+)"( data-dietro="1")?/g)], busto = f.indexOf('data-busto');
      // un braccio disegnato prima del busto resta nascosto alla spalla (anello staccato), salvo quelli dichiarati dietro
      for (const x of br) if (!x[4] && (busto < 0 || (x.index ?? 0) < busto)) male.push(`${nome} ${i ? 'vice' : 'protagonista'}: braccio ${x[1]} disegnato prima del busto`);
      for (const [lato, k] of [['sx', -1], ['dx', 1]] as const) {
        const b = br.filter((x) => x[1] === lato);
        if (b.length !== 1) { male.push(`${nome} ${i ? 'vice' : 'protagonista'}: ${b.length} braccia ${lato}`); continue; }
        const [sx, sy] = spallaDi(chi as 'corti', k), d = Math.hypot(Number(b[0]![2]) - sx, Number(b[0]![3]) - sy);
        if (d > N) male.push(`${nome} ${i ? 'vice' : 'protagonista'}: braccio ${lato} a ${d.toFixed(1)} unità dalla spalla`);
      }
    });
  }
  return male;
}

describe('C117B01 due braccia attaccate alle spalle in ogni vignetta', () => {
  it('verde: nessun errore su 7 toni × uomo/donna, col vice', () => { expect(errori()).toEqual([]); });
  it('rosso: manca il braccio sinistro del protagonista nella mano alla nuca', () => {
    g.__NO_C117B01 = true;
    const e = errori(); if (process.env.MOSTRA) console.log(e.join('\n'));
    expect(e.length).toBe(8); // 4 vignette (critico, male × uomo, donna): braccio sinistro assente e destro prima del busto
  });
});
