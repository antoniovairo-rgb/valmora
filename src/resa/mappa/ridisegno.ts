// S-26 (PO-081): «la mappa s'è scurita dopo aver messo l'app in background». IPOTESI (non riprodotta in Chromium del
// container, dove contesto WebGL perso e ripristinato si rimette da solo): il telefono scarta anche il canvas 2D da cui
// nasce la texture dello sfondo, e al ripristino Pixi ricarica un canvas vuoto (resta il grigio del contenitore).
// Rimedio: quando la pagina torna visibile o il contesto WebGL viene ripristinato, lo sfondo si ridisegna da capo.
// Il contatore va nelle dipendenze dell'effetto che disegna lo sfondo. Rosso C31W01: niente ridisegno.
import { useEffect, useState } from 'react';
import type { Application } from 'pixi.js';
import { spento } from '../../interruttori.ts';

export function useRidisegno(app: Application, contenitore?: HTMLElement | null): number {
  const [volte, setVolte] = useState(0);
  useEffect(() => {
    const ancora = () => { if (!spento('C31W01')) setVolte((v) => v + 1); };
    const visibile = () => { if (document.visibilityState === 'visible') ancora(); };
    const tela = app.canvas as HTMLCanvasElement;
    document.addEventListener('visibilitychange', visibile);
    tela.addEventListener('webglcontextrestored', ancora);
    return () => { document.removeEventListener('visibilitychange', visibile); tela.removeEventListener('webglcontextrestored', ancora); };
  }, [app]);
  useEffect(() => { contenitore?.setAttribute('data-sfondo', String(volte)); }, [contenitore, volte]); // per le foto
  return volte;
}
