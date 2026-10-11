// Mappa della città degli episodi (D-061): scegli un episodio sulla mappa e lo avvii o lo rigiochi.
import { Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { Missione } from '../../logica/tipi.ts';
import type { Salvataggio } from '../../salvataggi/salvataggio.ts';
import { missioni, t } from '../dati.ts';
import { statoEpisodio, type StatoEpisodio } from '../episodi.ts';
import { Icona } from '../icone.tsx';
import { MappaCitta } from '../mappa/MappaCitta.tsx';
import { spento } from '../../interruttori.ts';
import { Stelle } from '../stelle.tsx';
import { Sfida } from '../stemma.tsx';
import { due, Testata } from './Fumetto.tsx';

/** «1 tentativo», «N tentativi» (C-008.1). */
const tentativi = (n: number) => `${n} ${n === 1 && !spento('C05S81') ? 'tentativo' : 'tentativi'}`;

const DESCRIZIONE: Record<StatoEpisodio, string> = {
  superato: 'Superato: puoi rigiocarlo, resta il risultato migliore.',
  da_rigiocare: 'Fallito: va rigiocato per andare avanti.',
  disponibile: 'Da giocare.',
  futuro: 'Non ancora disponibile.',
};

export function Citta(p: { sal: Salvataggio; scelto: Missione | null; scegli: (id: string) => void; avvia: (m: Missione) => void }) {
  const tutte = missioni.map((m) => ({ m, stato: statoEpisodio(p.sal, m), stelle: p.sal.episodi[m.id]?.migliore?.stelle ?? null }));
  // PO-044: una stagione alla volta (quella dell'episodio scelto, cambiabile); rosso __NO_C13M01 = tutte insieme
  const stagioni = [...new Set(missioni.map((m) => m.stagione))].sort((a, b) => a - b);
  const [stagione, setStagione] = useState(p.scelto?.stagione ?? stagioni[0] ?? 1);
  const voci = spento('C13M01') ? tutte : tutte.filter((x) => x.m.stagione === stagione);
  const v = voci.find((x) => x.m.id === p.scelto?.id);
  return (
    <>
      <Testata numero={`S${stagione}`} etichetta={`Stagione ${stagione} · mappa della città`} titolo="Valmora" />
      {stagioni.length > 1 && (
        <div className="stagioni" data-stagioni>
          {stagioni.map((n) => (
            <button key={n} type="button" className={`pulsante${n === stagione ? '' : ' secondario'}`} data-stagione={n}
              aria-pressed={n === stagione} onClick={() => setStagione(n)}>Stagione {n}</button>
          ))}
        </div>
      )}
      <MappaCitta voci={voci} scelto={p.scelto?.id ?? null} scegli={p.scegli} />
      {v ? (
        <div className="scheda" data-scheda-episodio={v.m.id}>
          <div className="riga"><span className="etichetta">Episodio {due(v.m.episodio)}</span><span className="tenue">{tentativi(p.sal.episodi[v.m.id]?.tentativi ?? 0)}</span></div>
          <h2>{t(v.m.titolo)}</h2>
          <Sfida m={v.m} />
          {v.stelle !== null && <Stelle n={v.stelle} />}
          <p className={v.stato === 'da_rigiocare' ? 'avviso' : 'tenue'}>{DESCRIZIONE[v.stato]}</p>
          {v.stato !== 'futuro' && (
            <button className="pulsante" data-azione="avvia-episodio" onClick={() => p.avvia(v.m)}>
              {v.stato === 'disponibile' ? <><Icona di={Play} />Avvia l'episodio</> : <><Icona di={RotateCcw} />Rigioca l'episodio</>}
            </button>
          )}
        </div>
      ) : <p className="tenue">Tocca un episodio sulla mappa.</p>}
    </>
  );
}
