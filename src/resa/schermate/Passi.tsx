// Schermate a passi (S-10, PO-045): una carta alla volta invece della colonna da scorrere. Indicatore del
// passo, «Indietro» e «Avanti»; all'ultimo passo il pulsante finale della schermata. I passi stanno tutti
// nella pagina (quelli non correnti nascosti), così lettori di schermo e controlli trovano ogni testo.
// Rosso C12P01: tutto in colonna come prima.
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { spento } from '../../interruttori.ts';
import { Icona } from '../icone.tsx';

export const aCascata = () => spento('C12P01');

export function Passi(p: { passo: number; vai: (i: number) => void; fine: ReactNode; passi: ReactNode[]; nome: string; compatto?: boolean }) {
  const n = p.passi.length;
  if (aCascata()) return <>{p.passi}{p.fine}</>;
  const vai = (i: number) => { p.vai(i); window.scrollTo({ top: 0 }); };
  return (
    <>
      <ol className="passi" aria-label={`${p.nome}: passo ${p.passo + 1} di ${n}`} data-passo={`${p.passo + 1}/${n}`}>
        {p.passi.map((_, i) => <li key={i} className={i === p.passo ? 'attuale' : i < p.passo ? 'fatto' : undefined} />)}
      </ol>
      {p.passi.map((x, i) => <div key={i} className="passo" hidden={i !== p.passo}>{x}</div>)}
      <div className="passi-nav">
        {/* «compatto»: all'ultimo passo «Indietro» è solo l'icona, per lasciare spazio ai pulsanti finali (PO-072) */}
        {p.passo > 0 && (p.compatto && p.passo === n - 1
          ? <button className="pulsante secondario icona" data-azione="indietro" aria-label="Indietro" title="Indietro" onClick={() => vai(p.passo - 1)}><Icona di={ChevronLeft} /></button>
          : <button className="pulsante secondario" data-azione="indietro" onClick={() => vai(p.passo - 1)}><Icona di={ChevronLeft} />Indietro</button>)}
        {p.passo < n - 1 ? <button className="pulsante" data-azione="passo" onClick={() => vai(p.passo + 1)}>Avanti<Icona di={ChevronRight} /></button> : p.fine}
      </div>
    </>
  );
}
