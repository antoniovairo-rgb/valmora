// Rapporto dell'ondata: la mappa sopra mostra la tensione per settore a colori (D-055), qui si dice
// solo se il settore è rimasto coperto, quante unità vanno a riposo (D-056) e quante ce ne sono
// nella prossima ondata (rinforzi e perdite contano da lì, C01-A04). Nessun numero di tensione.
// Se durante l'ondata la tensione è salita più in alto di dove è finita, si vede anche il picco (C09-01):
// è quello che conta per le stelle. Rosso C10S01: niente picco.
import { ChevronRight, FileText, Moon } from 'lucide-react';
import type { RapportoOndata } from '../../logica/missione.ts';
import type { Missione } from '../../logica/tipi.ts';
import { genereAttuale, t, quante } from '../dati.ts';
import { tonoOndata } from '../espressioni.ts';
import { VignettaOndata } from '../vignette-gioco.tsx';
import { Icona } from '../icone.tsx';
import { spento } from '../../interruttori.ts';
import { livello, statoSettore } from '../partita.ts';
import { impegnateDaRisposte } from '../causa.ts';
import type { InCorso } from '../../logica/missione.ts';

export function Rapporto(p: { m: Missione; r: RapportoOndata; ultima: boolean; prossime: Record<string, number>; avanti: () => void; scelte?: InCorso['scelte'] }) {
  // PO-059: protagonista e vice con l'espressione della tensione più alta a fine ondata. Rosso C96P01: niente vignetta.
  const tono = tonoOndata(p.m.mappa.settori.map((s) => livello(p.r.tensione[s.id] ?? 0)), Object.values(p.r.scoperto).filter((n) => n > 0).length);
  const riposo = Object.entries(p.r.aRiposo).filter(([, n]) => n > 0);
  // PO-087: «scoperto» dice sempre perché: cosa ha pesato sul settore e quanto lo coprivi
  const causa = (c: NonNullable<RapportoOndata['causa']>[string], settore: string) => {
    const cosa = [...new Set(c.eventi)].map((e) => t(`evento.${e}`));
    if (c.risposte > 0) cosa.push('le tue risposte');
    const testo = cosa.join(', ');
    // D-055: niente numeri, il confronto fra pressione e copertura in parole. Rosso C34P01: i numeri, come in 09ff232.
    const quanto = spento('C34P01') ? `pressione ${c.pressione}, copertura ${c.copertura}`
      // C37-08 (D-166): unità mandate lì da una risposta, ma il settore resta scoperto (non coprono). Rosso C112R01: come prima.
      : c.copertura <= 0 && !spento('C112R01') && impegnateDaRisposte(p.m, p.scelte ?? [], p.r.n, settore) > 0 ? 'le tue risposte non bastano'
      : c.copertura <= 0 ? 'nessuna unità a coprirlo' : c.copertura * 2 < c.pressione ? 'unità troppo poche' : 'unità non abbastanza';
    return `${testo.charAt(0).toUpperCase()}${testo.slice(1)}: ${quanto}`;
  };
  const fiducia = p.r.fiducia ? (
    <p className={p.r.fiducia > 0 ? 'bene' : 'male'} data-premio-fiducia={p.r.fiducia}>
      Fiducia {p.r.fiducia > 0 ? `+${p.r.fiducia}: nessun settore scoperto` : `${p.r.fiducia}: ${-p.r.fiducia === 1 ? 'un settore è degenerato' : `${-p.r.fiducia} settori sono degenerati`}`}.
    </p>
  ) : null;
  return (
    <>
      {!spento('C96P01') && <div className="vignetta-cornice" data-tono={tono}><VignettaOndata tono={tono} genere={genereAttuale() === 'f' ? 'f' : 'm'} /></div>}
      {/* C18-09: la riga della fiducia prima dei settori: in fondo finiva sotto il pulsante fisso. Rosso C42F01: in fondo. */}
      {!spento('C42F01') && fiducia}
      <div className="scheda">
      <ul className="elenco-settori">
        {p.m.mappa.settori.map((s) => {
          const scoperto = (p.r.scoperto[s.id] ?? 0) > 0;
          const stato = statoSettore(p.r.tensione[s.id] ?? 0, scoperto);
          const picco = livello(p.r.picco?.[s.id] ?? 0);
          const salita = !spento('C10S01') && picco > livello(p.r.tensione[s.id] ?? 0);
          return (
            <li key={s.id} className="riga" data-esito-settore={s.id}>
              <span className="riga-sx"><span className={`campione liv-${scoperto && !spento('C10S02') ? Math.max(2, livello(p.r.tensione[s.id] ?? 0)) : livello(p.r.tensione[s.id] ?? 0)}`} aria-hidden="true" /><span className="nome-picco">{t(`settore.${s.id}`)}
                {salita && <small className="picco" data-picco={s.id}><span className={`campione liv-${picco}`} aria-hidden="true" />salita, poi calmata</small>}
                {p.r.causa?.[s.id] && <small className="causa" data-causa={s.id}>{causa(p.r.causa[s.id]!, s.id)}</small>}</span></span>
              {/* C17-05: coperto ma ancora a tensione da degenerato: nero con la striscia del colore della tensione */}
              <strong className={stato === 'scoperto' ? 'male' : stato === 'caldo' ? 'caldo' : 'bene'} data-stato-settore={stato}>
                {stato === 'scoperto' ? 'scoperto' : stato === 'caldo' ? <>sotto controllo<small>ma ancora caldo</small></> : 'sotto controllo'}</strong>
            </li>
          );
        })}
      </ul>
      </div>
      {spento('C42F01') && fiducia}
      {riposo.length > 0 && !p.ultima && (
        <p className="riposo"><Icona di={Moon} />A riposo nella prossima ondata: {riposo.map(([r, n]) => quante(n, r)).join(', ')}</p>
      )}
      {!p.ultima && (
        <p className="tenue" data-disponibili="prossima">Disponibili nella prossima ondata: {Object.entries(p.prossime).map(([r, n]) => quante(n, r)).join(', ')}</p>
      )}
      <button className="pulsante" data-azione="avanti" onClick={p.avanti}>
        {p.ultima ? <><Icona di={FileText} />Leggi il verbale</> : <>Prossima ondata<Icona di={ChevronRight} /></>}
      </button>
    </>
  );
}
