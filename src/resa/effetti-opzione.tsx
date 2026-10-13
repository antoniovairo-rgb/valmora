// L'effetto prima della scelta (PO-085, D-112 punto 3): accanto al costo in parole, icone piccole per il tipo di
// effetto (situazione di un settore, fiducia, unità impegnate) e il settore coinvolto. Niente numeri né verso
// (D-055, D-078): dice dove e su cosa pesa la scelta, non quanto. Rosso C39I01: niente icone.
import { Flame, ThumbsUp } from 'lucide-react';
import type { Chiamata, Opzione } from '../logica/tipi.ts';
import { t } from './dati.ts';
import { Icona, iconaRisorsa } from './icone.tsx';
import { spento } from '../interruttori.ts';

interface Voce { chiave: string; icona: typeof Flame; testo: string; aria: string }

export function vociEffetti(c: Chiamata, o: Opzione): Voce[] {
  const voci = new Map<string, Voce>();
  for (const e of o.effetti) {
    if (('tensione' in e || 'pressione' in e) && e.valore) {
      const s = 'tensione' in e ? e.tensione : e.pressione;
      voci.set(`settore:${s}`, { chiave: `settore:${s}`, icona: Flame, testo: t(`settore.${s}`), aria: `situazione di ${t(`settore.${s}`)}` });
    } else if ('aggiungi' in e && e.aggiungi === 'credito' && e.valore) {
      voci.set('fiducia', { chiave: 'fiducia', icona: ThumbsUp, testo: 'fiducia', aria: 'fiducia del comando' });
    } else if ('riserva' in e && e.valore) {
      const dove = c.settore ? ` · ${t(`settore.${c.settore}`)}` : '';
      voci.set(`unita:${e.riserva}`, { chiave: `unita:${e.riserva}`, icona: iconaRisorsa(e.riserva), testo: `${t(`risorsa.${e.riserva}`)}${e.valore < 0 ? dove : ''}`, aria: `${t(`risorsa.${e.riserva}`)} ${e.valore < 0 ? 'impegnate' : 'in più'}` });
    }
  }
  return [...voci.values()];
}

export function EffettiOpzione(p: { c: Chiamata; o: Opzione }) {
  if (spento('C39I01')) return null;
  const voci = vociEffetti(p.c, p.o);
  if (!voci.length) return null;
  return (
    <span className="effetti-opzione" data-effetti={p.o.id}>
      {voci.map((v) => <span key={v.chiave} className="effetto-chip" data-effetto={v.chiave} aria-label={v.aria}><Icona di={v.icona} />{v.testo}</span>)}
    </span>
  );
}
