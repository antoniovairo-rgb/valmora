// PO-094 (D-113): «la fiducia cala troppo?». Misurato: chi proteggeva la città perdeva fiducia e chi assecondava ne
// guadagnava (peggiore sopra equilibrata in 26 episodi su 36). Ora l'ondata premia il risultato: il peggiore non supera mai
// chi bilancia sicurezza e fiducia.
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { giocaMissione } from '../src/logica/missione.ts';
import { STRATEGIE } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const ms = Object.entries(d).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m as Missione);
const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_PO094; });

const conta = () => {
  let sopra = 0; const f = { attenta: 0, equilibrata: 0, peggiore: 0 };
  for (const m of ms) {
    const x = Object.fromEntries((['attenta', 'equilibrata', 'peggiore'] as const).map((n) => [n, Number(giocaMissione(m, v0, dich, STRATEGIE[n]!(creaCaso(1), dich)).variabili.credito)])) as typeof f;
    if (x.peggiore > x.equilibrata) sopra++;
    for (const n of Object.keys(f) as (keyof typeof f)[]) f[n] += x[n] / ms.length;
  }
  return { sopra, f };
};

describe('fiducia che premia il risultato (PO-094)', () => {
  it('su 36 episodi il giocatore peggiore non esce mai con più fiducia di chi bilancia', () => {
    const { sopra, f } = conta();
    console.log(`PO-094 verde: peggiore sopra equilibrata ${sopra}/36 · medie attenta ${f.attenta.toFixed(1)} equilibrata ${f.equilibrata.toFixed(1)} peggiore ${f.peggiore.toFixed(1)}`);
    expect(sopra).toBe(0); expect(f.peggiore).toBeLessThan(f.attenta);
  });
  it('braccio rosso __NO_PO094: senza premio il peggiore supera chi bilancia', () => {
    g.__NO_PO094 = true;
    expect(conta().sopra).toBeGreaterThan(0);
  });
});
