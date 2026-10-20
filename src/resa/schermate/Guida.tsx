// La città e il gioco (PO-063): guida a passi dalla home, un passo per schermata (niente scorrimento, PO-058).
// Testi in data/testi/it/comune.json (guida.N.t, guida.N, varianti @f). La userà anche il wizard introduttivo (PO-056).
import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { genereAttuale, t } from '../dati.ts';
import { VignettaGuida } from '../vignette-guida.tsx';
import { VignettaHome } from '../vignette-home.tsx';
import { spento } from '../../interruttori.ts';
import { Icona } from '../icone.tsx';

const PASSI = 6;

/** «introduttiva» (S-18, PO-056): alla prima partita, dopo il genere; si salta dal primo passo e finisce con «Iniziamo». */
export function Guida(p: { chiudi: () => void; introduttiva?: boolean }) {
  const [n, setN] = useState(1);
  return (
    <div className="guida" data-guida={n}>
      {/* D-210 (PO-140 fase 2): al primo passo la vignetta della home in testa alla guida. Rosso C210G01: la vignetta del passo */}
      {n === 1 && !spento('C210G01') ? <figure className="home-vignetta guida-testata" data-guida-testata>
        <VignettaHome genere={genereAttuale() === 'f' ? 'f' : 'm'} didascalia={t('guida.titolo')} fissa />
        <figcaption className="home-didascalia">{t('guida.titolo')}</figcaption>
      </figure> : <VignettaGuida n={n} genere={genereAttuale() === 'f' ? 'f' : 'm'} />}
      <div className="scheda">
        <span className="etichetta">{t('guida.titolo')} · {n}/{PASSI}</span>
        <h2>{t(`guida.${n}.t`)}</h2>
        <p>{t(`guida.${n}`)}</p>
      </div>
      <div className="azioni guida-azioni">
        {n > 1 ? <button className="pulsante secondario" data-azione="guida-indietro" onClick={() => setN(n - 1)}><Icona di={ChevronLeft} />Indietro</button>
          : <button className="pulsante secondario" data-azione={p.introduttiva ? 'guida-salta' : 'guida-chiudi'} onClick={p.chiudi}><Icona di={X} />{p.introduttiva ? 'Salta' : 'Chiudi'}</button>}
        {n < PASSI ? <button className="pulsante" data-azione="guida-avanti" onClick={() => setN(n + 1)}>Avanti<Icona di={ChevronRight} /></button>
          : <button className="pulsante" data-azione="guida-fine" onClick={p.chiudi}>{p.introduttiva ? 'Iniziamo' : 'Ho capito'}</button>}
      </div>
    </div>
  );
}
