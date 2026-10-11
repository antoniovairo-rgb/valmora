// Pezzi comuni dello stile «graphic novel» (D-066): testata con numero inclinato, mittente di un
// messaggio (avatar, nome, affidabilità, timbro), lettera delle opzioni.
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Icona } from '../icone.tsx';

export const due = (n: number) => String(n).padStart(2, '0');
export const LETTERE = 'ABCDEFGH';

export function Testata(p: { numero: string; etichetta: string; titolo: ReactNode }) {
  return (
    <header className="testata">
      <div className="testata-n" aria-hidden="true">{p.numero}</div>
      <div className="testata-t"><small>{p.etichetta}</small><h1>{p.titolo}</h1></div>
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
