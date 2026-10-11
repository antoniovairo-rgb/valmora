// Nuova partita: chi sei? (D-063). Il genere sceglie le varianti «@f» dei testi e resta nel salvataggio.
import { ArrowLeft, UserRound } from 'lucide-react';
import type { Genere } from '../../dati/testi.ts';
import { Icona } from '../icone.tsx';
import { Testata } from './Fumetto.tsx';

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
