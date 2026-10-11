// Sala operativa: il vice (D-054) presenta la giornata (campo «introduzione» della missione); sulla mappa
// si accendono i settori. Se l'introduzione manca nei dati si vede la chiave, senza crash.
import { ChevronRight } from 'lucide-react';
import type { Missione } from '../../logica/tipi.ts';
import { t } from '../dati.ts';
import { Icona } from '../icone.tsx';
import { Messaggio } from './Scena.tsx';

export function Sala(p: { m: Missione; avanti: () => void }) {
  return (
    <>
      <p className="sopratitolo">Episodio {p.m.episodio} · Sala operativa</p>
      <h1>{t(p.m.titolo)}</h1>
      {(p.m.introduzione ?? [`testi:${p.m.id}.introduzione`]).map((x, i) => (
        <Messaggio key={i} ritardo={i * 0.15} classe="vice" dati={`vice-${i + 1}`}>
          {i === 0 && <span className="chi">Il vice</span>}
          <p>{t(x)}</p>
        </Messaggio>
      ))}
      <button className="pulsante" data-azione="avanti" onClick={p.avanti}>Ascolta le fonti<Icona di={ChevronRight} /></button>
    </>
  );
}
