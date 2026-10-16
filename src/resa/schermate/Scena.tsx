// Transizioni a fumetto (motion, D-052, D-066): la scena entra con uno scatto di scala e rotazione,
// i messaggi «saltano» dentro uno dopo l'altro. Con «riduci movimento» restano le dissolvenze
// (MotionConfig reducedMotion="user" in App).
import { motion } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { spento } from '../../interruttori.ts';

const molla = { type: 'spring', stiffness: 520, damping: 26 } as const;

/** C32-01: dov'era l'ultimo comando col fuoco (centro, in coordinate della finestra), condiviso fra le scene. */
let ultimo: { x: number; y: number } | null = null;
const COMANDI = 'button:not(:disabled):not(.opzione), a[href], [tabindex="0"]';
/** Il comando visibile della scena più vicino al punto. */
function vicino(s: HTMLElement, p: { x: number; y: number }): HTMLElement | null {
  let meglio: HTMLElement | null = null, d = Infinity;
  for (const e of s.querySelectorAll<HTMLElement>(COMANDI)) {
    if (!e.getClientRects().length) continue;
    const r = e.getBoundingClientRect(), q = Math.hypot(r.left + r.width / 2 - p.x, r.top + r.height / 2 - p.y);
    if (q < d) { d = q; meglio = e; }
  }
  return meglio;
}

export function Scena(p: { nome: string; missione?: string; children: ReactNode }) {
  // C28-09: con la tastiera il fuoco tornava al body dopo 82/412 azioni (opzione scelta e poi disattivata, pastiglia
  // ritirata, scena nuova): il Tab ripartiva dalla testata. Quando il fuoco si perde va sulla scena (non è un comando,
  // nessun contorno), e il Tab dopo arriva al primo comando della scena. Rosso C88F01: resta sul body.
  const el = useRef<HTMLElement>(null);
  useEffect(() => {
    if (spento('C88F01')) return;
    let id = 0;
    // C32-01: sulla scena il Tab ripartiva dal primo comando (fino a 35 Tab per azione nello schieramento). Ora il fuoco
    // perso va al comando della scena più vicino all'ultimo che l'aveva (non alle opzioni delle chiamate: Invio
    // sceglierebbe senza aver letto); la scena solo se non ce n'è nessuno. Rosso C97F01: sempre sulla scena.
    const torna = () => { cancelAnimationFrame(id); id = requestAnimationFrame(() => {
      const s = el.current, a = document.activeElement;
      if (!s?.isConnected || (a && a !== document.body)) return;
      const c = spento('C97F01') || !ultimo ? null : vicino(s, ultimo);
      (c ?? s).focus({ preventScroll: true });
    }); };
    const segna = (e: FocusEvent) => { const t = e.target as HTMLElement | null; if (t && t !== el.current && t.getBoundingClientRect) { const r = t.getBoundingClientRect(); ultimo = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; } };
    torna();
    document.addEventListener('focusin', segna);
    document.addEventListener('focusout', torna);
    return () => { cancelAnimationFrame(id); document.removeEventListener('focusin', segna); document.removeEventListener('focusout', torna); };
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
