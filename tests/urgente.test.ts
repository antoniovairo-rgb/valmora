// D-129 (C26-10, PO-112): spicchio e «Urgente!» solo se un evento in corso sul settore della chiamata, nella sua ondata,
// ha pressione ≥ 4 (src/resa/vignette-evento.tsx). Rosso __NO_C82U01: la regola di D-126 c (un evento qualsiasi).
import { readdirSync, readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { urgente } from '../src/resa/vignette-evento.tsx';
import { valuta } from '../src/logica/condizioni.ts';
import type { Chiamata, Missione, Variabili } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C82U01; delete g.__NO_C50S01; });
const missioni = readdirSync('data/missioni').map((f) => JSON.parse(readFileSync(`data/missioni/${f}`, 'utf8')) as Missione);
const chiamate = missioni.flatMap((m) => m.ondate.flatMap((o) => (o.chiamate ?? []).map((c) => ({ m, o, c: c as Chiamata }))));
// ricalcolo indipendente: eventi dell'ondata sul settore, con «se» vero (tutti veri se si ignora «se»)
const eventi = (x: (typeof chiamate)[number], v?: Variabili) => (x.o.eventi ?? []).filter((e) => x.c.settore && e.settore === x.c.settore && (!e.se || !v || valuta(e.se, v)));
const quota = (f: (x: (typeof chiamate)[number]) => boolean) => chiamate.filter(f).length;

describe('D-129 urgenza solo con pressione ≥ 4', () => {
  it('ogni chiamata: urgente se e solo se un evento del suo settore e della sua ondata ha pressione ≥ 4', () => {
    g.__NO_C50S01 = true; // «se» ignorato: ogni evento conta, il caso più largo
    for (const x of chiamate) expect(urgente(x.m, x.c), `${x.m.id} ${x.c.id}`).toBe(eventi(x).some((e) => e.pressione >= 4));
    const prima = quota((x) => eventi(x).length > 0), dopo = quota((x) => eventi(x).some((e) => e.pressione >= 4));
    console.log(`D-129, «se» ignorato: urgenti ${prima}/${chiamate.length} con D-126 c, ${dopo}/${chiamate.length} con pressione ≥ 4`);
    expect(dopo).toBeLessThan(prima);
  });
  it('braccio rosso __NO_C82U01: urgente con un evento qualsiasi, come D-126 c', () => {
    g.__NO_C50S01 = true; g.__NO_C82U01 = true;
    const diverse = chiamate.filter((x) => urgente(x.m, x.c) !== eventi(x).some((e) => e.pressione >= 4));
    expect(diverse.length).toBeGreaterThan(0);
    for (const x of chiamate) expect(urgente(x.m, x.c)).toBe(eventi(x).length > 0);
  });
});
