// Sala operativa: il vice (D-054) presenta la giornata (campo «introduzione» della missione), una battuta per
// passo (S-10); sulla mappa
// si accendono i settori. Se l'introduzione manca nei dati si vede la chiave, senza crash.
import { ChevronRight, Coffee } from 'lucide-react';
import { Fragment, useState } from 'react';
import type { Missione } from '../../logica/tipi.ts';
import { t } from '../dati.ts';
import { Icona } from '../icone.tsx';
import { Sfida } from '../stemma.tsx';
import { Mittente } from './Fumetto.tsx';
import { Passi } from './Passi.tsx';
import { Messaggio } from './Scena.tsx';

export function Sala(p: { m: Missione; avanti: () => void }) {
  const [passo, setPasso] = useState(0);
  const battute = p.m.introduzione ?? [`testi:${p.m.id}.introduzione`];
  const sfida = Sfida({ m: p.m }); // la sfida della serata è il primo passo, se ci sono club
  return (
    <Passi nome="Sala operativa" passo={passo} vai={setPasso}
      passi={[...(sfida ? [<div key="sfida" className="scheda stasera" data-stasera><p className="etichetta">Stasera</p>{sfida}</div>] : []), ...battute.map((x, i) => (
        <Fragment key={i}>
          <Messaggio classe="vice" dati={`vice-${i + 1}`}>
            {i === 0 && <Mittente icona={Coffee} nome="Il vice" vice />}
            <p className={i === 0 ? 'testo-vice' : undefined}>{t(x)}</p>
          </Messaggio>
        </Fragment>
      ))]}
      fine={<button className="pulsante" data-azione="avanti" onClick={p.avanti}>Ascolta le fonti<Icona di={ChevronRight} /></button>} />
  );
}
