import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { iniziaMissione, schiera } from '../src/logica/missione.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';
import { ESITO_V1, migra, SAVE_VERSION } from '../src/salvataggi/salvataggio.ts';
import { GAME_VERSION } from '../src/versione.ts';

const buono = () => ({ save_version: SAVE_VERSION, game_version: GAME_VERSION, seme: 1, caso: 123, variabili: { a: true, b: 2, c: 'x' }, missioni_concluse: ['e01'], in_corso: null, genere: 'f' as const,
  episodi: { e01: { migliore: { esito: 'ok', fallita: false, stelle: 2 }, tentativi: 2, variabili_prima: { a: true }, variabili_dopo: { a: false } } } });

// Missione minima di prova (nomi neutri): serve solo a produrre un InCorso vero dal motore.
const dich = new Map<string, Dichiarazione>([['tensione_max', { id: 'tensione_max', tipo: 'int', min: 0, max: 10, iniziale: 0, descrizione: 'prova' }]]);
const prova: Missione = {
  id: 'm', stagione: 1, episodio: 1, titolo: 'testi:m.t', disponibile_se: {}, briefing: [], fili: [], stelle: { due: {}, tre: {} },
  mappa: { settori: [{ id: 'a', tipo: 'x' }], risorse: { r: { quantita: 2, efficacia: { x: 1 } } } },
  ondate: [{ n: 1, eventi: [] }], esiti: [{ id: 'ok', se: {}, effetti: [], verbale: 'testi:m.ok' }],
};

const REALI = 'tests/salvataggi-reali';
const reali = readdirSync(REALI).filter((n) => /^v1-.*\.json$/.test(n)).map((n) => [n, JSON.parse(readFileSync(`${REALI}/${n}`, 'utf8'))] as const);

describe('salvataggi', () => {
  it('un salvataggio corrente passa invariato', () => expect(migra(buono())).toEqual(buono()));
  it('versione futura rifiutata', () => expect(() => migra({ ...buono(), save_version: SAVE_VERSION + 1 })).toThrow(/futura/));
  it('versione non valida rifiutata', () => expect(() => migra({ ...buono(), save_version: 0 })).toThrow(/non valida/));
  it('non oggetto rifiutato', () => expect(() => migra('ciao')).toThrow());
  it('missione a scene in corso salvata e riletta uguale', () => {
    const ic = schiera(prova, iniziaMissione(prova, { tensione_max: 0 }, dich), { r: { a: 1 } });
    const s = JSON.parse(JSON.stringify({ ...buono(), in_corso: ic }));
    expect(migra(s)).toEqual(s);
  });
  it('in_corso malformato rifiutato', () => expect(() => migra({ ...buono(), in_corso: { missione: 1 } })).toThrow(/in_corso malformato/));
  it('in_corso del motore 0.1.0 rifiutato in v2', () => expect(() => migra({ ...buono(), in_corso: { missione: 'e01', ondate: [], variabili: {} } })).toThrow(/in_corso malformato/));
  it('registro degli episodi malformato rifiutato', () => {
    expect(() => migra({ ...buono(), episodi: { e01: { migliore: { esito: 'x', fallita: false, stelle: 4 }, tentativi: -1, variabili_prima: {}, variabili_dopo: null } } })).toThrow(/stelle|migliore malformato.*tentativi|tentativi.*migliore/);
    expect(() => migra({ ...buono(), episodi: undefined })).toThrow(/episodi non è un oggetto/);
  });
  it('genere sconosciuto rifiutato', () => expect(() => migra({ ...buono(), genere: 'x' })).toThrow(/genere x/));
  it('campi rotti rifiutati', () => expect(() => migra({ ...buono(), caso: -1, variabili: { a: null } })).toThrow(/caso non uint32.*variabile a/));
});

describe('migrazione v1 → v2 sui salvataggi veri della 0.1.0', () => {
  it('le missioni concluse in v1 diventano episodi superati con 1 stella e 1 tentativo', () => {
    const [, v1] = reali[0]!;
    const v2 = migra({ ...v1, missioni_concluse: ['e01'] });
    expect(v2.episodi).toEqual({ e01: { migliore: { esito: ESITO_V1, fallita: false, stelle: 1 }, tentativi: 1, variabili_prima: v1.variabili, variabili_dopo: v1.variabili } });
  });
  it('ci sono salvataggi v1 veri, almeno uno a metà missione', () => {
    expect(reali.length).toBeGreaterThan(0);
    expect(reali.some(([, s]) => s.in_corso !== null)).toBe(true);
  });
  for (const [nome, v1] of reali) {
    it(`${nome}: in_corso vecchio → null, il resto resta`, () => {
      const v2 = migra(v1);
      expect(v2.save_version).toBe(2);
      expect(v2.in_corso).toBeNull();
      expect(v2.variabili).toEqual(v1.variabili);
      expect(v2.missioni_concluse).toEqual(v1.missioni_concluse);
      expect([v2.seme, v2.caso, v2.game_version]).toEqual([v1.seme, v1.caso, v1.game_version]);
      expect(Object.keys(v2.episodi)).toEqual(v1.missioni_concluse);
      expect(v2.genere).toBe('m');
    });
  }
});
