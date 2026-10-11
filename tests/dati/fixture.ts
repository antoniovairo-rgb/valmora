// Dati FINTI per provare il validatore: nomi neutri, nessun personaggio o evento della storia
// (docs/BIBBIA.md: nessuno inventa contenuti finché la bibbia non c'è).
import { leggiSchemi } from '../../tools/dati-disco.mjs';

export const schemi = (): Record<string, object> => leggiSchemi('schema');

export function datiValidi(): Record<string, any> {
  return {
    'stato.json': { variabili: [
      { id: 'var_bool', tipo: 'bool', iniziale: false, descrizione: 'prova' },
      { id: 'var_int', tipo: 'int', min: 0, max: 5, iniziale: 0, descrizione: 'prova' },
      { id: 'var_enum', tipo: 'enum', valori: ['uno', 'due'], iniziale: 'uno', descrizione: 'prova' },
    ] },
    'soprannomi.json': { soprannomi: [{ id: 'sop_a', testo: 'testi:prova.sop_a', se: { var: 'var_int', almeno: 1 } }] },
    'club/club_a.json': { id: 'club_a', nome: 'testi:prova.club_a' },
    'personaggi/pers_a.json': { id: 'pers_a', nome: 'testi:prova.pers_a' },
    'fili/filo_a.json': { id: 'filo_a',
      tappe: [{ episodio: 2, evento: 'evento_a', garantita: true,
        forme: [{ se: { var: 'var_bool', uguale: true }, variante: 'forma_1' }, { se: {}, variante: 'forma_2' }] }],
      indizi: [{ id: 'indizio_a', compare_in: ['m_prova', 'm_altra'] }] },
    'missioni/m_prova.json': {
      id: 'm_prova', stagione: 1, episodio: 1, titolo: 'testi:prova.titolo', disponibile_se: { tutte: [] },
      briefing: [{ testo: 'testi:prova.info', fonte: 'fonte_a', affidabilita: 'bassa', vera: false }],
      mappa: { settori: [{ id: 'settore_a', tipo: 'tipo_a' }, { id: 'settore_b', tipo: 'tipo_b' }], risorse: { risorsa_a: { quantita: 3, efficacia: { tipo_a: 2 }, dimezza: ['tipo_ev'] } } },
      ondate: [{ n: 1, eventi: [{ id: 'ev_a', tipo: 'tipo_ev', settore: 'settore_a', pressione: 2, se: { non: { var: 'var_enum', uguale: 'due' } } }],
        chiamate: [{ id: 'ch_a', fonte: 'fonte_a', testo: 'testi:prova.ch_a', settore: 'settore_a', opzioni: [
          { id: 'op_a', testo: 'testi:prova.op_a', effetti: [{ tensione: 'settore_a', valore: 1 }, { aggiungi: 'var_int', valore: 1 }] },
          { id: 'op_b', testo: 'testi:prova.op_b', se: { var: 'var_bool', uguale: false }, effetti: [{ pressione: 'settore_b', valore: -1 }, { riserva: 'risorsa_a', valore: 1 }] }] }] }],
      esiti: [
        { id: 'esito_a', se: { almeno_una: [{ var: 'var_int', al_massimo: 2 }] }, effetti: [{ aggiungi: 'var_int', valore: 1 }], verbale: 'testi:prova.verbale_a' },
        { id: 'esito_b', se: {}, effetti: [{ imposta: 'var_bool', valore: true }, { imposta: 'var_enum', valore: 'due' }], verbale: 'testi:prova.verbale_b' },
      ],
      stelle: { due: { var: 'var_int', al_massimo: 2 }, tre: { var: 'var_bool', uguale: true } },
      fili: ['filo_a'] },
    'testi/it/prova.json': Object.fromEntries([...['sop_a', 'club_a', 'pers_a', 'titolo', 'info', 'verbale_a', 'verbale_b', 'ch_a', 'op_a', 'op_b'].map((k) => `prova.${k}`), 'settore.settore_a', 'settore.settore_b', 'risorsa.risorsa_a', 'fonte.fonte_a', 'esito.esito_a', 'esito.esito_b'].map((k) => [k, 'Testo di prova'])),
  };
}
