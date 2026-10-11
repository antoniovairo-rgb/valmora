import { describe, expect, it } from 'vitest';
import { validaDati } from '../../src/dati/valida.ts';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { datiValidi, schemi } from './fixture.ts';

const S = schemi();
const valida = (muta?: (d: Record<string, any>) => void) => {
  const d = datiValidi();
  muta?.(d);
  return validaDati(S, d);
};
const M = 'missioni/m_prova.json';

describe('validatore dei dati', () => {
  it('i dati veri di data/ sono validi', () => expect(validaDati(S, leggiDati('data'))).toEqual([]));
  it('il campione valido passa', () => expect(valida()).toEqual([]));

  // Bracci rossi: ogni controllo deve trovare il difetto che gli è stato messo davanti.
  const rossi: [string, (d: Record<string, any>) => void, RegExp][] = [
    ['campo obbligatorio mancante', (d) => { delete d[M].esiti; }, /must have required property 'esiti'/],
    ['briefing senza «vera» (D-024)', (d) => { delete d[M].briefing[0].vera; }, /must have required property 'vera'/],
    ['campo non previsto', (d) => { d[M].extra = 1; }, /must NOT have additional properties/],
    ['condizione con operatore sconosciuto', (d) => { d[M].disponibile_se = { forse: [] }; }, /disponibile_se/],
    ['chiave di testo malformata', (d) => { d[M].titolo = 'titolo libero'; }, /titolo: must match pattern/],
    ['percorso non previsto', (d) => { d['varie/x.json'] = {}; }, /percorso non previsto/],
    ['id diverso dal file', (d) => { d[M].id = 'm_altro'; }, /diverso dal nome del file/],
    ['indizio in un solo episodio', (d) => { d['fili/filo_a.json'].indizi[0].compare_in = ['m_prova']; }, /compare_in: must NOT have fewer than 2/],
    ['stato.json mancante', (d) => { delete d['stato.json']; }, /stato\.json: manca/],
    ['variabile non dichiarata', (d) => { d[M].esiti[0].se = { var: 'var_x', almeno: 1 }; }, /«var_x» non dichiarata/],
    ['uguale di tipo sbagliato', (d) => { d[M].disponibile_se = { var: 'var_bool', uguale: 3 }; }, /serve un booleano/],
    ['valore enum inesistente', (d) => { d[M].disponibile_se = { var: 'var_enum', uguale: 'tre' }; }, /serve uno di uno\/due/],
    ['almeno su una bool', (d) => { d[M].disponibile_se = { var: 'var_bool', almeno: 1 }; }, /non è int/],
    ['aggiungi su una bool', (d) => { d[M].esiti[0].effetti = [{ aggiungi: 'var_bool', valore: 1 }]; }, /aggiungi su «var_bool»/],
    ['imposta fuori intervallo', (d) => { d[M].esiti[0].effetti = [{ imposta: 'var_int', valore: 9 }]; }, /fuori da \[0, 5\]/],
    ['variabile dichiarata due volte', (d) => { d['stato.json'].variabili.push(d['stato.json'].variabili[0]); }, /dichiarata due volte/],
    ['int con min > max', (d) => { d['stato.json'].variabili[1].min = 9; }, /min > max/],
    ['int con iniziale fuori intervallo', (d) => { d['stato.json'].variabili[1].iniziale = 7; }, /iniziale fuori da/],
    ['enum con iniziale fuori valori', (d) => { d['stato.json'].variabili[2].iniziale = 'tre'; }, /iniziale fuori da valori/],
    ['missione senza uscita garantita', (d) => { d[M].esiti[1].se = { var: 'var_bool', uguale: true }; }, /senza uscita garantita/],
    ['tappa garantita senza forma finale', (d) => { d['fili/filo_a.json'].tappe[0].forme.pop(); }, /tappa garantita senza forma finale/],
    ['testo inesistente', (d) => { delete d['testi/it/prova.json']['prova.info']; }, /«testi:prova\.info» non esiste/],
    ['testo definito due volte', (d) => { d['testi/it/altro.json'] = { 'prova.info': 'x' }; }, /già definita/],
    ['settore fuori mappa', (d) => { d[M].ondate[0].eventi[0].settore = 'settore_z'; }, /non è nella mappa/],
    ['ondate non numerate in ordine', (d) => { d[M].ondate[0].n = 2; }, /n=2, attesa 1/],
    ['filo inesistente', (d) => { d[M].fili = ['filo_z']; }, /filo «filo_z» non esiste/],
    ['episodio doppio', (d) => { d['missioni/m_altra.json'] = { ...structuredClone(d[M]), id: 'm_altra' }; }, /episodio 1 già usato/],
  ];
  for (const [nome, muta, atteso] of rossi) {
    it(`rosso: ${nome}`, () => {
      const problemi = valida(muta);
      expect(problemi.some((p) => atteso.test(p)), problemi.join('\n') || '(nessun problema trovato: guardiano cieco)').toBe(true);
    });
  }
});
