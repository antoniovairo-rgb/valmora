// Strato WebGL della mappa tattica (PixiJS, D-051): griglia, campo, tracciati fra i settori, aloni
// colorati per tensione e impulso sui settori accesi. Solo disegno: tocchi e testi stanno nello
// strato HTML sopra (Mappa.tsx). I colori si leggono dai token CSS, mai scritti qui.
import { Application, extend, useApplication, useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

extend({ Container, Graphics });

export interface PuntoMappa { id: string; x: number; y: number; livello: number | null; acceso: boolean }
/** Campo da gioco schematico, in coordinate 0-100 come i settori. */
export interface Campo { x: number; y: number; larghezza: number }

const token = (nome: string) => getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
const rapido = () => !matchMedia('(prefers-reduced-motion: reduce)').matches;

function Disegno(p: { punti: PuntoMappa[]; campo: Campo | null }) {
  const { app } = useApplication();
  const [dim, setDim] = useState({ w: app.screen.width, h: app.screen.height });
  const vivo = useRef<Graphics>(null);
  const tempo = useRef(0);

  useEffect(() => {
    // Il renderer si tiene da parte: quando la mappa si smonta, Pixi lo ha già tolto da «app».
    const r = app.renderer;
    const aggiorna = () => setDim({ w: app.screen.width, h: app.screen.height });
    r.on('resize', aggiorna);
    aggiorna();
    return () => { r.off('resize', aggiorna); };
  }, [app]);

  // Stesso calcolo del CSS (.settore): margine interno di mezzo cerchio, poi 0-100 sullo spazio che resta.
  const raggio = parseFloat(token('--settore')) / 2 || 24;
  const px = useCallback((q: { x: number; y: number }) => ({
    x: raggio + ((dim.w - 2 * raggio) * q.x) / 100, y: raggio + ((dim.h - 2 * raggio) * q.y) / 100,
  }), [dim, raggio]);

  const fondo = useCallback((g: Graphics) => {
    g.clear();
    const passo = Math.max(16, Math.round(dim.w / 12));
    for (let x = passo; x < dim.w; x += passo) g.moveTo(x, 0).lineTo(x, dim.h);
    for (let y = passo; y < dim.h; y += passo) g.moveTo(0, y).lineTo(dim.w, y);
    g.stroke({ color: token('--colore-griglia'), width: 1 });
    if (p.campo) {
      const c = px(p.campo); const w = ((dim.w - 2 * raggio) * p.campo.larghezza) / 100; const h = w * 0.62;
      g.roundRect(c.x - w / 2, c.y - h / 2, w, h, 6).fill({ color: token('--colore-campo') }).stroke({ color: token('--colore-traccia'), width: 1.5 });
      g.moveTo(c.x, c.y - h / 2).lineTo(c.x, c.y + h / 2).stroke({ color: token('--colore-traccia'), width: 1 });
      g.circle(c.x, c.y, h * 0.18).stroke({ color: token('--colore-traccia'), width: 1 });
    }
    // Tracciati: ogni settore verso il baricentro, come le vie d'accesso di una pianta schematica.
    const centro = p.punti.reduce((a, q) => ({ x: a.x + q.x / p.punti.length, y: a.y + q.y / p.punti.length }), { x: 0, y: 0 });
    for (const q of p.punti) { const a = px(q); const b = px(centro); g.moveTo(a.x, a.y).lineTo(b.x, b.y); }
    g.stroke({ color: token('--colore-traccia'), width: 1, alpha: 0.6 });
  }, [dim, p.campo, p.punti, px]);

  const aloni = useCallback((g: Graphics, t: number) => {
    g.clear();
    const r = raggio + 6;
    for (const q of p.punti) {
      const c = px(q);
      if (q.livello !== null) g.circle(c.x, c.y, r).fill({ color: token(`--tensione-${q.livello}`), alpha: 0.28 });
      if (q.acceso) {
        const f = (Math.sin(t / 12) + 1) / 2;
        g.circle(c.x, c.y, r * (1 + 0.35 * f)).stroke({ color: token('--colore-acceso'), width: 2, alpha: 1 - 0.6 * f });
      }
    }
    // Radar della sala operativa: una lancetta che gira piano.
    const o = { x: dim.w / 2, y: dim.h / 2 }; const a = t / 90; const l = Math.hypot(dim.w, dim.h) / 2;
    g.moveTo(o.x, o.y).lineTo(o.x + Math.cos(a) * l, o.y + Math.sin(a) * l).stroke({ color: token('--colore-acceso'), width: 1, alpha: 0.18 });
  }, [dim, p.punti, px, raggio]);

  useEffect(() => { if (vivo.current) aloni(vivo.current, tempo.current); }, [aloni]);
  const anima = useCallback((k: { deltaTime: number }) => {
    tempo.current += k.deltaTime;
    if (vivo.current) aloni(vivo.current, tempo.current);
  }, [aloni]);
  useTick({ callback: anima, isEnabled: rapido() });

  return (
    <pixiContainer>
      <pixiGraphics draw={fondo} />
      <pixiGraphics ref={vivo} draw={(g) => aloni(g, tempo.current)} />
    </pixiContainer>
  );
}

export function StratoPixi(p: { contenitore: RefObject<HTMLDivElement | null>; punti: PuntoMappa[]; campo: Campo | null; pronto: () => void }) {
  return (
    <Application className="mappa-tela" resizeTo={p.contenitore} preference="webgl" backgroundAlpha={0} antialias autoDensity
      resolution={Math.min(2, window.devicePixelRatio || 1)} onInit={p.pronto}>
      <Disegno punti={p.punti} campo={p.campo} />
    </Application>
  );
}
