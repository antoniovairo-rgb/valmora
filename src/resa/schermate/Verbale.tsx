// Verbale: esito e stelle (D-060), fonti vere e false (D-024), le scelte fatte durante le chiamate.
// Esito «fallita» (D-059): l'episodio non è superato e il verbale porta a «Rigioca l'episodio».
import { Map as IconaMappa, RotateCcw } from 'lucide-react';
import type { Risultato } from '../../logica/episodi.ts';
import type { EsitoMissione } from '../../logica/missione.ts';
import type { Missione } from '../../logica/tipi.ts';
import { t } from '../dati.ts';
import { Icona, iconaFonte } from '../icone.tsx';
import { sceltaLeggibile, tono } from '../partita.ts';
import { Stelle } from '../stelle.tsx';

export function Verbale(p: { m: Missione; esito: EsitoMissione; risultato: Risultato; migliore: boolean; rigioca: () => void; citta: () => void }) {
  return (
    <>
      <p className="sopratitolo">Episodio {p.m.episodio} · Verbale</p>
      <h1 className={tono(p.m, p.esito.esito)} data-esito={p.esito.esito.id}>{t(`esito.${p.esito.esito.id}`)}</h1>
      <p>{t(p.esito.esito.verbale)}</p>
      <Stelle n={p.risultato.stelle} />
      {p.risultato.fallita
        ? <p className="male" data-fallita="si">Episodio fallito: va rigiocato. Si riparte da come stavano le cose prima.</p>
        : <p className="tenue" data-migliore={p.migliore ? 'si' : 'no'}>{p.migliore ? 'Nuovo miglior risultato per questo episodio.' : 'Resta il risultato migliore di un tentativo precedente.'}</p>}
      {p.risultato.fallita && <button className="pulsante" data-azione="rigioca" onClick={p.rigioca}><Icona di={RotateCcw} />Rigioca l'episodio</button>}
      <h2>Le fonti</h2>
      {p.m.briefing.map((b, i) => (
        <div className="scheda" key={i} data-fonte={b.fonte}>
          <div className="riga"><strong className="chi"><Icona di={iconaFonte(b.fonte)} />{t(`fonte.${b.fonte}`)}</strong><strong className={b.vera ? 'bene' : 'male'}>{b.vera ? 'vera' : 'falsa'}</strong></div>
          <p className="tenue">{t(b.testo)}</p>
        </div>
      ))}
      <h2>Le tue scelte</h2>
      {p.esito.scelte.length === 0 && <p className="tenue">Nessuna chiamata in questa missione.</p>}
      {p.esito.scelte.map((x, i) => {
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
