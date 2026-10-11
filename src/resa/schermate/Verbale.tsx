// Verbale: esito e stelle (D-060), fonti vere e false (D-024), le scelte fatte durante le chiamate.
// Esito «fallita» (D-059): l'episodio non è superato e il verbale porta a «Rigioca l'episodio».
import { Map as IconaMappa, RotateCcw } from 'lucide-react';
import type { Risultato } from '../../logica/episodi.ts';
import type { EsitoMissione } from '../../logica/missione.ts';
import type { Missione } from '../../logica/tipi.ts';
import { t } from '../dati.ts';
import { Icona, iconaFonte } from '../icone.tsx';
import { spento } from '../../interruttori.ts';
import { sceltaLeggibile, scelteDecisive, tono } from '../partita.ts';
import { Stelle } from '../stelle.tsx';
import { due, Mittente, Testata } from './Fumetto.tsx';

export function Verbale(p: { m: Missione; esito: EsitoMissione; risultato: Risultato; migliore: boolean; rigioca: () => void; citta: () => void }) {
  return (
    <>
      <Testata numero={due(p.m.episodio)} etichetta="Verbale" titolo={<span className={tono(p.m, p.esito.esito)} data-esito={p.esito.esito.id}>{t(`esito.${p.esito.esito.id}`)}</span>} />
      <div className="scheda verbale">
        <Stelle n={p.risultato.stelle} />
        <p>{t(p.esito.esito.verbale)}</p>
      </div>
      {p.risultato.fallita
        ? <p className="avviso" data-fallita="si">Episodio fallito: va rigiocato. Si riparte da come stavano le cose prima.</p>
        : <p className="avviso buono" data-migliore={p.migliore ? 'si' : 'no'}>{p.migliore ? 'Nuovo miglior risultato per questo episodio.' : 'Resta il risultato migliore di un tentativo precedente.'}</p>}
      {p.risultato.fallita && <button className="pulsante" data-azione="rigioca" onClick={p.rigioca}><Icona di={RotateCcw} />Rigioca l'episodio</button>}
      <h2>Le fonti</h2>
      {p.m.briefing.map((b, i) => (
        <div className="scheda" key={i} data-fonte={b.fonte}>
          <Mittente icona={iconaFonte(b.fonte)} nome={t(`fonte.${b.fonte}`)} />
          <span className={`timbro ${b.vera ? 'vero' : ''}`} data-vera={b.vera ? 'si' : 'no'}>{b.vera ? 'Vera' : 'Falsa'}</span>
          <p className="tenue">{t(b.testo)}</p>
        </div>
      ))}
      <h2>Le scelte che hanno pesato</h2>
      {scelteDecisive(p.m, p.esito.scelte).length === 0 && <p className="tenue">Nessuna scelta ha spostato la tensione o il credito.</p>}
      {(spento('C05R03') ? p.esito.scelte : scelteDecisive(p.m, p.esito.scelte)).map((x, i) => {
        const { chiamata, opzione } = sceltaLeggibile(p.m, x);
        return (
          <div className="scheda" key={i} data-scelta={`${x.chiamata}:${x.opzione}`}>
            <p className="tenue">Ondata {x.ondata} · {chiamata ? t(`fonte.${chiamata.fonte}`) : x.chiamata}</p>
            <p>{opzione ? t(opzione.testo) : x.opzione}</p>
          </div>
        );
      })}
      <button className={`pulsante${p.risultato.fallita ? ' secondario' : ''}`} data-azione="citta" onClick={p.citta}><Icona di={IconaMappa} />Alla mappa della città</button>
    </>
  );
}
