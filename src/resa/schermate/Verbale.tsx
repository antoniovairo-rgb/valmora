// Verbale: esito e stelle (D-060), fonti vere e false (D-024), le scelte fatte durante le chiamate.
// Sotto l'esito il bilancio (D-085, PO-036). Esito «fallita» (D-059): l'episodio non è superato e il verbale porta a «Rigioca l'episodio».
import { Map as IconaMappa, RotateCcw } from 'lucide-react';
import { Fragment, useState } from 'react';
import type { Risultato } from '../../logica/episodi.ts';
import type { EsitoMissione } from '../../logica/missione.ts';
import type { Missione } from '../../logica/tipi.ts';
import { t } from '../dati.ts';
import { Icona } from '../icone.tsx';
import { spento } from '../../interruttori.ts';
import { tono } from '../partita.ts';
import { sezioniBilancio } from './Bilancio.tsx';
import { Passi } from './Passi.tsx';
import { Stelle } from '../stelle.tsx';
import { Sfida } from '../stemma.tsx';
import { due, Testata } from './Fumetto.tsx';

export function Verbale(p: { m: Missione; esito: EsitoMissione; risultato: Risultato; migliore: boolean; rigioca: () => void; citta: () => void }) {
  const [passo, setPasso] = useState(0);
  const esito = (
    <>
      <div className="scheda verbale">
        <Sfida m={p.m} />
        <Stelle n={p.risultato.stelle} />
        <p>{t(p.esito.esito.verbale)}</p>
      </div>
      {p.risultato.fallita
        ? <p className="avviso" data-fallita="si">Episodio fallito: va rigiocato. Si riparte da come stavano le cose prima.</p>
        : <p className="avviso buono" data-migliore={p.migliore ? 'si' : 'no'}>{p.migliore ? 'Nuovo miglior risultato per questo episodio.' : 'Resta il risultato migliore di un tentativo precedente.'}</p>}
      {p.risultato.fallita && <button className="pulsante" data-azione="rigioca" onClick={p.rigioca}><Icona di={RotateCcw} />Rigioca l'episodio</button>}
    </>
  );
  // Bilancio (D-085): cosa ha aiutato, cosa ha pesato, dove eri scoperto, cosa manca per la stella dopo.
  // Rosso C05R03: tutte le scelte in fila, senza dire quali hanno contato.
  const bilancio = spento('C05R03')
    ? [<Fragment key="tutte">{p.esito.scelte.map((x, i) => <div className="scheda" key={i} data-scelta={`${x.chiamata}:${x.opzione}`}><p>{x.opzione}</p></div>)}</Fragment>]
    : sezioniBilancio({ m: p.m, esito: p.esito, stelle: p.risultato.stelle });
  const fonti = (
    <>
      <h2>Le fonti</h2>
      <ul className="scheda fonti-verbale">
        {p.m.briefing.map((b, i) => (
          <li key={i} data-fonte={b.fonte}>
            <span className="riga"><strong>{t(`fonte.${b.fonte}`)}</strong><span className={`timbro ${b.vera ? 'vero' : ''}`} data-vera={b.vera ? 'si' : 'no'}>{b.vera ? 'Vera' : 'Falsa'}</span></span>
            <p className="tenue">{t(b.testo)}</p>
          </li>
        ))}
      </ul>
    </>
  );
  return (
    <>
      <Testata numero={due(p.m.episodio)} etichetta="Verbale" titolo={<span className={tono(p.m, p.esito.esito)} data-esito={p.esito.esito.id}>{t(`esito.${p.esito.esito.id}`)}</span>} />
      <Passi nome="Verbale" passo={passo} vai={setPasso} passi={[esito, ...bilancio, fonti]}
        fine={<button className={`pulsante${p.risultato.fallita ? ' secondario' : ''}`} data-azione="citta" onClick={p.citta}><Icona di={IconaMappa} />Alla mappa della città</button>} />
    </>
  );
}
