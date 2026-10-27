// PO-152 (D-241, idea A): dopo «Conferma» il costo della risposta arriva per radio sopra la mappa, insieme ai segni ▲/▼.
// Sopra la mappa e non sotto la risposta: la pagina non si allunga (a 360×640 la risposta aveva 6 px prima della soglia di
// sonda-altezze). Sta nella fascia bassa, o in quella alta se i segni sono tutti in basso; i segni e «Home» restano sopra.
// La fascia si sceglie quando compare (i segni spariscono dopo 1,8 s e il rapporto non deve saltare).
import { useState, type ReactNode } from 'react';
import type { Segno } from './segni.ts';

export function RadioMappa(p: { settori: { id: string; pos: { y: number } }[]; segni: Segno[]; home: string | null; children: ReactNode }) {
  const [banda] = useState(() => {
    const ys = p.settori.filter((s) => p.segni.some((x) => x.settore === s.id)).map((s) => s.pos.y);
    return ys.length && ys.every((y) => y > 50) ? 'alto' : 'basso';
  });
  // in alto, il lato di «Home» resta libero
  const lato = banda === 'alto' && p.home?.startsWith('alto') ? ` libero-${p.home.endsWith('sx') ? 'sx' : 'dx'}` : '';
  return <div className={`radio-mappa ${banda}${lato}`} role="status" data-radio-mappa={banda}>{p.children}</div>;
}
