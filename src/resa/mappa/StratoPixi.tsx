// Strato WebGL della mappa aerea (PixiJS, D-051, D-067). Prestazioni (rischio D-006): lo sfondo si
// disegna UNA volta in una texture (sfondo.ts); a ogni fotogramma si muovono solo la folla e il corteo
// (particelle) e gli aloni dei settori. Spalti e cortei seguono gli eventi dell'ondata (folla.ts, S-11). Tocchi e testi stanno nello strato HTML sopra (Mappa.tsx).
// Con «riduci movimento» si disegna un solo fotogramma.
import { Application, extend, useApplication } from '@pixi/react';
import { Container, Graphics, Particle, ParticleContainer, Sprite, Texture, type Ticker } from 'pixi.js';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { Folla } from './folla.ts';
import { useRidisegno } from './ridisegno.ts';
import { spento } from '../../interruttori.ts';
import { bezier, canvasAlone, disegnaSfondo, disponi, token, type Atmosfera, type Colori } from './sfondo.ts';

extend({ Container });

export interface PuntoMappa { id: string; tipo: string; x: number; y: number; livello: number | null; acceso: boolean; colori?: Colori }

const fermo = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface Margine { lato: number; sotto: number }

// Quanti tifosi si vedono sugli spalti: pieni durante la partita, a metà all'arrivo, pochi al deflusso.
const QUOTA = { pieni: 1, arrivo: 2, deflusso: 4 } as const;

function Disegno(p: { punti: PuntoMappa[]; margine: Margine; atmosfera: Atmosfera; folla: Folla; contenitore: RefObject<HTMLDivElement | null> }) {
  const { app } = useApplication();
  const volte = useRidisegno(app, p.contenitore.current); // S-26: sfondo ridisegnato al ritorno dal background
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
  const pianta = JSON.stringify([p.atmosfera, p.folla, punti.map((q) => [q.id, q.tipo, Math.round(q.x), Math.round(q.y), q.colori ?? null])]);
  const strato = useRef<Container | null>(null);
  const aloni = useRef<{ s: Sprite; acceso: boolean; batte: boolean; x: number; y: number }[]>([]);
  const texAlone = useMemo(() => Texture.from(canvasAlone(128)), []);
  useEffect(() => () => { texAlone.destroy(true); }, [texAlone]);

  useEffect(() => {
    if (W < 10 || H < 10) return;
    const [atm, folla0, posti] = JSON.parse(pianta) as [Atmosfera, Folla, [string, string, number, number, Colori | null][]];

    // 1) sfondo: una volta sola
    const ris = Math.min(2, window.devicePixelRatio || 1);
    const tela = document.createElement('canvas'); tela.width = Math.round(W * ris); tela.height = Math.round(H * ris);
    const ctx = tela.getContext('2d')!; ctx.scale(ris, ris);
    const disp = disponi(W, H, posti.map(([id, tipo, x, y, colori]) => ({ id, tipo, x, y, colori: colori ?? undefined })), atm);
    const animati = disegnaSfondo(ctx, disp);
    const texSfondo = Texture.from(tela);
    const scena = new Container();
    const sfondo = new Sprite(texSfondo); sfondo.width = W; sfondo.height = H; scena.addChild(sfondo);

    // 2) folla (alpha che ondeggia) e corteo (posizione che avanza): particelle
    const bianco = Texture.WHITE; const unita = 1 / bianco.width;
    const folla = new ParticleContainer({ dynamicProperties: { color: true } });
    const tifosi = animati.folla.filter((_, i) => i % QUOTA[folla0.spalti] === 0).map((f) => {
      const q = new Particle({ texture: bianco, x: f.x, y: f.y, scaleX: 1.3 * unita, scaleY: 1.3 * unita, tint: f.colore });
      folla.addParticle(q); return { q, fase: f.fase };
    });
    scena.addChild(folla);
    const corteo = new ParticleContainer({ dynamicProperties: { position: true, color: true } });
    // Un corteo per ogni strada con gente in strada in questa ondata: verso lo stadio o, dopo, via dallo stadio.
    const cortei = folla0.cortei.flatMap((c) => {
      const v = animati.viali.find((x) => x.id === c.settore);
      return v ? [{ ...c, punti: v.punti }] : [];
    });
    const marcia = cortei.flatMap((c) => Array.from({ length: 70 }, (_, i) => {
      const q = new Particle({ texture: bianco, scaleX: 2.2 * unita, scaleY: 2.2 * unita });
      corteo.addParticle(q);
      return { q, c, u: (i * 0.618) % 1, off: ((i * 7) % 9) - 4, fase: i * 0.9 };
    }));
    const el = p.contenitore.current; // per le foto: cosa è stato disegnato davvero
    el?.setAttribute('data-dettagli', animati.dettagli.join(','));
    el?.setAttribute('data-stadio', animati.stadio); // S-25: e dove sta, per controllare che non copra i settori
    el?.setAttribute('data-stadio-ellisse', disp.stadio ? [disp.stadio.cx, disp.stadio.cy, disp.stadio.rx, disp.stadio.ry].map(Math.round).join(',') : '');
    el?.setAttribute('data-folla', `${folla0.spalti}|${cortei.map((c) => `${c.settore}>${c.verso}`).join(',')}`);
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
      for (const k of marcia) {
        const u = (k.u + t * 0.025) % 1;
        const pos = bezier(k.c.punti, (k.c.verso === 'entra' ? u : 1 - u) * 0.75);
        k.q.x = pos.x + k.off; k.q.y = pos.y + k.off * 0.4; k.q.tint = Math.sin(k.fase + t * 4) > 0 ? c1 : c2;
      }
      const battito = 1 + 0.15 * Math.sin(t * 4);
      for (const a of aloni.current) if (a.batte) a.s.scale.set((68 * battito) / 128);
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
      strato.current = null; aloni.current = []; // distrutti con la scena: il prossimo disegno non li deve toccare
      scena.destroy({ children: true });
      texSfondo.destroy(true);
    };
  }, [app, W, H, pianta, p.contenitore, volte]);

  // Aloni: colore della tensione (D-055) o giallo per i settori accesi; cambiano a ogni scena.
  // PO-088: pulsa (battito e onde) SOLO il settore acceso, cioè quello della chiamata in corso; gli altri aloni
  // restano fermi col colore della loro tensione. Rosso C31M01: pulsano tutti, come prima.
  useEffect(() => {
    const livello = strato.current;
    if (!livello) return;
    livello.removeChildren().forEach((c) => c.destroy());
    const tutti = spento('C31M01');
    aloni.current = punti.filter((q) => q.livello !== null || q.acceso).map((q) => {
      const s = new Sprite(texAlone); s.anchor.set(0.5); s.position.set(q.x, q.y); s.scale.set(68 / 128);
      s.tint = q.livello !== null ? token(`--tensione-${q.livello}`) : token('--giallo');
      livello.addChild(s);
      return { s, acceso: q.acceso, batte: tutti || q.acceso, x: q.x, y: q.y };
    });
    p.contenitore.current?.setAttribute('data-lampeggianti', punti.filter((q) => (tutti && q.livello !== null) || q.acceso).map((q) => q.id).join(','));
  }, [punti, texAlone, pianta, p.contenitore]);
  return null;
}

export function StratoPixi(p: { contenitore: RefObject<HTMLDivElement | null>; punti: PuntoMappa[]; margine: Margine; atmosfera: Atmosfera; folla: Folla; pronto: () => void }) {
  return (
    <Application className="mappa-tela" resizeTo={p.contenitore} preference="webgl" backgroundAlpha={0} antialias autoDensity
      resolution={Math.min(2, window.devicePixelRatio || 1)} onInit={p.pronto}>
      <Disegno punti={p.punti} margine={p.margine} atmosfera={p.atmosfera} folla={p.folla} contenitore={p.contenitore} />
    </Application>
  );
}
