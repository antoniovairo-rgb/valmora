// Barra della fiducia (PO-067, D-097): sempre in vista durante l'episodio (schieramento, chiamate, risposte,
// rapporto). Dieci tacche, quante ne vale la variabile «credito» del motore (0-10); quando una scelta la
// cambia compare «+N» o «−N» accanto, per un attimo. La fiducia si può dire in cifre, la tensione no (D-055).
// Rosso C16F01: nessuna barra; C16F02: nessun «+N/−N».
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { spento } from '../interruttori.ts';
import { t } from './dati.ts';

export function Fiducia(p: { valore: number; max: number }) {
  const prima = useRef(p.valore);
  const [delta, setDelta] = useState<{ n: number; k: number } | null>(null);
  useEffect(() => {
    const d = p.valore - prima.current;
    prima.current = p.valore;
    if (!d) return;
    setDelta((x) => ({ n: d, k: (x?.k ?? 0) + 1 }));
    const via = setTimeout(() => setDelta(null), 2500);
    return () => clearTimeout(via);
  }, [p.valore]);
  if (spento('C16F01')) return null;
  return (
    <div className="fiducia" data-fiducia={p.valore} role="meter" aria-label={t('var.credito')} aria-valuemin={0} aria-valuemax={p.max} aria-valuenow={p.valore}>
      <span className="fiducia-nome">{t('var.credito')}</span>
      <span className="fiducia-tacche" aria-hidden="true">
        {Array.from({ length: p.max }, (_, i) => <span key={i} className={i < p.valore ? 'piena' : undefined} />)}
      </span>
      <span className="fiducia-valore" aria-hidden="true">{p.valore}/{p.max}</span>
      <AnimatePresence>
        {delta && !spento('C16F02') && (
          <motion.span key={delta.k} className={`fiducia-delta ${delta.n > 0 ? 'su' : 'giu'}`} data-delta={delta.n}
            initial={{ opacity: 0, y: 8, scale: 0.6 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}>
            {delta.n > 0 ? '+' : '−'}{Math.abs(delta.n)}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
