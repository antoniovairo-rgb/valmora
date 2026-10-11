import { describe, expect, it } from 'vitest';
import { applica, valuta, variabiliIniziali } from '../src/logica/condizioni.ts';
import {
  chiamateAperte, chiudiOndata, concludiMissione, controllaDisposizione, disponibili, giocaMissione, iniziaMissione, rispondi, schiera,
} from '../src/logica/missione.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const dich = new Map<string, Dichiarazione>([
  ['tensione_max', { id: 'tensione_max', tipo: 'int', min: 0, max: 10, iniziale: 0, descrizione: 'prova' }],
  ['b', { id: 'b', tipo: 'bool', iniziale: false, descrizione: 'prova' }],
]);
const v0 = variabiliIniziali(dich.values());
const missione = (): Missione => ({
  id: 'm', stagione: 1, episodio: 1, titolo: 'testi:m.t', disponibile_se: {}, briefing: [], fili: [], stelle: { due: { var: 'tensione_max', al_massimo: 1 }, tre: { var: 'b', uguale: true } },
  mappa: { settori: [{ id: 'strada', tipo: 'strada' }, { id: 'curva', tipo: 'curva' }],
    risorse: { squadre: { quantita: 2, efficacia: { strada: 2, curva: 1 } }, mediatore: { quantita: 1, efficacia: {}, dimezza: ['corteo'] } } },
  ondate: [
    { n: 1, eventi: [{ id: 'c', tipo: 'corteo', settore: 'strada', pressione: 7 }],
      chiamate: [{ id: 'k1', fonte: 'radio', testo: 'testi:m.k1', opzioni: [
        { id: 'concedi', testo: 'testi:m.a', effetti: [{ pressione: 'curva', valore: 3 }, { imposta: 'b', valore: true }] },
        { id: 'rinforzi', testo: 'testi:m.b', effetti: [{ riserva: 'squadre', valore: 1 }] }] }] },
    { n: 2, eventi: [{ id: 'k', tipo: 'cori', settore: 'curva', pressione: 2 }] },
  ],
  esiti: [{ id: 'ok', se: { var: 'tensione_max', al_massimo: 0 }, effetti: [], verbale: 'testi:m.ok' }, { id: 'ko', se: {}, effetti: [], verbale: 'testi:m.ko' }],
});

describe('condizioni ed effetti', () => {
  it('operatori', () => {
    const v = { ...v0, tensione_max: 3 };
    expect(valuta({ tutte: [{ var: 'tensione_max', almeno: 3 }, { non: { var: 'b', uguale: true } }] }, v)).toBe(true);
    expect(valuta({ almeno_una: [{ var: 'tensione_max', al_massimo: 2 }] }, v)).toBe(false);
  });
  it('aggiungi resta nei limiti', () => expect(applica({ aggiungi: 'tensione_max', valore: 500 }, v0, dich).tensione_max).toBe(10));
});

describe('missione a scene', () => {
  it('ordine obbligato: prima si schiera, poi si risponde, poi si chiude', () => {
    const m = missione(); let s = iniziaMissione(m, v0, dich);
    expect(() => rispondi(m, s, 'k1', 'concedi', dich)).toThrow(/prima si schiera/);
    s = schiera(m, s, { squadre: { strada: 2 }, mediatore: { strada: 1 } });
    expect(() => chiudiOndata(m, s, dich)).toThrow(/senza risposta/);
    expect(chiamateAperte(m, s).map((c) => c.id)).toEqual(['k1']);
  });
  it('la scelta ha un prezzo: «concedi» sposta pressione in curva e cambia la storia', () => {
    const m = missione();
    let s = schiera(m, iniziaMissione(m, v0, dich), { squadre: { strada: 2 }, mediatore: { strada: 1 } });
    s = chiudiOndata(m, rispondi(m, s, 'k1', 'concedi', dich), dich);
    expect(s.rapporti[0]!.scoperto).toEqual({ strada: 0, curva: 3 }); // corteo 7→3 coperto da 4; curva +3 scoperta
    expect(s.variabili.b).toBe(true);
    expect(s.riposo).toEqual({}); // nessuno era nel settore scoperto
  });
  it('la tensione passa all\'ondata dopo e si dimezza solo se il settore resta coperto', () => {
    const m = missione();
    let s = schiera(m, iniziaMissione(m, v0, dich), { squadre: { strada: 1 } });
    s = chiudiOndata(m, rispondi(m, s, 'k1', 'rinforzi', dich), dich);   // strada: 7 − 2 = 5 scoperto
    expect(s.tensione.strada).toBe(5);
    expect(s.riposo).toEqual({ squadre: 1 });                            // la squadra in strada riposa
    expect(disponibili(m, s)).toEqual({ squadre: 2, mediatore: 1 });     // 2 + 1 rinforzo − 1 a riposo
    s = chiudiOndata(m, schiera(m, s, { squadre: { curva: 2 } }), dich); // strada coperta (0 pressione): 5 → 2
    expect(s.tensione).toEqual({ strada: 2, curva: 0 });
    expect(s.variabili.tensione_max).toBe(5);
  });
  it('disposizioni oltre le unità disponibili rifiutate', () => {
    const m = missione();
    expect(controllaDisposizione(m, iniziaMissione(m, v0, dich), { squadre: { strada: 3 } })).toEqual(['squadre: 3 unità disposte, disponibili 2']);
  });
  it('soft-lock dichiarato se nessun esito è vero', () => {
    const m = missione(); m.esiti = [m.esiti[0]!];
    expect(() => giocaMissione(m, v0, dich, { schiera: () => ({}), scegli: (_m, _s, c) => c.opzioni[0]!.id })).toThrow(/soft-lock/);
  });
  it('salvataggio a ogni passo: interrompere e riprendere dal JSON dà lo stesso esito', () => {
    const m = missione();
    const g = { schiera: () => ({ squadre: { strada: 2 }, mediatore: { strada: 1 } }), scegli: () => 'rinforzi' };
    const filato = giocaMissione(m, v0, dich, g);
    const j = <T>(x: T): T => JSON.parse(JSON.stringify(x));
    let s = j(iniziaMissione(m, v0, dich));
    while (s.ondata <= m.ondate.length) {
      s = j(schiera(m, s, g.schiera()));
      for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = j(rispondi(m, s, c.id, g.scegli(), dich));
      s = j(chiudiOndata(m, s, dich));
    }
    expect(concludiMissione(m, s, dich)).toEqual(filato);
  });
});
