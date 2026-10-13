// C15-03: in e18 la stampa non rimette «esposto» un testimone già protetto (D-100).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, iniziaMissione, opzioniValide, rispondi, schiera, type InCorso } from '../src/logica/missione.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const leggi = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const dich = new Map<string, Dichiarazione>(leggi('data/stato.json').variabili.map((d: Dichiarazione) => [d.id, d]));
const e18: Missione = leggi('data/missioni/e18.json');

/** Gioca e18 fino all'ondata 4 e risponde alle due chiamate nell'ordine dato. */
function percorso(m: Missione, scelte: [string, string][]): InCorso {
  let s = iniziaMissione(m, variabiliIniziali(dich.values()), dich);
  while (s.ondata < 4) {
    s = schiera(m, s, {});
    for (const c of chiamateAperte(m, s)) s = rispondi(m, s, c.id, opzioniValide(c, s, m)[0]!.id, dich);
    s = chiudiOndata(m, s, dich);
  }
  s = schiera(m, s, {});
  for (const [c, o] of scelte) s = rispondi(m, s, c, o, dich);
  return s;
}
const conferma = (s: InCorso) => opzioniValide(chiamateAperte(e18, s).find((c) => c.id === 'qualcuno_ha_parlato')!, s, e18).find((o) => o.testo.endsWith('.op.conferma18') || o.testo.endsWith('.op.conferma18p'))!.id;

describe('testimone in e18 (C15-03)', () => {
  it('protetto, poi conferma alla stampa: resta protetto', () => {
    const s = percorso(e18, [['con_o_senza', 'auto_scorta']]);
    expect(s.variabili.testimone).toBe('protetto');
    expect(percorso(e18, [['con_o_senza', 'auto_scorta'], ['qualcuno_ha_parlato', conferma(s)]]).variabili.testimone).toBe('protetto');
  });
  it('senza protezione, poi conferma alla stampa: esposto', () => {
    const s = percorso(e18, []);
    expect(s.variabili.testimone).toBe('nessuno');
    expect(percorso(e18, [['qualcuno_ha_parlato', conferma(s)]]).variabili.testimone).toBe('esposto');
  });
  it('braccio rosso: senza le condizioni sulle opzioni il protetto torna esposto', () => {
    const rosso: Missione = JSON.parse(JSON.stringify(e18));
    for (const o of rosso.ondate[3]!.chiamate!.find((c) => c.id === 'qualcuno_ha_parlato')!.opzioni) delete o.se;
    expect(percorso(rosso, [['con_o_senza', 'auto_scorta'], ['qualcuno_ha_parlato', 'conferma18']]).variabili.testimone).toBe('esposto');
  });
});
