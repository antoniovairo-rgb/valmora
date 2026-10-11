// Flusso di un episodio: titolo → briefing → plancia ⇄ risultato dell'ondata → verbale.
// La resa legge e mostra; i calcoli stanno in src/logica. Si salva dopo ogni passo (D-040).
import { useState } from 'react';
import { variabiliIniziali } from '../logica/condizioni.ts';
import { concludiMissione, giocaOndata, iniziaMissione, missioneFinita, type EsitoMissione, type EsitoOndata } from '../logica/plancia.ts';
import type { Disposizione } from '../logica/tipi.ts';
import { SAVE_VERSION, type Salvataggio } from '../salvataggi/salvataggio.ts';
import { GAME_VERSION } from '../versione.ts';
import { carica, nuovoSeme, salva } from './archivio.ts';
import { dichiarate, missione, missioni } from './dati.ts';
import { Briefing } from './schermate/Briefing.tsx';
import { Plancia } from './schermate/Plancia.tsx';
import { RisultatoOndata } from './schermate/RisultatoOndata.tsx';
import { Titolo } from './schermate/Titolo.tsx';
import { Verbale } from './schermate/Verbale.tsx';

type Schermata =
  | { tipo: 'titolo' } | { tipo: 'briefing' } | { tipo: 'plancia' }
  | { tipo: 'ondata'; esito: EsitoOndata } | { tipo: 'verbale'; missione: string; esito: EsitoMissione };

const prossimaMissione = (s: Salvataggio) => missioni.find((m) => !s.missioni_concluse.includes(m.id)) ?? null;

export function App() {
  const [sal, setSal] = useState<Salvataggio | null>(() => carica());
  const [schermata, setSchermata] = useState<Schermata>({ tipo: 'titolo' });
  const [ultima, setUltima] = useState<Disposizione>({});
  const aggiorna = (s: Salvataggio) => { salva(s); setSal(s); };

  const nuova = () => {
    const seme = nuovoSeme();
    aggiorna({ save_version: SAVE_VERSION, game_version: GAME_VERSION, seme, caso: seme, variabili: variabiliIniziali(dichiarate.values()), missioni_concluse: [], in_corso: null });
    setUltima({});
    setSchermata({ tipo: 'briefing' });
  };
  const riprendi = () => setSchermata({ tipo: sal?.in_corso ? 'plancia' : 'briefing' });

  let corpo;
  if (schermata.tipo === 'titolo' || !sal) {
    corpo = <Titolo puoRiprendere={!!sal && (!!sal.in_corso || !!prossimaMissione(sal))} nuova={nuova} riprendi={riprendi} />;
  } else if (schermata.tipo === 'verbale') {
    corpo = <Verbale m={missione(schermata.missione)} esito={schermata.esito} fine={() => setSchermata({ tipo: 'titolo' })} />;
  } else {
    const m = sal.in_corso ? missione(sal.in_corso.missione) : prossimaMissione(sal);
    if (!m) corpo = <Titolo puoRiprendere={false} nuova={nuova} riprendi={riprendi} />;
    else if (schermata.tipo === 'briefing') {
      corpo = <Briefing m={m} avanti={() => { aggiorna({ ...sal, in_corso: iniziaMissione(m, sal.variabili, dichiarate) }); setSchermata({ tipo: 'plancia' }); }} />;
    } else if (schermata.tipo === 'plancia' && sal.in_corso) {
      const ic = sal.in_corso;
      corpo = <Plancia m={m} n={ic.ondate.length + 1} iniziale={ultima} avvia={(d) => {
        const dopo = giocaOndata(m, ic, d, dichiarate);
        setUltima(d);
        aggiorna({ ...sal, in_corso: dopo });
        setSchermata({ tipo: 'ondata', esito: dopo.ondate.at(-1)! });
      }} />;
    } else if (schermata.tipo === 'ondata' && sal.in_corso) {
      const ic = sal.in_corso;
      corpo = <RisultatoOndata m={m} esito={schermata.esito} ultima={missioneFinita(m, ic)} avanti={() => {
        if (!missioneFinita(m, ic)) return setSchermata({ tipo: 'plancia' });
        const fine = concludiMissione(m, ic, dichiarate);
        aggiorna({ ...sal, variabili: fine.variabili, missioni_concluse: [...sal.missioni_concluse, m.id], in_corso: null });
        setSchermata({ tipo: 'verbale', missione: m.id, esito: fine });
      }} />;
    } else corpo = <Titolo puoRiprendere={!!prossimaMissione(sal)} nuova={nuova} riprendi={riprendi} />;
  }
  return <main data-schermata={schermata.tipo}>{corpo}</main>;
}
