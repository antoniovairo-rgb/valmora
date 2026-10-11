// Sala operativa: il vice (D-054) presenta la giornata in tre battute; sulla mappa si accendono i settori.
// I testi stanno nei dati («<missione>.vice.sala_1…3»): se mancano si vede la chiave, senza crash.
import { ChevronRight } from 'lucide-react';
import type { Missione } from '../../logica/tipi.ts';
import { t, vice } from '../dati.ts';
import { Icona } from '../icone.tsx';
import { Messaggio } from './Scena.tsx';

export const BATTUTE_SALA = 3;

export function Sala(p: { m: Missione; avanti: () => void }) {
  return (
    <>
      <p className="sopratitolo">Episodio {p.m.episodio} · Sala operativa</p>
      <h1>{t(p.m.titolo)}</h1>
      {Array.from({ length: BATTUTE_SALA }, (_, i) => (
        <Messaggio key={i} ritardo={i * 0.15} classe="vice" dati={`vice-${i + 1}`}>
          {i === 0 && <span className="chi">Il vice</span>}
          <p>{vice(p.m.id, `sala_${i + 1}`)}</p>
        </Messaggio>
      ))}
      <button className="pulsante" data-azione="avanti" onClick={p.avanti}>Ascolta le fonti<Icona di={ChevronRight} /></button>
    </>
  );
}
