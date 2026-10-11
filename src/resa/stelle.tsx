// Stelle di un episodio (D-060): da 0 a 3, piene e vuote.
import { Star } from 'lucide-react';

export function Stelle(p: { n: number; piccole?: boolean }) {
  return (
    <span className={`stelle${p.piccole ? ' piccole' : ''}`} role="img" aria-label={`${p.n} stelle su 3`} data-stelle={p.n}>
      {[1, 2, 3].map((i) => <Star key={i} className={`stella${i <= p.n ? ' piena' : ''}`} aria-hidden="true" />)}
    </span>
  );
}
