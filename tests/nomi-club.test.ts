// C25-01 (D-124): nessun testo mostrato contiene i nomi vecchi delle squadre, in nessuna forma (maiuscole comprese).
// Gli id interni (cinderwick_united, strada_cinderwick…) restano e non sono testo mostrato: qui si guardano solo i valori.
// Rosso: __NO_C63N01 rimette un nome vecchio in un testo e il controllo deve trovarlo.
import { describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';

const VECCHI = ['cinderwick', 'larkspire', 'calderholt', 'mossgarth', 'ollerbrook', 'quillhaven', 'saltmere'];
export function nomiVecchi(dati: Record<string, unknown>) {
  const trovati: string[] = [];
  for (const [file, cont] of Object.entries(dati)) {
    if (!file.startsWith('testi/')) continue;
    for (const [k, v] of Object.entries(cont as Record<string, unknown>))
      if (typeof v === 'string' && VECCHI.some((n) => v.toLowerCase().includes(n))) trovati.push(`${file} ${k}: ${v}`);
  }
  return trovati;
}

describe('nomi delle squadre (D-124, C25-01)', () => {
  it('nessun testo mostrato usa un nome vecchio', () => {
    expect(nomiVecchi(leggiDati() as Record<string, unknown>)).toEqual([]);
  });
  it('braccio rosso __NO_C63N01: un nome vecchio viene trovato', () => {
    const d = leggiDati() as Record<string, Record<string, string>>;
    d['testi/it/e02.json'] = { ...d['testi/it/e02.json'], prova: '«CALDERHOLT NON DIMENTICA»' };
    expect(nomiVecchi(d).length).toBe(1);
  });
});
