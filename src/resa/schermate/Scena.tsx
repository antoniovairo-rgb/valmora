// Ogni scena entra ed esce con una transizione breve (motion, D-052). Con «riduci movimento» attivo
// sul telefono restano solo le dissolvenze (MotionConfig reducedMotion="user" in App).
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

export function Scena(p: { nome: string; children: ReactNode }) {
  return (
    <motion.section className="scena" data-scena={p.nome}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
      {p.children}
    </motion.section>
  );
}

/** Messaggio radio/telefono/rete o battuta del vice: entra dal basso, uno dopo l'altro. */
export function Messaggio(p: { ritardo?: number; classe?: string; children: ReactNode; dati?: string }) {
  return (
    <motion.div className={`messaggio ${p.classe ?? ''}`} data-messaggio={p.dati}
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: p.ritardo ?? 0 }}>
      {p.children}
    </motion.div>
  );
}
