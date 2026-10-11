// Mappa della città degli episodi (D-061): scegli un episodio sulla mappa e lo avvii o lo rigiochi.
import { Play, RotateCcw } from 'lucide-react';
import type { Missione } from '../../logica/tipi.ts';
import type { Salvataggio } from '../../salvataggi/salvataggio.ts';
import { missioni, t } from '../dati.ts';
import { statoEpisodio, type StatoEpisodio } from '../episodi.ts';
import { Icona } from '../icone.tsx';
import { MappaCitta } from '../mappa/MappaCitta.tsx';
import { Stelle } from '../stelle.tsx';

const DESCRIZIONE: Record<StatoEpisodio, string> = {
  superato: 'Superato: puoi rigiocarlo, resta il risultato migliore.',
  da_rigiocare: 'Fallito: va rigiocato per andare avanti.',
  disponibile: 'Da giocare.',
  futuro: 'Non ancora disponibile.',
};

export function Citta(p: { sal: Salvataggio; scelto: Missione | null; scegli: (id: string) => void; avvia: (m: Missione) => void }) {
  const voci = missioni.map((m) => ({ m, stato: statoEpisodio(p.sal, m), stelle: p.sal.episodi[m.id]?.migliore?.stelle ?? null }));
  const v = voci.find((x) => x.m.id === p.scelto?.id);
  return (
    <>
      <p className="sopratitolo">Stagione 1 · Mappa della città</p>
      <h1>Valmora</h1>
      <MappaCitta voci={voci} scelto={p.scelto?.id ?? null} scegli={p.scegli} />
      {v ? (
        <div className="scheda" data-scheda-episodio={v.m.id}>
          <p className="tenue">Episodio {v.m.episodio} · {p.sal.episodi[v.m.id]?.tentativi ?? 0} tentativi</p>
          <h2>{t(v.m.titolo)}</h2>
          {v.stelle !== null && <Stelle n={v.stelle} />}
          <p className={v.stato === 'da_rigiocare' ? 'male' : 'tenue'}>{DESCRIZIONE[v.stato]}</p>
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
