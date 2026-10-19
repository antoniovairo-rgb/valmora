// C41-04 (D-182, collaudo C-041): testi di risposta che affermavano fatti di schieramento smentiti dallo schieramento
// del giocatore (unità tolte da un settore dove non ce n'erano, settori «presidiati» o «scoperti» comunque fossero,
// «squadre e steward» senza costo in unità). Ora sono neutri sullo schieramento; gli effetti non cambiano.
// Rosso __NO_C41T01: il test rimette i testi di prima e la misura li segnala (5 casi del collaudo).
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C41T01; });
const d = leggiDati() as Record<string, unknown>;

/** I 5 casi del collaudo: chiave del testo → affermazione sullo schieramento che non deve comparire. */
const CASI: [string, string, RegExp][] = [
  ['e33', 'e33.op.nega_auto.c', /tolta alla stazione/], ['e33', 'e33.op.nega_auto.r', /lascia la stazione/],
  ['e33', 'e33.op.festa_viale', /scortata/], ['e33', 'e33.op.festa_viale.r', /la tiene breve/],
  ['e25', 'e25.op.firme_domani.c', /restano presidiati/],
  ['e36', 'e36.op.apri_ora.c', /resta scoperto/],
  ['e02', 'e02.op.accoglienza', /con squadre e steward/],
];
/** Testi di prima (dati della 0.41.0), per il braccio rosso. */
const PRIMA: Record<string, string> = {
  'e33.op.nega_auto.c': 'Guadagni fiducia col comando; ma ti costa una squadra, tolta alla stazione, che sale.',
  'e33.op.nega_auto.r': 'Una squadra lascia la stazione e va al retro. Lavezzari si siede in corridoio, e guarda il muro.',
  'e33.op.festa_viale': 'Festa breve sul viale, scortata',
  'e33.op.festa_viale.r': 'Festa sul viale. Una squadra la tiene breve.',
  'e25.op.firme_domani.c': 'I varchi restano presidiati; la Struttura segna il ritardo: costa fiducia.',
  'e36.op.apri_ora.c': 'Un minuto per voi due; il cantiere, intanto, resta scoperto e sale.',
  'e02.op.accoglienza': 'Accoglienza in banchina con squadre e steward',
};
const testo = (ep: string, k: string) => (g.__NO_C41T01 ? PRIMA[k] : undefined) ?? (d[`testi/it/${ep}.json`] as Record<string, string>)[k] ?? '';
const smentiti = () => [...new Set(CASI.filter(([ep, k, re]) => re.test(testo(ep, k))).map(([, k]) => k.replace(/\.(c|r)$/, '')))];

describe('C41-04 testi neutri sullo schieramento', () => {
  it('verde: nessuno dei 5 casi del collaudo afferma un fatto di schieramento', () => { expect(smentiti()).toEqual([]); });
  it('rosso C41T01: i testi di prima, 5 casi', () => { g.__NO_C41T01 = true; expect(smentiti().length).toBe(5); });
});
