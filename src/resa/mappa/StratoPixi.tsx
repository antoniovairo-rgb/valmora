// Strato WebGL della mappa aerea (PixiJS, D-051, D-067). Prestazioni (rischio D-006): lo sfondo si
// disegna UNA volta in una texture (sfondo.ts); a ogni fotogramma si muovono solo la folla e il corteo
// (particelle) e gli aloni dei settori. Tocchi e testi stanno nello strato HTML sopra (Mappa.tsx).
// Con «riduci movimento» si disegna un solo fotogramma.
import { Application, extend, useApplication } from '@pixi/react';
import { Container, Graphics, Particle, ParticleContainer, Sprite, Texture, type Ticker } from 'pixi.js';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { bezier, canvasAlone, disegnaSfondo, disponi, token, type Atmosfera, type Colori } from './sfondo.ts';

extend({ Container });

export interface PuntoMappa { id: string; tipo: string; x: number; y: number; livello: number | null; acceso: boolean; colori?: Colori }

const fermo = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface Margine { lato: number; sotto: number }

function Disegno(p: { punti: PuntoMappa[]; margine: Margine; atmosfera: Atmosfera }) {
  const { app } = useApplication();
  const [dim, setDim] = useState({ w: app.screen.width, h: app.screen.height });
  useEffect(() => {
    const r = app.renderer; // tenuto da parte: allo smontaggio Pixi lo toglie da «app»
    const aggiorna = () => setDim({ w: app.screen.width, h: app.screen.height });
    r.on('resize', aggiorna);
    return () => { r.off('resize', aggiorna); };
  }, [app]);

  const { w: W, h: H } = dim;
  const { lato: m, sotto } = p.margine;
  const punti = useMemo(() => p.punti.map((q) => ({ ...q, x: m + ((W - 2 * m) * q.x) / 100, y: m + ((H - 2 * m - sotto) * q.y) / 100 })), [p.punti, W, H, m, sotto]);
  // Lo sfondo dipende solo da dimensioni e posizioni dei settori, non da tensione o settori accesi.
  const pianta = JSON.stringify([p.atmosfera, punti.map((q) => [q.id, q.tipo, Math.round(q.x), Math.round(q.y), q.colori ?? null])]);
  const strato = useRef<Container | null>(null);
  const aloni = useRef<{ s: Sprite; acceso: boolean; x: number; y: number }[]>([]);
  const texAlone = useMemo(() => Texture.from(canvasAlone(128)), []);
  useEffect(() => () => { texAlone.destroy(true); }, [texAlone]);

  useEffect(() => {
    if (W < 10 || H < 10) return;
    const [atm, posti] = JSON.parse(pianta) as [Atmosfera, [string, string, number, number, Colori | null][]];

    // 1) sfondo: una volta sola
    const ris = Math.min(2, window.devicePixelRatio || 1);
    const tela = document.createElement('canvas'); tela.width = Math.round(W * ris); tela.height = Math.round(H * ris);
    const ctx = tela.getContext('2d')!; ctx.scale(ris, ris);
    const animati = disegnaSfondo(ctx, disponi(W, H, posti.map(([id, tipo, x, y, colori]) => ({ id, tipo, x, y, colori: colori ?? undefined })), atm));
    const texSfondo = Texture.from(tela);
    const scena = new Container();
    const sfondo = new Sprite(texSfondo); sfondo.width = W; sfondo.height = H; scena.addChild(sfondo);

    // 2) folla (alpha che ondeggia) e corteo (posizione che avanza): particelle
    const bianco = Texture.WHITE; const unita = 1 / bianco.width;
    const folla = new ParticleContainer({ dynamicProperties: { color: true } });
    const tifosi = animati.folla.map((f) => {
      const q = new Particle({ texture: bianco, x: f.x, y: f.y, scaleX: 1.3 * unita, scaleY: 1.3 * unita, tint: f.colore });
      folla.addParticle(q); return { q, fase: f.fase };
    });
    scena.addChild(folla);
    const corteo = new ParticleContainer({ dynamicProperties: { position: true, color: true } });
    const marcia = animati.corteo ? Array.from({ length: 70 }, (_, i) => {
      const q = new Particle({ texture: bianco, scaleX: 2.2 * unita, scaleY: 2.2 * unita });
      corteo.addParticle(q);
      return { q, u: (i * 0.618) % 1, off: ((i * 7) % 9) - 4, fase: i * 0.9 };
    }) : [];
    scena.addChild(corteo);

    // 3) posto per gli aloni (riempito dall'effetto sotto) e onde sui settori accesi
    const livelloAloni = new Container(); scena.addChild(livelloAloni); strato.current = livelloAloni;
    const onde = new Graphics(); scena.addChild(onde);
    app.stage.addChild(scena);

    const [c1, c2] = animati.coloriCorteo, giallo = token('--giallo');
    let t = 0;
    const passo = (tk?: Ticker) => {
      t += (tk?.deltaMS ?? 0) / 1000;
      for (const f of tifosi) f.q.alpha = 0.75 + 0.25 * Math.sin(t * 3 + f.fase);
      if (animati.corteo) for (const k of marcia) {
        const pos = bezier(animati.corteo, ((k.u + t * 0.025) % 1) * 0.75);
        k.q.x = pos.x + k.off; k.q.y = pos.y + k.off * 0.4; k.q.tint = Math.sin(k.fase + t * 4) > 0 ? c1 : c2;
      }
      const battito = 1 + 0.15 * Math.sin(t * 4);
      for (const a of aloni.current) a.s.scale.set((68 * battito) / 128);
      onde.clear();
      for (const a of aloni.current) if (a.acceso) {
        const f = (t % 1.2) / 1.2;
        onde.circle(a.x, a.y, 14 + f * 26).stroke({ color: giallo, width: 3, alpha: 1 - f });
      }
      folla.update(); corteo.update();
    };
    passo();
    const anima = !fermo();
    if (anima) app.ticker.add(passo); // da fermo resta il fotogramma disegnato da passo()
    return () => {
      app.ticker?.remove(passo);
      strato.current = null;
      scena.destroy({ children: true });
      texSfondo.destroy(true);
    };
  }, [app, W, H, pianta]);

  // Aloni: colore della tensione (D-055) o giallo per i settori accesi; cambiano a ogni scena.
  useEffect(() => {
    const livello = strato.current;
    if (!livello) return;
    livello.removeChildren().forEach((c) => c.destroy());
    aloni.current = punti.filter((q) => q.livello !== null || q.acceso).map((q) => {
      const s = new Sprite(texAlone); s.anchor.set(0.5); s.position.set(q.x, q.y); s.scale.set(68 / 128);
      s.tint = q.livello !== null ? token(`--tensione-${q.livello}`) : token('--giallo');
      livello.addChild(s);
      return { s, acceso: q.acceso, x: q.x, y: q.y };
    });
  }, [punti, texAlone, pianta]);
  return null;
}

export function StratoPixi(p: { contenitore: RefObject<HTMLDivElement | null>; punti: PuntoMappa[]; margine: Margine; atmosfera: Atmosfera; pronto: () => void }) {
  return (
    <Application className="mappa-tela" resizeTo={p.contenitore} preference="webgl" backgroundAlpha={0} antialias autoDensity
      resolution={Math.min(2, window.devicePixelRatio || 1)} onInit={p.pronto}>
      <Disegno punti={p.punti} margine={p.margine} atmosfera={p.atmosfera} />
    </Application>
  );
}
