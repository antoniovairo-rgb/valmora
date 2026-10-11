// Unità che «vola» dal vassoio al settore quando la schieri (D-066): solo decorazione, il conteggio
// sulla mappa cambia subito. Con «riduci movimento» non parte (MotionConfig la salta).
import { motion } from 'motion/react';
import { Icona, iconaRisorsa } from '../icone.tsx';

export interface Volo { id: number; risorsa: string; da: { x: number; y: number }; a: { x: number; y: number } }

export function Voli(p: { voli: Volo[]; finito: (id: number) => void }) {
  return (
    <>
      {p.voli.map((v) => (
        <motion.div key={v.id} className="volo pastiglia" aria-hidden="true"
          initial={{ x: v.da.x, y: v.da.y, scale: 1.4, rotate: -12 }}
          animate={{ x: v.a.x, y: v.a.y, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          onAnimationComplete={() => p.finito(v.id)}>
          <Icona di={iconaRisorsa(v.risorsa)} />+1
        </motion.div>
      ))}
    </>
  );
}

/** Centro di un elemento sullo schermo, se c'è. */
export function centro(sel: string): { x: number; y: number } | null {
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
