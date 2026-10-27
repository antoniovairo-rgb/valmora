// D-209 (rifinitura e01–e03, PO-141, S-19). Ogni guardiano ha il suo braccio rosso globalThis.__NO_D209xx, che rimette
// i dati o i testi di prima (tests/dati/d209-prima.json, scritto dalla patch).
// - D20901 gli imprevisti reggono ogni scelta vicina: e01 ambulanza dopo la chiamata dei pullman; e02 nessun treno soppresso
//   (il verbale a fatica dice «i treni sono partiti tutti»); e03 nessun bus né ospiti a piedi (gli ospiti hanno i pullman).
// - D20902 testi che promettevano conseguenze assenti nei dati (D-189 regola 1; per le voci D-160 si corregge il testo, D-190).
// - D20903 le risposte gratis hanno un prezzo in pressione o tensione, mai in fiducia, e il costo lo dice.
// - D20905 nessun presidente in e02; D20906 nessun fumogeno in e02 e il vice non cambia idea sul pareggio.
// - D20907 intro di e03: dove le transenne rendono di più; D20908 intro di e01: l'obiettivo.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import type { Chiamata, Missione, Opzione } from '../src/logica/tipi.ts';
import type { FileImprevisti } from '../src/dati/imprevisti.ts';

const g = globalThis as Record<string, unknown>;
const ROSSI = ['D20901', 'D20902', 'D20903', 'D20905', 'D20906', 'D20907', 'D20908'];
afterEach(() => { for (const x of ROSSI) delete g[`__NO_${x}`]; });
const d = leggiDati() as Record<string, unknown>;
const PRIMA = JSON.parse(readFileSync('tests/dati/d209-prima.json', 'utf8')) as {
  testi: Record<string, string>; effetti: Record<string, Opzione['effetti']>; dopo: Record<string, number>;
  chiamate: Record<string, { ondata: number; indice: number; chiamata: Chiamata }>;
};
const rosso = (x: string) => !!g[`__NO_${x}`];
const ep = (k: string) => k.slice(0, 3);
const testo = (k: string, r: string) => (rosso(r) && k in PRIMA.testi ? PRIMA.testi[k]! : (d[`testi/it/${ep(k)}.json`] as Record<string, string>)[k] ?? '');
const chiave = (k?: string) => (k ?? '').replace(/^testi:/, '');
const missione = (id: string) => d[`missioni/${id}.json`] as Missione;
const chiamate = (id: string) => missione(id).ondate.flatMap((o) => o.chiamate ?? []);
const imprevisto = (id: string, ch: string) => (d[`imprevisti/${id}.json`] as FileImprevisti).imprevisti.find((x) => x.chiamata.id === ch)!;
const opzione = (id: string, ch: string, op: string) => chiamate(id).find((c) => c.id === ch)!.opzioni.find((o) => o.id === op)!;
const testiChiamata = (c: Chiamata, r: string) => [c.testo, c.commento, ...c.opzioni.flatMap((o) => [o.testo, o.costo, o.risposta])].map((k) => testo(chiave(k), r)).join(' ');

describe('D20901 gli imprevisti di e01–e03 reggono ogni scelta vicina', () => {
  const problemi = () => {
    const p: string[] = [];
    const amb = imprevisto('e01', 'imp_ambulanza'), o1 = missione('e01').ondate.find((o) => o.n === amb.ondata)!;
    const dopo = rosso('D20901') ? PRIMA.dopo['e01/imp_ambulanza']! : amb.dopo!;
    if (dopo <= (o1.chiamate ?? []).filter((c) => !c.imprevisto).findIndex((c) => c.id === 'pullman')) p.push('e01 ambulanza prima della chiamata dei pullman');
    if (/soppress|domattina|ultimo treno/i.test(testiChiamata(imprevisto('e02', 'imp_soppresso').chiamata, 'D20901'))) p.push('e02 treno soppresso');
    if (!/treni sono partiti tutti/.test(testo('e02.verbale_a_fatica', 'D20901'))) p.push('e02 verbale a fatica cambiato: ricontrollare');
    if (/\bbus\b|a piedi|seicento/i.test(testiChiamata(imprevisto('e03', 'imp_bus_notte').chiamata, 'D20901'))) p.push('e03 ospiti a piedi senza bus');
    return p;
  };
  it('verde: nessuno; rosso D20901: i tre casi della scheda', () => {
    expect(problemi()).toEqual([]);
    g.__NO_D20901 = true;
    expect(problemi()).toEqual(['e01 ambulanza prima della chiamata dei pullman', 'e02 treno soppresso', 'e03 ospiti a piedi senza bus']);
  });
});

describe('D20902 i testi non promettono conseguenze che i dati non applicano', () => {
  const CASI: [string, RegExp][] = [
    ['e01.ch.rinforzi', /ricorderanno/], ['e01.op.chiedi.r', /quaderno/],
    ['e02.op.trattieni_treno.c', /ferrovie non gradiscono/], ['e02.op.trattieni_treno.r', /annotano il favore/],
    ['e01.op.sospendi.c', /svuota di tensione/], ['e01.op.accetta.r', /arrivano sei/i], ['e03.op.presidio_balcone.r', /una squadra/i],
  ];
  const promesse = () => CASI.filter(([k, re]) => re.test(testo(k, 'D20902'))).map(([k]) => k);
  it('verde: nessuna; rosso D20902: le sette righe della scheda', () => {
    // i dati restano quelli: rinforzi e treno senza fiducia (D-160), Lavezzari senza steward, presidio senza squadra
    for (const [ch, op] of [['rinforzi', 'chiedi'], ['lavezzari', 'accetta']]) expect(opzione('e01', ch!, op!).effetti.some((e) => 'aggiungi' in e && e.aggiungi === 'credito')).toBe(false);
    expect(opzione('e01', 'lavezzari', 'accetta').effetti.some((e) => 'riserva' in e)).toBe(false);
    expect(opzione('e03', 'bottiglie', 'presidio_balcone').effetti.some((e) => 'riserva' in e)).toBe(false);
    expect(promesse()).toEqual([]);
    g.__NO_D20902 = true;
    expect(promesse()).toEqual(CASI.map(([k]) => k));
  });
});

describe('D20903 le risposte gratis hanno un prezzo, mai in fiducia', () => {
  const CASI: [string, string, string, Record<string, unknown>, RegExp][] = [
    ['e01', 'fumogeni', 'sospendi', { tensione: 'curva_larkspire', valore: 1 }, /curva Skyfield/],
    ['e02', 'secondo_treno', 'accoglienza', { pressione: 'viale_stazione', valore: 1 }, /viale/],
    ['e02', 'ultimo_treno', 'trattieni_treno', { pressione: 'viale_stazione', valore: 1 }, /viale/],
  ];
  const gratis = () => CASI.filter(([id, ch, op, e, re]) => {
    const o = opzione(id, ch, op), eff = rosso('D20903') ? PRIMA.effetti[`${id}/${ch}/${op}`]! : o.effetti;
    return eff.some((x) => 'aggiungi' in x && x.aggiungi === 'credito') || !eff.some((x) => JSON.stringify(x) === JSON.stringify(e)) || !re.test(testo(chiave(o.costo), 'D20903'));
  }).map(([id, ch, op]) => `${id}/${ch}/${op}`);
  it('verde: nessuna; rosso D20903: le tre di prima (la pausa di e02 esce con i fumogeni, D20906)', () => {
    expect(gratis()).toEqual([]);
    g.__NO_D20903 = true;
    expect(gratis()).toEqual(['e01/fumogeni/sospendi', 'e02/secondo_treno/accoglienza', 'e02/ultimo_treno/trattieni_treno']);
  });
});

describe('D20905/D20906 e02 senza presidente e senza fumogeni; il vice e il pareggio', () => {
  const ids = (r: string) => {
    const c = chiamate('e02').map((x) => x.id);
    if (rosso(r)) for (const [k, x] of Object.entries(PRIMA.chiamate)) if ((r === 'D20905') === k.includes('presidente')) c.push(x.chiamata.id);
    return c;
  };
  const conPresidente = new Set([...chiamate('e02'), ...Object.values(PRIMA.chiamate).map((x) => x.chiamata)]
    .filter((c) => JSON.stringify(c.se ?? {}).includes('presidente')).map((c) => c.id));
  const presidente = () => ids('D20905').filter((c) => conPresidente.has(c));
  it('verde: nessun presidente in e02 (presidente_incontrato resta letto da e03); rosso D20905: la chiamata di prima', () => {
    expect(presidente()).toEqual([]);
    expect(JSON.stringify(missione('e02'))).not.toMatch(/presidente_incontrato/);
    expect(JSON.stringify(missione('e01'))).toMatch(/"imposta":"presidente_incontrato"/);
    expect(JSON.stringify(missione('e03'))).toMatch(/"var":"presidente_incontrato"/);
    g.__NO_D20905 = true; expect(presidente()).toEqual(['presidente_aiuta']);
  });
  const doppioni = () => [...ids('D20906').filter((c) => /fumogeni/.test(c)), ...(/pareggio/.test(testo('e02.ch.risultato.vice', 'D20906')) ? ['vice pareggio'] : [])];
  it('verde: nessun fumogeno e la battuta è un\'altra scommessa; rosso D20906: fumogeni_ospiti e «il pareggio più sicuro»', () => {
    expect(doppioni()).toEqual([]);
    expect(testo('e02.ch.risultato.vice', 'D20906')).toMatch(/puntato/);
    g.__NO_D20906 = true; expect(doppioni()).toEqual(['fumogeni_ospiti', 'vice pareggio']);
  });
});

describe('D20907/D20908 le due righe nuove delle intro', () => {
  it('verde: e03 dice dove rendono le transenne, e01 dice cosa conta; rosso: le intro di prima', () => {
    expect(testo('e03.intro2', 'D20907')).toMatch(/Fra le case rendono il doppio\./);
    expect(testo('e01.intro2', 'D20908')).toMatch(/E ricorda: stasera conta che le strade restino fredde e che il comando si fidi di te\./);
    g.__NO_D20907 = true; g.__NO_D20908 = true;
    expect(testo('e03.intro2', 'D20907')).not.toMatch(/rendono il doppio/);
    expect(testo('e01.intro2', 'D20908')).not.toMatch(/E ricorda/);
  });
});
