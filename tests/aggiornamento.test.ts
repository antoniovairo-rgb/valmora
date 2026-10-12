// C-014 (C14-03, C14-02): salvataggi scritti con i dati della versione pubblicata (0.4.0/0.5.0) caricati sui
// dati consolidati. Si prova la stessa catena del caricamento (archivio.ts: migra → adattaAiDati) sui dati veri.
import { readdirSync, readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { STRATEGIE } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, missioneFinita, rispondi, schiera, type InCorso } from '../src/logica/missione.ts';
import type { Missione, Variabili } from '../src/logica/tipi.ts';
import { adattaAiDati } from '../src/resa/archivio.ts';
import { dichiarate, missione, missioni } from '../src/resa/dati.ts';
import { chiudiEpisodio, iniziaEpisodio, prossimoEpisodio } from '../src/resa/episodi.ts';
import { migra, type Salvataggio } from '../src/salvataggi/salvataggio.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C14V01; delete g.__NO_C14I01; });

/** Il caricamento come lo fa il gioco (archivio.ts carica), senza localStorage. */
const carica = (grezzo: unknown) => adattaAiDati(migra(structuredClone(grezzo)));

// Le cinque variabili della 0.4.0 (data/stato.json a 9f969d1), coi valori di una partita vera.
const VECCHIE: Variabili = { tensione_max: 5, credito: 6, informatore_pagato: true, presidente_incontrato: true, furgone_visto: false };
const NUOVE = [...dichiarate.keys()].filter((k) => !(k in VECCHIE));

/** Salvataggio con le sole variabili vecchie e gli episodi prima di «fino» superati (registro come lo scrive il gioco). */
function vecchio(fino: number): Salvataggio {
  const prima = missioni.filter((m) => m.episodio < fino);
  return {
    save_version: 2, game_version: '0.4.0', seme: 7, caso: 7, variabili: { ...VECCHIE }, missioni_concluse: prima.map((m) => m.id), genere: 'm', rapporto_aperto: null, in_corso: null,
    episodi: Object.fromEntries(prima.map((m) => [m.id, { migliore: { esito: m.esiti[0]!.id, fallita: false, stelle: 1 }, tentativi: 1, variabili_prima: { ...VECCHIE }, variabili_dopo: { ...VECCHIE } }])),
  };
}

/** Finisce l'episodio in corso come la resa (schiera → rispondi → chiudiOndata → chiudiEpisodio). */
function finisci(s: Salvataggio, m: Missione, ic: InCorso, strategia = 'attenta') {
  const gioc = STRATEGIE[strategia]!(creaCaso(`agg:${m.id}`), dichiarate);
  while (!missioneFinita(m, ic)) {
    if (!ic.disposizione) ic = schiera(m, ic, gioc.schiera(m, ic));
    for (let c = chiamateAperte(m, ic)[0]; c; c = chiamateAperte(m, ic)[0]) ic = rispondi(m, ic, c.id, gioc.scegli(m, ic, c), dichiarate);
    ic = chiudiOndata(m, ic, dichiarate);
  }
  return chiudiEpisodio(s, m, concludiMissione(m, ic, dichiarate));
}

const REALI = 'tests/salvataggi-reali';
const reali = readdirSync(REALI).filter((n) => /^v2-.*\.json$/.test(n)).map((n) => [n, JSON.parse(readFileSync(`${REALI}/${n}`, 'utf8'))] as const);

describe('C14-03: variabili dichiarate dopo il salvataggio', () => {
  it('le variabili nuove esistono davvero (altrimenti il test non prova niente)', () => expect(NUOVE).toContain('rapporto_dessi'));

  it('e10 (legge rapporto_dessi) si gioca fino al verbale da un salvataggio con le sole variabili vecchie', () => {
    const { salvataggio: s } = carica(vecchio(10));
    const m = missione('e10');
    expect(prossimoEpisodio(s)?.id).toBe('e10');
    const fine = finisci(s, m, iniziaEpisodio(s, m));
    expect(fine.risultato.esito).toBeTruthy();
    expect(iniziaEpisodio(s, m).variabili.rapporto_dessi).toBe(dichiarate.get('rapporto_dessi')!.iniziale);
  });

  it('ogni episodio si gioca da un salvataggio vecchio che ci arriva (vale per ogni variabile futura)', () => {
    for (const m of missioni) {
      const { salvataggio: s } = carica(vecchio(m.episodio));
      const fine = finisci(s, m, iniziaEpisodio(s, m)); // prima: 11 episodi su 36 lanciavano «senza valore»
      const nan = Object.entries(fine.salvataggio.variabili).filter(([, v]) => Number.isNaN(v)).map(([k]) => k);
      expect(nan, `${m.id}: NaN (nel JSON diventa null e il salvataggio dopo non si carica più)`).toEqual([]);
    }
  });

  it('completa variabili, in_corso, partenze e registro; i valori già presenti restano', () => {
    const s0 = vecchio(3);
    const ic = iniziaEpisodio({ ...s0, variabili: { ...VECCHIE, credito: 6, informatore_pagato: true } }, missione('e03'));
    for (const x of [ic.variabili, ic.partenze![1]!.variabili]) for (const k of NUOVE) delete x[k];
    const { salvataggio: s } = carica({ ...s0, in_corso: ic });
    for (const v of [s.variabili, s.in_corso!.variabili, s.in_corso!.partenze![1]!.variabili, s.episodi.e01!.variabili_prima, s.episodi.e02!.variabili_dopo!]) {
      for (const k of dichiarate.keys()) expect(v[k], k).toBeDefined();
      expect(v.credito).toBe(6);
    }
  });

  it('braccio rosso __NO_C14V01: torna «variabile … senza valore» su e10', () => {
    g.__NO_C14V01 = true;
    const { salvataggio: s } = carica(vecchio(10));
    const m = missione('e10');
    expect(() => finisci(s, m, iniziaEpisodio(s, m))).toThrow(/rapporto_dessi.*senza valore/);
  });
});

describe('C14-02: in_corso scritto coi dati vecchi', () => {
  const conIc = (ic: InCorso, extra: Partial<Salvataggio> = {}) => ({ ...vecchio(ic.missione === 'e99' ? 3 : missione(ic.missione).episodio), in_corso: ic, ...extra });
  const AVVISO = /aggiornato/;

  it('in_corso di una missione che non esiste: si torna alla città, con avviso, niente eccezioni', () => {
    const ic = { ...iniziaEpisodio(vecchio(3), missione('e03')), missione: 'e99' };
    const { salvataggio: s, avviso } = carica(conIc(ic, { rapporto_aperto: 1 }));
    expect(s.in_corso).toBeNull();
    expect(s.rapporto_aperto).toBeNull();
    expect(avviso).toMatch(AVVISO);
    expect(prossimoEpisodio(s)?.id).toBe('e03');
  });

  it('risposta a una chiamata che non esiste più: l\'episodio riparte dall\'inizio (variabili dal registro, D-062)', () => {
    const m = missione('e02');
    const s0 = vecchio(2);
    const reg = { ...s0, episodi: { ...s0.episodi, e02: { migliore: null, tentativi: 1, variabili_prima: { ...VECCHIE, credito: 3 }, variabili_dopo: null } } };
    const ic = { ...iniziaEpisodio(reg, m), risposte: { chiamata_sparita: 'x' } };
    const { salvataggio: s, avviso } = carica({ ...reg, in_corso: ic, rapporto_aperto: 1 });
    expect(avviso).toMatch(AVVISO);
    expect(s.in_corso!.missione).toBe('e02');
    expect(s.in_corso!.ondata).toBe(1);
    expect(s.in_corso!.risposte).toEqual({});
    expect(s.in_corso!.variabili.credito).toBe(3);
    expect(s.rapporto_aperto).toBeNull();
    expect(() => finisci(s, m, s.in_corso!)).not.toThrow();
  });

  it('scelta con un\'opzione che non esiste più: riparte dall\'inizio', () => {
    const m = missione('e01');
    const c = m.ondate[0]!.chiamate![0]!;
    const ic = { ...iniziaEpisodio(vecchio(1), m), scelte: [{ ondata: 1, chiamata: c.id, opzione: 'opzione_sparita' }] };
    const { salvataggio: s, avviso } = carica(conIc(ic));
    expect(avviso).toMatch(AVVISO);
    expect(s.in_corso!.scelte).toEqual([]);
  });

  it('settori cambiati col consolidamento (e04: curva_ospiti → parcheggi): riparte dall\'inizio', () => {
    const m = missione('e04');
    const ic = iniziaEpisodio(vecchio(4), m);
    const { parcheggi, ...resto } = ic.tensione;
    expect(parcheggi).toBe(0);
    const { salvataggio: s, avviso } = carica(conIc({ ...ic, ondata: 2, tensione: { ...resto, curva_ospiti: 4 } }));
    expect(avviso).toMatch(AVVISO);
    expect(Object.keys(s.in_corso!.tensione).sort()).toEqual(m.mappa.settori.map((x) => x.id).sort());
  });

  it('un in_corso compatibile non si tocca e non c\'è avviso', () => {
    const m = missione('e01');
    const s0 = vecchio(1);
    let ic = iniziaEpisodio(s0, m);
    const gioc = STRATEGIE.attenta!(creaCaso('x'), dichiarate);
    ic = schiera(m, ic, gioc.schiera(m, ic));
    const c = chiamateAperte(m, ic)[0]!;
    ic = rispondi(m, ic, c.id, gioc.scegli(m, ic, c), dichiarate);
    const { salvataggio: s, avviso } = carica({ ...s0, in_corso: ic });
    expect(avviso).toBeNull();
    expect({ ...s.in_corso, variabili: ic.variabili, partenze: ic.partenze }).toEqual(ic); // solo le variabili completate
    expect(s.in_corso!.variabili).toEqual({ ...ic.variabili, ...Object.fromEntries(NUOVE.map((k) => [k, dichiarate.get(k)!.iniziale])) });
  });

  it('braccio rosso __NO_C14I01: l\'in_corso e99 resta e la home chiede una missione che non c\'è', () => {
    g.__NO_C14I01 = true;
    const ic = { ...iniziaEpisodio(vecchio(3), missione('e03')), missione: 'e99' };
    const { salvataggio: s, avviso } = carica(conIc(ic));
    expect(avviso).toBeNull();
    expect(() => missione(s.in_corso!.missione)).toThrow(/e99/); // App.tsx: la scena si calcola da missione(ic.missione)
  });
});

describe('salvataggi reali della versione pubblicata (tests/salvataggi-reali/v2-*)', () => {
  it('ce n\'è almeno uno con un episodio in corso', () => expect(reali.some(([, s]) => s.in_corso)).toBe(true));
  for (const [nome, grezzo] of reali) {
    it(`${nome}: si carica, l'episodio in corso arriva al verbale e il prossimo si gioca`, () => {
      const { salvataggio: s } = carica(grezzo);
      for (const k of dichiarate.keys()) expect(s.variabili[k], k).toBeDefined();
      let dopo = s;
      if (s.in_corso) dopo = finisci(s, missione(s.in_corso.missione), s.in_corso).salvataggio;
      const p = prossimoEpisodio(dopo);
      if (p) expect(() => finisci(dopo, p, iniziaEpisodio(dopo, p))).not.toThrow();
    });
  }
});
