// Nuova partita: chi sei? (D-063). Il genere sceglie le varianti «@f» dei testi e resta nel salvataggio.
import { ArrowLeft, UserRound } from 'lucide-react';
import type { Genere } from '../../dati/testi.ts';
import { Icona } from '../icone.tsx';
import { Testata } from './Fumetto.tsx';
import { Tripla } from './Tripla.tsx';

/** Nuova partita con una partita già salvata: si chiede prima di cancellarla (C-005 R02). */
export function ConfermaNuova(p: { si: () => void; no: () => void }) {
  return (
    <>
      <Testata numero="!" etichetta="Nuova partita" titolo="Ricominciare da capo?" />
      {/* S-16 (PO-066): tre conferme, testo crescente, l'ultima in magenta */}
      <Tripla azione="nuova" no="No, tieni la partita" si="Sì, cancella tutto e ricomincia" annulla={p.no} conferma={p.si}
        testi={['La partita salvata (episodi, stelle, scelte) verrà cancellata. Vuoi ricominciare?',
          'Sicuro? Perdi tutti gli episodi superati, le stelle e le scelte fatte finora.',
          'Ultima conferma: cancello la partita. Non si può tornare indietro.']} />
    </>
  );
}

export function SceltaGenere(p: { scegli: (g: Genere) => void; indietro: () => void }) {
  return (
    <>
      <Testata numero="?" etichetta="Nuova partita" titolo="Chi prende servizio oggi?" />
      <div className="scheda"><p>Cambiano solo le parole con cui gli altri si rivolgono a te. Vale per tutta la partita.</p></div>
      <button className="pulsante" data-genere="f" onClick={() => p.scegli('f')}><Icona di={UserRound} />La nuova responsabile ad interim</button>
      <button className="pulsante" data-genere="m" onClick={() => p.scegli('m')}><Icona di={UserRound} />Il nuovo responsabile ad interim</button>
      <button className="pulsante secondario" onClick={p.indietro}><Icona di={ArrowLeft} />Torna al titolo</button>
    </>
  );
}
