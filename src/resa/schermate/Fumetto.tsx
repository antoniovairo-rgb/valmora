// Pezzi comuni dello stile «graphic novel» (D-066): testata con numero inclinato, mittente di un
// messaggio (avatar, nome, affidabilità, timbro), lettera delle opzioni.
import { House, Info, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icona } from '../icone.tsx';

export const due = (n: number) => String(n).padStart(2, '0');
export const LETTERE = 'ABCDEFGH';

/** Pulsante «Home» (S-21, C14-05): nella testata del verbale e nell'angolo delle mappe; la partita resta salvata. */
export function TastoHome(p: { vai: () => void; angolo?: string }) {
  return <button type="button" className={`tasto-home${p.angolo ? ` ${p.angolo}` : ''}`} data-azione="home" aria-label="Torna alla home (la partita resta salvata)" onClick={p.vai}><Icona di={House} /></button>;
}

/** «home» (S-21, C14-05): pulsante per tornare alla home, la partita resta salvata. */
/** PO-101: «i» accanto al titolo dell'ondata; al tocco la riga che spiega il momento della serata, sotto il titolo.
 *  Si chiude toccando di nuovo o altrove. */
function InfoOndata(p: { testo: string }) {
  const [aperta, setAperta] = useState(false);
  const qui = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!aperta) return;
    const fuori = (e: PointerEvent) => { if (!qui.current?.contains(e.target as Node)) setAperta(false); };
    document.addEventListener('pointerdown', fuori);
    return () => document.removeEventListener('pointerdown', fuori);
  }, [aperta]);
  return (
    <div className="info-ondata" ref={qui}>
      <button type="button" className="info" data-azione="info-ondata" aria-expanded={aperta} aria-label="Che momento della serata è" onClick={() => setAperta(!aperta)}><Icona di={Info} /></button>
      {aperta && <p className="info-riga" data-info-ondata role="status">{p.testo}</p>}
    </div>
  );
}

export function Testata(p: { numero: string; etichetta: string; titolo: ReactNode; home?: () => void; info?: string | null }) {
  return (
    <header className="testata">
      <div className="testata-n" aria-hidden="true">{p.numero}</div>
      <div className="testata-t"><small>{p.etichetta}</small><h1>{p.titolo}</h1>{p.info && <InfoOndata key={p.info} testo={p.info} />}</div>
      {p.home && <TastoHome vai={p.home} />}
    </header>
  );
}

export function Mittente(p: { icona: LucideIcon; nome: string; etichetta?: string; timbro?: string; vice?: boolean }) {
  return (
    <div className="chi">
      <span className={`avatar${p.vice ? ' vice' : ''}`}><Icona di={p.icona} /></span>
      <div>
        <div className="chi-nome">{p.nome}</div>
        {p.etichetta && <span className="etichetta">{p.etichetta}</span>}
      </div>
      {p.timbro && <span className="timbro">{p.timbro}</span>}
    </div>
  );
}
