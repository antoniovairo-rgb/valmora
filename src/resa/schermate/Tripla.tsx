// Triplice conferma (S-16, PO-066) per le azioni che fanno perdere qualcosa: «Nuova partita» con una partita
// salvata, rigiocare dalla città un episodio già superato. Tre passi con testo crescente, l'ultimo in
// magenta; «No» sempre per primo. Rosso C20T01: una sola conferma, come prima.
import { ArrowLeft, TriangleAlert } from 'lucide-react';
import { useRef, useState } from 'react';
import { spento } from '../../interruttori.ts';
import { Icona } from '../icone.tsx';
import { useFuocoTitolo } from '../fuoco-titolo.ts';

export function Tripla(p: { testi: [string, string, string]; no: string; si: string; azione: string; conferma: () => void; annulla: () => void }) {
  const [passo, setPasso] = useState(spento('C20T01') ? 2 : 0);
  const ultimo = passo === 2;
  const titolo = useRef<HTMLParagraphElement>(null);
  useFuocoTitolo(titolo, passo); // C34-01: a ogni passo il fuoco torna sul testo, non resta sul «Sì»
  return (
    <div className={`scheda tripla${ultimo ? ' grave' : ''}`} data-conferma-passo={passo + 1} role="alertdialog">
      <p ref={titolo} tabIndex={-1} className="tenue titolo-fuoco">{spento('C20T01') ? 'Conferma' : `Conferma ${passo + 1} di 3`}</p>
      <p><strong>{p.testi[passo]}</strong></p>
      <button className="pulsante" data-azione={`annulla-${p.azione}`} onClick={p.annulla}><Icona di={ArrowLeft} />{p.no}</button>
      {ultimo
        ? <button className="pulsante secondario" data-azione={`conferma-${p.azione}`} onClick={p.conferma}><Icona di={TriangleAlert} />{p.si}</button>
        : <button className="pulsante secondario" data-azione="conferma-passo" onClick={() => setPasso(passo + 1)}>Sì, vai avanti</button>}
    </div>
  );
}
