// Collaudo C-044 (D-201), rilievi di S-17. Ogni guardiano ha il suo braccio rosso globalThis.__NO_C44xx, che rimette i dati
// o i testi di 0.44.0 (tests/dati/c44-prima.json).
// - C44-01 un solo modello di imprevisto in tutti i 36 episodi (modelloImprevisto, src/dati/imprevisti.ts): nessuna unità
//   impegnata, «lascia correre» senza effetti. Rosso C4401: e01–e06 di prima (16 con unità, 13 «lascia correre» con effetto).
// - C44-03 (D-190) nessuna scadenza nella chiamata di un imprevisto («fra dieci minuti», «fra poco»). Rosso C4403.
// - C44-04 e31 «abbassa»: il costo nomina il settore che la tensione tocca (piazzale), non la curva. Rosso C4404.
// - C44-07 costi di «lascia correre» tutti diversi (soglia: nessuna frase ripetuta). Rosso C4407: 9 frasi per 43 costi.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { controllaImprevisti, type FileImprevisti } from '../src/dati/imprevisti.ts';

const g = globalThis as Record<string, unknown>;
const ROSSI = ['C4401', 'C4403', 'C4404', 'C4407'];
afterEach(() => { for (const x of ROSSI) delete g[`__NO_${x}`]; });
const d = leggiDati() as Record<string, unknown>;
const PRIMA = JSON.parse(readFileSync('tests/dati/c44-prima.json', 'utf8')) as { imprevisti: Record<string, FileImprevisti>; testi: Record<string, string> };
const TUTTI: Record<string, string> = Object.assign({}, ...Object.entries(d).filter(([k]) => k.startsWith('testi/it/')).map(([, t]) => t));
const testo = (k: string, rosso: string) => (g[`__NO_${rosso}`] && k in PRIMA.testi ? PRIMA.testi[k]! : TUTTI[k] ?? '');
const chiave = (k: string) => k.replace(/^testi:/, '');
const imprevisti = (rosso?: string): FileImprevisti[] => Object.entries(d).filter(([k]) => k.startsWith('imprevisti/'))
  .map(([, f]) => { const id = (f as FileImprevisti).id; return rosso && g[`__NO_${rosso}`] && PRIMA.imprevisti[id] ? PRIMA.imprevisti[id] : f as FileImprevisti; });

describe('C44-01 lo stesso modello di imprevisto in tutti i 36 episodi', () => {
  const problemi = () => controllaImprevisti({ ...d, ...Object.fromEntries(imprevisti('C4401').map((f) => [`imprevisti/${f.id}.json`, f])) });
  it('verde: nessun problema su 36 episodi e 142 imprevisti; rosso C4401: le 16 unità e i 13 «lascia correre» di e01–e06', () => {
    expect(imprevisti().length).toBe(36);
    expect(imprevisti().reduce((s, f) => s + f.imprevisti.length, 0)).toBe(142);
    expect(problemi()).toEqual([]);
    g.__NO_C4401 = true;
    const rosso = problemi();
    expect(new Set(rosso.filter((x) => x.includes('riserva')).map((x) => x.split('.opzioni')[0])).size).toBe(16);
    expect(rosso.filter((x) => x.includes('«lascia correre» senza effetti')).length).toBe(13);
  });
});

describe('C44-03 nessuna scadenza nella chiamata di un imprevisto (D-190)', () => {
  const RE = /\b(fra|tra|entro) (poco|qualche|pochi|un|una|mezz'ora|\d+|due|tre|cinque|dieci|venti|trenta)\b/i;
  const scadenze = () => imprevisti().flatMap((f) => f.imprevisti.map((x) => chiave(x.chiamata.testo))).filter((k) => RE.test(testo(k, 'C4403')));
  it('verde: nessuna; rosso C4403: e10 «fra dieci minuti» ed e16 «fra poco»', () => {
    expect(scadenze()).toEqual([]);
    g.__NO_C4403 = true;
    expect(scadenze()).toEqual(['e10.imp.cantiere', 'e16.imp.buca']);
  });
});

describe('C44-04 e31 «abbassa»: il costo parla del settore che si scalda', () => {
  const coerente = () => {
    const o = imprevisti().find((f) => f.id === 'e31')!.imprevisti.flatMap((x) => x.chiamata.opzioni).find((x) => x.id === 'abbassa')!;
    expect(o.effetti).toEqual([{ pressione: 'piazzale', valore: -1 }, { tensione: 'piazzale', valore: 1 }]);
    const t = testo(chiave(o.costo!), 'C4404');
    return /piazzale/i.test(t) && !/curva|Skyfield/i.test(t);
  };
  it('verde: nomina il piazzale e non la curva; rosso C4404: «la curva Skyfield si offende»', () => {
    expect(coerente()).toBe(true);
    g.__NO_C4404 = true; expect(coerente()).toBe(false);
  });
});

describe('C44-07 costi di «lascia correre» variati', () => {
  const SOGLIA = 1; // volte che la stessa frase può comparire: nessuna ripetizione
  const ripetute = () => {
    const n = new Map<string, number>();
    for (const f of imprevisti()) for (const x of f.imprevisti) { const t = testo(chiave(x.chiamata.opzioni[2]!.costo!), 'C4407'); n.set(t, (n.get(t) ?? 0) + 1); }
    const r = [...n].filter(([, v]) => v > SOGLIA);
    return { frasi: r.length, costi: r.reduce((s, [, v]) => s + v, 0) };
  };
  it(`verde: nessuna frase oltre ${SOGLIA}; rosso C4407: 9 frasi per 43 costi`, () => {
    expect(ripetute()).toEqual({ frasi: 0, costi: 0 });
    g.__NO_C4407 = true;
    expect(ripetute()).toEqual({ frasi: 9, costi: 43 });
  });
});
