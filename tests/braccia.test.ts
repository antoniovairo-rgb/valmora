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
afterEach(() => { delete g.__NO_C117B01; delete g.__NO_C118S01; });
const m = JSON.parse(readFileSync('data/missioni/e01.json', 'utf8')) as Missione;
const N = 6;

function vignette(): [string, string][] {
  const casi = [...(['calmo', 'teso', 'critico'] as const).flatMap((t) => (['m', 'f'] as const).map((genere) => [`rapporto ${t} ${genere}`, createElement(VignettaOndata, { tono: t, genere })] as const)),
    ...(['bene', 'medio', 'male', 'fallita'] as const).flatMap((t) => (['m', 'f'] as const).map((genere) => [`verbale ${t} ${genere}`, createElement(VignettaEsito, { m, tono: t, genere })] as const))];
  return casi.map(([nome, el]) => [nome, renderToStaticMarkup(el)]);
}

function errori() {
  const male: string[] = [];
  for (const [nome, html] of vignette()) {
    const figure = html.split('data-persona=').slice(1);
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

/** PO-137 (C118S01): svolta massima, in gradi, fra un tratto e il successivo del contorno di un braccio (M, Q, L, Z).
 *  Un contorno raccordato ha svolte vicine a 0; uno spigolo è una svolta brusca. */
export function svoltaMassima(d: string): number {
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
const SOGLIA = 30; // gradi: oltre questa svolta il contorno ha uno spigolo (angolo interno sotto 150°)
function spigoli() {
  const male: string[] = [];
  for (const [nome, html] of vignette()) for (const x of html.matchAll(/<path d="([^"]+)" class="[^"]*" data-arto="1"/g)) { const v = svoltaMassima(x[1]!); if (v > SOGLIA) male.push(`${nome}: braccio con uno spigolo di ${v.toFixed(0)}°`); }
  return male;
}

describe('PO-137 braccia senza spigoli in ogni vignetta', () => {
  it('verde: nessuna svolta oltre la soglia', () => {
    if (process.env.MOSTRA) { let n = 0, max = 0; for (const [, html] of vignette()) for (const x of html.matchAll(/<path d="([^"]+)" class="[^"]*" data-arto="1"/g)) { n++; max = Math.max(max, svoltaMassima(x[1]!)); } console.log(`verde: ${n} braccia, svolta massima ${max.toFixed(1)}°`); }
    expect(spigoli()).toEqual([]);
  });
  it('rosso C118S01: gli spigoli di prima', () => {
    g.__NO_C118S01 = true;
    const e = spigoli(); if (process.env.MOSTRA) console.log(`${e.length} braccia con spigoli\n${e.slice(0, 4).join('\n')}`);
    expect(e.length).toBe(68); // tutte le braccia delle 14 vignette: spigoli di circa 90° al polso e alla spalla
  });
});

describe('C117B01 due braccia attaccate alle spalle in ogni vignetta', () => {
  it('verde: nessun errore su 7 toni × uomo/donna, col vice', () => { expect(errori()).toEqual([]); });
  it('rosso: manca il braccio sinistro del protagonista nella mano alla nuca', () => {
    g.__NO_C117B01 = true;
    const e = errori(); if (process.env.MOSTRA) console.log(e.join('\n'));
    expect(e.length).toBe(8); // 4 vignette (critico, male × uomo, donna): braccio sinistro assente e destro prima del busto
  });
});
