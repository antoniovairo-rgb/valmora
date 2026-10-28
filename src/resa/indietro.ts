// Tasto indietro del telefono e del browser (S-21, D-104, C14-05): mai uscire dal gioco a metà. Fuori dalla home
// c'è sempre una voce di cronologia «trappola»: il tasto indietro la consuma e qui si decide cosa fare:
//  - una schermata a passi rilegge il passo precedente (gestore registrato da Passi);
//  - altrimenti si torna alla home, con la partita salvata (Riprendi riporta lì). Niente si annulla.
// Dalla home il tasto indietro esce, come ci si aspetta. Rosso C25I01: nessuna trappola, come prima.
import { useEffect } from 'react';
import { spento } from '../interruttori.ts';

type Gestore = () => boolean; // vero = gestito
const pila: Gestore[] = [];
let armato = false;
let allaHome: Gestore = () => false;

const arma = () => {
  if (armato || spento('C25I01') || typeof history === 'undefined') return;
  history.pushState({ vandelfalls: 'indietro' }, '');
  armato = true;
};

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    if (!armato) return;
    armato = false;
    const gestito = [...pila].reverse().some((f) => f()) || allaHome();
    if (gestito) arma();
  });
}

/** App: fuori dalla home la trappola è armata; «home» porta alla home e dice se l'ha fatto. */
export function useIndietroApp(inHome: boolean, home: Gestore) {
  allaHome = home;
  useEffect(() => { if (!inHome) arma(); }, [inHome]);
}

/** Una schermata registra cosa fa il tasto indietro finché è montata (null = niente). */
export function useIndietro(f: Gestore | null) {
  useEffect(() => {
    if (!f) return;
    pila.push(f);
    return () => { const i = pila.lastIndexOf(f); if (i >= 0) pila.splice(i, 1); };
  }, [f]);
}
