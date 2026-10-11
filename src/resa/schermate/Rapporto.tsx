// Rapporto dell'ondata: la mappa sopra mostra la tensione per settore a colori (D-055), qui si dice
// solo se il settore è rimasto coperto, quante unità vanno a riposo (D-056) e quante ce ne sono
// nella prossima ondata (rinforzi e perdite contano da lì, C01-A04). Nessun numero di tensione.
import { ChevronRight, FileText, Moon } from 'lucide-react';
import type { RapportoOndata } from '../../logica/missione.ts';
import type { Missione } from '../../logica/tipi.ts';
import { t } from '../dati.ts';
import { Icona } from '../icone.tsx';
import { spento } from '../../interruttori.ts';
import { livello } from '../partita.ts';

export function Rapporto(p: { m: Missione; r: RapportoOndata; ultima: boolean; prossime: Record<string, number>; avanti: () => void }) {
  const riposo = Object.entries(p.r.aRiposo).filter(([, n]) => n > 0);
  return (
    <>
      <div className="scheda">
      <ul className="elenco-settori">
        {p.m.mappa.settori.map((s) => {
          const scoperto = (p.r.scoperto[s.id] ?? 0) > 0;
          return (
            <li key={s.id} className="riga" data-esito-settore={s.id}>
              <span className="riga-sx"><span className={`campione liv-${scoperto && !spento('C10S02') ? Math.max(2, livello(p.r.tensione[s.id] ?? 0)) : livello(p.r.tensione[s.id] ?? 0)}`} aria-hidden="true" />{t(`settore.${s.id}`)}</span>
              <strong className={scoperto ? 'male' : 'bene'}>{scoperto ? 'scoperto' : 'sotto controllo'}</strong>
            </li>
          );
        })}
      </ul>
      </div>
      {riposo.length > 0 && !p.ultima && (
        <p className="riposo"><Icona di={Moon} />A riposo nella prossima ondata: {riposo.map(([r, n]) => `${n} ${t(`risorsa.${r}`)}`).join(', ')}</p>
      )}
      {!p.ultima && (
        <p className="tenue" data-disponibili="prossima">Disponibili nella prossima ondata: {Object.entries(p.prossime).map(([r, n]) => `${n} ${t(`risorsa.${r}`)}`).join(', ')}</p>
      )}
      <button className="pulsante" data-azione="avanti" onClick={p.avanti}>
        {p.ultima ? <><Icona di={FileText} />Leggi il verbale</> : <>Prossima ondata<Icona di={ChevronRight} /></>}
      </button>
    </>
  );
}
