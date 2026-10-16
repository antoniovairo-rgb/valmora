// Transizioni a fumetto (motion, D-052, D-066): la scena entra con uno scatto di scala e rotazione,
// i messaggi «saltano» dentro uno dopo l'altro. Con «riduci movimento» restano le dissolvenze
// (MotionConfig reducedMotion="user" in App).
import { motion } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { spento } from '../../interruttori.ts';

const molla = { type: 'spring', stiffness: 520, damping: 26 } as const;

export function Scena(p: { nome: string; missione?: string; children: ReactNode }) {
  // C28-09: con la tastiera il fuoco tornava al body dopo 82/412 azioni (opzione scelta e poi disattivata, pastiglia
  // ritirata, scena nuova): il Tab ripartiva dalla testata. Quando il fuoco si perde va sulla scena (non è un comando,
  // nessun contorno), e il Tab dopo arriva al primo comando della scena. Rosso C88F01: resta sul body.
  const el = useRef<HTMLElement>(null);
  useEffect(() => {
    if (spento('C88F01')) return;
    let id = 0;
    const torna = () => { cancelAnimationFrame(id); id = requestAnimationFrame(() => {
      const s = el.current, a = document.activeElement;
      if (s?.isConnected && (!a || a === document.body)) s.focus({ preventScroll: true });
    }); };
    torna();
    document.addEventListener('focusout', torna);
    return () => { cancelAnimationFrame(id); document.removeEventListener('focusout', torna); };
  }, []);
  return (
    <motion.section ref={el} tabIndex={-1} className="scena" data-scena={p.nome} data-missione={p.missione}
      initial={{ opacity: 0, scale: 0.9, rotate: -2, y: 24 }} animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
      exit={{ opacity: 0, scale: 1.04, rotate: 1, x: -40 }} transition={{ ...molla, opacity: { duration: 0.15 } }}>
      {p.children}
    </motion.section>
  );
}

/** Messaggio radio/telefono/rete o battuta del vice: entra con un salto, uno dopo l'altro. */
export function Messaggio(p: { ritardo?: number; classe?: string; children: ReactNode; dati?: string }) {
  return (
    <motion.div className={`messaggio ${p.classe ?? ''}`} data-messaggio={p.dati}
      initial={{ opacity: 0, scale: 0.6, rotate: -4 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ ...molla, delay: p.ritardo ?? 0, opacity: { duration: 0.12, delay: p.ritardo ?? 0 } }}>
      {p.children}
    </motion.div>
  );
}
