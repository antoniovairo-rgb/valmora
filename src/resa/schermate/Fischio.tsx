// D-165 parte 1: fischio dell'ultimo derby. Sulla mappa di e36 (in App) la città si svuota e la sala operativa spegne
// i settori uno alla volta; con la riduzione del movimento si spengono tutti subito. «Avanti» (tocco o Invio) salta in
// qualunque momento e porta all'epilogo. Rosso C165F01: dal verbale di e36 si va dritti all'epilogo (App.tsx).
import { ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { t } from '../dati.ts';
import { Icona } from '../icone.tsx';

export const PASSO_FISCHIO = 700; // millisecondi fra un settore spento e il prossimo (solo resa, non misura di gioco)

export function Fischio(p: { settori: number; spenti: number; spegni: (n: number) => void; avanti: () => void }) {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { p.spegni(p.settori + 1); return; }
    const id = setInterval(() => p.spegni(-1), PASSO_FISCHIO);
    return () => clearInterval(id);
  }, []); // una volta sola, entrando nella scena
  useEffect(() => {
    const tasto = (e: KeyboardEvent) => { if (e.key === 'Enter' && !(e.target as HTMLElement)?.closest?.('button')) p.avanti(); };
    addEventListener('keydown', tasto);
    return () => removeEventListener('keydown', tasto);
  }, [p]);
  return (
    <>
      <p className="scheda" data-fischio={p.spenti > p.settori ? 'buio' : 'spegne'}>{t('finale.fischio.testo')}</p>
      <button className="pulsante" data-azione="avanti" onClick={p.avanti}>{t('finale.fischio.avanti')}<Icona di={ChevronRight} /></button>
    </>
  );
}
