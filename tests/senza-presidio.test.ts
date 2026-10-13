// PO-095: «Non è vero che erano senza steward» / «squadra e steward c'erano». Una chiamata che dice che in un settore
// non c'è nessuno si apre solo se lì non hai schierato nessuno (campo «senza»). Rosso __NO_PO095.
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, inCampo, iniziaMissione, missioneFinita, rispondi, schiera, chiudiOndata, opzioniValide } from '../src/logica/missione.ts';
import { attenta, casuale } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const ms = Object.entries(d).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m as Missione);
const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_PO095; });

/** Quante chiamate «senza» si aprono con unità presenti nel settore (contraddizione), su partite casuali e attente. */
const contraddizioni = () => {
  let viste = 0, false_ = 0;
  for (const m of ms) for (let k = 1; k <= 30; k++) {
    const caso = creaCaso(`po095:${m.id}:${k}`); const g1 = k % 2 ? casuale(caso, dich) : attenta(caso, dich);
    let s = iniziaMissione(m, v0, dich);
    while (!missioneFinita(m, s)) {
      s = schiera(m, s, g1.schiera(m, s));
      for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
        if (c.senza) {
          viste++;
          const presenti = Object.entries(inCampo(s, s.disposizione!)).some(([r, ps]) => (!c.senza!.risorse || c.senza!.risorse.includes(r)) && (ps[c.senza!.settore] ?? 0) > 0);
          if (presenti) false_++;
        }
        s = rispondi(m, s, c.id, caso.scegli(opzioniValide(c, s, m)).id, dich);
      }
      s = chiudiOndata(m, s, dich);
    }
  }
  return { viste, false_ };
};

describe('chiamate «senza nessuno» coerenti con lo schieramento (PO-095)', () => {
  it('nessuna chiamata dice «non c\'è nessuno» dove hai schierato unità', () => {
    const x = contraddizioni(); console.log(`PO-095: chiamate «senza» aperte ${x.viste}, contraddette dallo schieramento ${x.false_}`);
    expect(x.viste).toBeGreaterThan(0); expect(x.false_).toBe(0);
  });
  it('braccio rosso __NO_PO095: senza il controllo alcune si aprono con le unità sul posto', () => {
    g.__NO_PO095 = true; expect(contraddizioni().false_).toBeGreaterThan(0);
  });
});

// Guardiano sui testi: una chiamata che afferma un settore sguarnito deve avere «senza». Eccezioni lette una per una:
// supplementari (e03, «scoperto» = venuto a sapere), coro_steward (coro sugli spalti), coreografia, furgone_coinvolto
// («nessuno a bordo»), viso_scoperto (il volto del Fabbro).
const ECCEZIONI = new Set(['supplementari', 'coro_steward', 'coreografia', 'furgone_coinvolto', 'viso_scoperto']);
const SGUARNITO = /senza (steward|squadr|nessun|controll|presidi)|non c'è nessuno|nessuno (ai|al|sul|in|a )|sguarnit|nessun agente|nessuna squadra|nessuno steward/i;
it('PO-095: ogni chiamata che dice «non c\'è nessuno» ha la condizione «senza»', () => {
  const mancano: string[] = [];
  for (const m of ms) for (const o of m.ondate) for (const c of o.chiamate ?? []) {
    const testo = String(d[`testi/it/${m.id}.json`] ? (d[`testi/it/${m.id}.json`] as Record<string, string>)[c.testo.replace('testi:', '')] ?? '' : '');
    if (SGUARNITO.test(testo) && !c.senza && !ECCEZIONI.has(c.id)) mancano.push(`${m.id}/${c.id}`);
  }
  expect(mancano).toEqual([]);
});
