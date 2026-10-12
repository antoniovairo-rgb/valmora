// Verbale: esito e stelle (D-060), fonti vere e false (D-024), le scelte fatte durante le chiamate.
// Sotto l'esito il bilancio (D-085, PO-036). Esito «fallita» (D-059): l'episodio non è superato e il verbale porta a «Riparti dall'ondata N» (S-17) o «Ricomincia l'episodio».
import { ChevronRight, Map as IconaMappa, RotateCcw, Share2, StepForward } from 'lucide-react';
import { condividi } from '../collegamenti.ts';
import { Fragment, useState } from 'react';
import type { Risultato } from '../../logica/episodi.ts';
import type { EsitoMissione } from '../../logica/missione.ts';
import type { Missione } from '../../logica/tipi.ts';
import { t, genereAttuale } from '../dati.ts';
import { Icona } from '../icone.tsx';
import { spento } from '../../interruttori.ts';
import { tono } from '../partita.ts';
import { sezioniBilancio } from './Bilancio.tsx';
import { Passi } from './Passi.tsx';
import { Stelle } from '../stelle.tsx';
import { VignettaEsito } from '../vignette-gioco.tsx';
import { Sfida } from '../stemma.tsx';
import { due, Testata } from './Fumetto.tsx';

export function Verbale(p: { m: Missione; esito: EsitoMissione; risultato: Risultato; migliore: boolean; rigioca: () => void; citta: () => void; prossimo?: () => void; riparti?: { n: number; vai: () => void } | null; home?: () => void }) {
  const [passo, setPasso] = useState(0);
  const [condivisione, setCondivisione] = useState<string | null>(null);
  // PO-074: testo + link al gioco, dal pannello del telefono o copiato negli appunti
  const stelle = p.risultato.stelle;
  const testoCondiviso = `Valmora · Ep. ${due(p.m.episodio)} «${t(p.m.titolo)}»: ${t(`esito.${p.esito.esito.id}`)} ${'★'.repeat(stelle)}${'☆'.repeat(3 - stelle)}. Ce la fai meglio di me?`;
  const condividiVerbale = () => condividi(testoCondiviso).then((r) => setCondivisione(r === 'copiato' ? 'Copiato: incollalo dove vuoi.' : r === 'errore' ? 'Condivisione non riuscita.' : null));
  const esito = (
    <>
      <div className="scheda verbale">
        <div className="vignetta-cornice">
          <VignettaEsito m={p.m} tono={p.risultato.fallita ? 'fallita' : tono(p.m, p.esito.esito)} genere={genereAttuale() === 'f' ? 'f' : 'm'} />
          <Sfida m={p.m} />
        </div>
        <Stelle n={p.risultato.stelle} />
        <p>{t(p.esito.esito.verbale)}</p>
      </div>
      {p.risultato.fallita
        ? <p className="avviso" data-fallita="si">{p.riparti ? `Episodio fallito: riparti dall'ondata ${p.riparti.n}, dove si è deciso, o da capo.` : 'Episodio fallito: va rigiocato. Si riparte da come stavano le cose prima.'}</p>
        : <p className="avviso buono" data-migliore={p.migliore ? 'si' : 'no'}>{p.migliore ? 'Nuovo miglior risultato per questo episodio.' : 'Resta il risultato migliore di un tentativo precedente.'}</p>}
      {!spento('C20C01') && <button className="pulsante piccolo condividi" data-azione="condividi" data-testo={testoCondiviso} onClick={condividiVerbale}><Icona di={Share2} />Condividi</button>}
      {condivisione && <p className="tenue" data-condivisione role="status">{condivisione}</p>}
      {/* S-17 (PO-060): si riparte dall'ondata che ha deciso l'esito, oppure da capo */}
      {p.risultato.fallita && (
        <div className="riga ripartenza">
          {p.riparti && <button className="pulsante" data-azione="riparti" data-ondata={p.riparti.n} onClick={p.riparti.vai}><Icona di={StepForward} />Riparti dall'ondata {p.riparti.n}</button>}
          <button className={`pulsante${p.riparti ? ' secondario' : ''}`} data-azione="rigioca" aria-label="Ricomincia l'episodio" onClick={p.rigioca}><Icona di={RotateCcw} />{p.riparti ? 'Ricomincia' : "Ricomincia l'episodio"}</button>
        </div>
      )}
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
  // PO-072: a fine verbale si capisce come andare avanti — «Prossimo episodio» in evidenza, la mappa sotto, piccola,
  // con la riga che dice a cosa serve. Rosso C18V01: solo «Alla mappa della città» (difetto originale).
  const mappa = <button className={`pulsante${p.risultato.fallita ? ' secondario' : ''}`} data-azione="citta" onClick={p.citta}><Icona di={IconaMappa} />Alla mappa della città</button>;
  const fine = spento('C18V01') || !p.prossimo || p.risultato.fallita ? mappa : (
    <div className="verbale-fine">
      <div className="verbale-riga">
        <button className="pulsante secondario icona" data-azione="citta" aria-label="Mappa della città" title="Mappa della città" onClick={p.citta}><Icona di={IconaMappa} /></button>
        <button className="pulsante" data-azione="prossimo" onClick={p.prossimo}>Prossimo episodio<Icona di={ChevronRight} /></button>
      </div>
      <p className="tenue" data-spiega="mappa">Mappa: rigioca gli episodi passati.</p>
    </div>
  );
  return (
    <>
      <Testata numero={due(p.m.episodio)} etichetta="Verbale" titolo={<span className={tono(p.m, p.esito.esito)} data-esito={p.esito.esito.id}>{t(`esito.${p.esito.esito.id}`)}</span>} home={p.home} />
      <Passi nome="Verbale" compatto={fine !== mappa} passo={passo} vai={setPasso} passi={[esito, ...bilancio, fonti]}
        fine={fine} />
    </>
  );
}
