// C33-06 (D-144): a fine ondata, prima del rapporto, una scena breve con la vignetta grande del tono (protagonista e vice,
// PO-059): nel rapporto la vignetta restava quasi sempre nascosta per mancanza di spazio. Avanza da sola dopo TONO_MS,
// oppure con un tocco o con Invio/Spazio. Il fuoco va sulla scena (D-142), nessun comando da premere per sbaglio.
// Rosso C110V01: niente scena, il rapporto subito, come prima.
import { useEffect, useRef } from 'react';
import type { TonoOndata } from '../espressioni.ts';
import { VignettaOndata } from '../vignette-gioco.tsx';
import { secondoMs } from './Ondata.tsx';

export const TONO_MS = 2000;

export function Tono(p: { tono: TonoOndata; genere: 'm' | 'f'; n: number; avanti: () => void }) {
  const avanti = useRef(p.avanti); avanti.current = p.avanti; // il conto parte una volta sola, anche se la scena si ridisegna
  useEffect(() => {
    const vai = () => avanti.current(), id = setTimeout(vai, (TONO_MS * secondoMs()) / 1000); // il giro foto non aspetta il tempo reale (PO-121)
    const tasto = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); vai(); } };
    addEventListener('keydown', tasto);
    return () => { clearTimeout(id); removeEventListener('keydown', tasto); };
  }, []);
  return (
    <div className="tono-ondata" data-tono-scena={p.tono} onClick={() => avanti.current()}>
      <p className="tenue">Fine dell'ondata {p.n}</p>
      <VignettaOndata tono={p.tono} genere={p.genere} fissa />
    </div>
  );
}
