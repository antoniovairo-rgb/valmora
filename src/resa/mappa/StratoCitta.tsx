// Strato WebGL della mappa della città di Valmora (D-061): isolati, fiume, viali e un alone sugli
// episodi giocabili. Solo disegno, città inventata; punti e testi stanno nello strato HTML (MappaCitta).
import { Application, extend, useApplication } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useEffect, useState, type RefObject } from 'react';

extend({ Container, Graphics });

export interface PuntoCitta { id: string; x: number; y: number; acceso: boolean }

const token = (nome: string) => getComputedStyle(document.documentElement).getPropertyValue(nome).trim();

function Disegno(p: { punti: PuntoCitta[] }) {
  const { app } = useApplication();
  const [dim, setDim] = useState({ w: app.screen.width, h: app.screen.height });
  useEffect(() => {
    const r = app.renderer; // tenuto da parte: allo smontaggio Pixi lo toglie da «app»
    const aggiorna = () => setDim({ w: app.screen.width, h: app.screen.height });
    r.on('resize', aggiorna);
    aggiorna();
    return () => { r.off('resize', aggiorna); };
  }, [app]);

  const disegna = useCallback((g: Graphics) => {
    g.clear();
    const { w, h } = dim;
    const lato = Math.max(18, Math.round(w / 9));
    // Isolati: una griglia regolare con qualche buco fisso (piazze), stessa città a ogni avvio.
    for (let i = 0; i * lato < w; i++) for (let j = 0; j * lato < h; j++) {
      if ((i * 7 + j * 3) % 11 === 0) continue;
      g.roundRect(i * lato + 3, j * lato + 3, lato - 6, lato - 6, 3);
    }
    g.fill({ color: token('--colore-isolato') });
    // Fiume che attraversa la città in diagonale.
    g.moveTo(-10, h * 0.2).bezierCurveTo(w * 0.3, h * 0.35, w * 0.55, h * 0.1, w + 10, h * 0.42)
      .stroke({ color: token('--colore-fiume'), width: Math.max(10, w / 28) });
    // Due viali.
    g.moveTo(0, h * 0.7).lineTo(w, h * 0.62).moveTo(w * 0.38, 0).lineTo(w * 0.46, h)
      .stroke({ color: token('--colore-traccia'), width: 3 });
    for (const q of p.punti) if (q.acceso) {
      const r = Math.max(28, w / 9);
      g.circle((q.x / 100) * w, (q.y / 100) * h, r).fill({ color: token('--colore-acceso'), alpha: 0.18 });
    }
  }, [dim, p.punti]);

  return <pixiGraphics draw={disegna} />;
}

export function StratoCitta(p: { contenitore: RefObject<HTMLDivElement | null>; punti: PuntoCitta[]; pronto: () => void }) {
  return (
    <Application className="mappa-tela" resizeTo={p.contenitore} preference="webgl" backgroundAlpha={0} antialias autoDensity
      resolution={Math.min(2, window.devicePixelRatio || 1)} onInit={p.pronto}>
      <Disegno punti={p.punti} />
    </Application>
  );
}
