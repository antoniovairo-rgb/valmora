// Strato WebGL della mappa della città di Valmora (D-061, stile D-066/D-067): la città dall'alto si
// disegna UNA volta in una texture (sfondo.ts:disegnaCitta); si animano solo gli aloni degli episodi
// da giocare. Città inventata. Punti e testi stanno nello strato HTML (MappaCitta).
import { Application, extend, useApplication } from '@pixi/react';
import { Container, Sprite, Texture, type Ticker } from 'pixi.js';
import { useEffect, useState, type RefObject } from 'react';
import { canvasAlone, disegnaCitta, token } from './sfondo.ts';

extend({ Container });

export interface PuntoCitta { id: string; x: number; y: number; acceso: boolean }

function Disegno(p: { punti: PuntoCitta[]; margine: number }) {
  const { app } = useApplication();
  const [dim, setDim] = useState({ w: app.screen.width, h: app.screen.height });
  useEffect(() => {
    const r = app.renderer; // tenuto da parte: allo smontaggio Pixi lo toglie da «app»
    const aggiorna = () => setDim({ w: app.screen.width, h: app.screen.height });
    r.on('resize', aggiorna);
    return () => { r.off('resize', aggiorna); };
  }, [app]);

  useEffect(() => {
    const { w: W, h: H } = dim;
    if (W < 10 || H < 10) return;
    const ris = Math.min(2, window.devicePixelRatio || 1);
    const tela = document.createElement('canvas'); tela.width = Math.round(W * ris); tela.height = Math.round(H * ris);
    const ctx = tela.getContext('2d')!; ctx.scale(ris, ris);
    disegnaCitta(ctx, W, H);
    const texCitta = Texture.from(tela); const texAlone = Texture.from(canvasAlone(128));
    const scena = new Container();
    const fondo = new Sprite(texCitta); fondo.width = W; fondo.height = H; scena.addChild(fondo);
    const m = p.margine;
    const aloni = p.punti.filter((q) => q.acceso).map((q) => {
      const s = new Sprite(texAlone); s.anchor.set(0.5); s.tint = token('--giallo');
      s.position.set(m + ((W - 2 * m) * q.x) / 100, m + ((H - 2 * m) * q.y) / 100); scena.addChild(s); return s;
    });
    app.stage.addChild(scena);
    let t = 0;
    const passo = (tk?: Ticker) => { t += (tk?.deltaMS ?? 0) / 1000; for (const s of aloni) s.scale.set((90 * (1 + 0.15 * Math.sin(t * 3))) / 128); };
    passo();
    const anima = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (anima) app.ticker.add(passo);
    return () => { app.ticker?.remove(passo); scena.destroy({ children: true }); texCitta.destroy(true); texAlone.destroy(true); };
  }, [app, dim, p.punti, p.margine]);
  return null;
}

export function StratoCitta(p: { contenitore: RefObject<HTMLDivElement | null>; punti: PuntoCitta[]; margine: number; pronto: () => void }) {
  return (
    <Application className="mappa-tela" resizeTo={p.contenitore} preference="webgl" backgroundAlpha={0} antialias autoDensity
      resolution={Math.min(2, window.devicePixelRatio || 1)} onInit={p.pronto}>
      <Disegno punti={p.punti} margine={p.margine} />
    </Application>
  );
}
