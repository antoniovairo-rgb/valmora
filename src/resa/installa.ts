// Installazione sul telefono come app (PO-049): service worker per l'uso offline e richiesta di installazione
// del browser (Android/Chrome). Su iPhone non c'è richiesta: si spiega «Condividi → Aggiungi alla schermata Home».
import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { spento } from '../interruttori.ts';

type Richiesta = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
let richiesta: Richiesta | null = null;
const ascoltatori = new Set<() => void>();

// Rossi del service worker (S-22): passano al worker come parametro, perché lì globalThis della pagina non arriva.
const rossiSw = () => { const r = ['C14O01', 'C14O02'].filter((x) => spento(x)); return r.length ? `?rossi=${r.join(',')}` : ''; };

if (typeof window !== 'undefined' && !Capacitor.isNativePlatform()) {
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register(`./sw.js${rossiSw()}`).catch(() => {});
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); richiesta = e as Richiesta; ascoltatori.forEach((f) => f()); });
  window.addEventListener('appinstalled', () => { richiesta = null; ascoltatori.forEach((f) => f()); });
}

export const giaInstallata = () => typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || Capacitor.isNativePlatform());
export const suIphone = () => typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);

/** Stato dell'installazione per la home: «pronta» se il browser offre la richiesta. */
export function useInstallazione() {
  const [, aggiorna] = useState(0);
  useEffect(() => { const f = () => aggiorna((n) => n + 1); ascoltatori.add(f); return () => { ascoltatori.delete(f); }; }, []);
  return {
    pronta: !!richiesta && !giaInstallata(),
    installa: async () => { if (!richiesta) return; await richiesta.prompt(); await richiesta.userChoice; richiesta = null; aggiorna((n) => n + 1); },
  };
}
