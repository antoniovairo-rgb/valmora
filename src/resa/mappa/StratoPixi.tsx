// Strato WebGL della mappa aerea (PixiJS, D-051, D-067). Prestazioni (rischio D-006): lo sfondo si
// disegna UNA volta in una texture (sfondo.ts); a ogni fotogramma si muovono solo la folla e il corteo
// (particelle) e gli aloni dei settori. Spalti e cortei seguono gli eventi dell'ondata (folla.ts, S-11). Tocchi e testi stanno nello strato HTML sopra (Mappa.tsx).
// Con «riduci movimento» si disegna un solo fotogramma.
import { Application, extend, useApplication } from '@pixi/react';
import { Container, Graphics, Particle, ParticleContainer, Sprite, Texture, type Ticker } from 'pixi.js';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { esceDinamica, neutroCorteo, type Folla } from './folla.ts';
import { club as datiClub } from '../dati.ts';
import { useRidisegno } from './ridisegno.ts';
import { schermo, seguiContenitore, seguiMisura } from './schermo.ts';
import { costruisciDinamica, dinamicaDi } from './dinamica.ts';
import { ALFA_MIN, gente } from './persone.ts';
import { spento } from '../../interruttori.ts';
import { bezier, canvasAlone, colore, disegnaSfondo, disponi, token, type Atmosfera, type Colori } from './sfondo.ts';

extend({ Container });

export interface PuntoMappa { id: string; tipo: string; x: number; y: number; livello: number | null; acceso: boolean; colori?: Colori; /** C27-02 */ meta?: string }

const fermo = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface Margine { lato: number; sotto: number }

// Quanti tifosi si vedono sugli spalti: pieni durante la partita, a metà all'arrivo, pochi al deflusso.
const QUOTA = { pieni: 1, arrivo: 2, deflusso: 4, vuoti: Infinity } as const; // C24-07: «vuoti», nessun tifoso

function Disegno(p: { punti: PuntoMappa[]; margine: Margine; atmosfera: Atmosfera; folla: Folla; citato?: string; contenitore: RefObject<HTMLDivElement | null> }) {
  const { app } = useApplication();
  const volte = useRidisegno(app, p.contenitore.current); // S-26: sfondo ridisegnato al ritorno dal background
  const [dim, setDim] = useState(() => schermo(app) ?? { w: 0, h: 0 }); // C24-03: mai app.screen senza renderer
  // C27-03: il renderer tenuto da parte (allo smontaggio Pixi lo toglie da «app»), e atteso se non c'è ancora
  useEffect(() => seguiMisura(app, () => { const s = schermo(app); if (s) setDim(s); }), [app]);
  useEffect(() => seguiContenitore(app as { renderer?: unknown; queueResize?: () => void }, p.contenitore.current), [app, p.contenitore]); // C28-01

  const { w: W, h: H } = dim;
  const { lato: m, sotto } = p.margine;
  const punti = useMemo(() => p.punti.map((q) => ({ ...q, x: m + ((W - 2 * m) * q.x) / 100, y: m + ((H - 2 * m - sotto) * q.y) / 100 })), [p.punti, W, H, m, sotto]);
  // Lo sfondo dipende solo da dimensioni e posizioni dei settori, non da tensione o settori accesi.
  const pianta = JSON.stringify([p.atmosfera, p.folla, punti.map((q) => [q.id, q.tipo, Math.round(q.x), Math.round(q.y), q.colori ?? null, q.meta ?? null])]);
  const strato = useRef<Container | null>(null);
  const aloni = useRef<{ s: Sprite; acceso: boolean; batte: boolean; x: number; y: number }[]>([]);
  // PO-089: strato della dinamica della chiamata, viali e colori del corteo, e come muoverla (dall'effetto in fondo)
  const strDinamica = useRef<Container | null>(null), vialiDin = useRef<{ id: string; punti: { x: number; y: number }[]; versoMeta?: boolean }[]>([]);
  const coloriDin = useRef<Record<string, [string, string]>>({}), origineDin = useRef<Record<string, string>>({}), muoviDin = useRef<((t: number) => void) | null>(null);
  const texAlone = useMemo(() => Texture.from(canvasAlone(128)), []);
  useEffect(() => () => { texAlone.destroy(true); }, [texAlone]);

  useEffect(() => {
    if (W < 10 || H < 10) return;
    const [atm, folla0, posti] = JSON.parse(pianta) as [Atmosfera, Folla, [string, string, number, number, Colori | null, string | null][]];

    // 1) sfondo: una volta sola
    const ris = Math.min(2, window.devicePixelRatio || 1);
    const tela = document.createElement('canvas'); tela.width = Math.round(W * ris); tela.height = Math.round(H * ris);
    const ctx = tela.getContext('2d')!; ctx.scale(ris, ris);
    const disp = disponi(W, H, posti.map(([id, tipo, x, y, colori, meta]) => ({ id, tipo, x, y, colori: colori ?? undefined, meta: meta ?? undefined })), atm);
    const animati = disegnaSfondo(ctx, disp);
    const texSfondo = Texture.from(tela);
    const scena = new Container();
    const sfondo = new Sprite(texSfondo); sfondo.width = W; sfondo.height = H; scena.addChild(sfondo);

    // 2) folla (alpha che ondeggia) e corteo (posizione che avanza): particelle
    // C22-03: persone con contorno e alone (persone.ts); gli aloni stanno in un contenitore sotto le persone
    const gs = gente('spalti', 1.3), gc = gente('corteo', 2.2);
    const aloniFolla = new ParticleContainer(), folla = new ParticleContainer({ dynamicProperties: { color: true } });
    const tifosi = animati.folla.filter((_, i) => folla0.spalti !== 'vuoti' && i % QUOTA[folla0.spalti] === 0).map((f) => {
      if (gs.alone) aloniFolla.addParticle(new Particle({ texture: gs.alone.tex, x: f.x, y: f.y, scaleX: gs.alone.scala, scaleY: gs.alone.scala, anchorX: 0.5, anchorY: 0.5 }));
      const q = new Particle({ texture: gs.persona, x: f.x, y: f.y, scaleX: gs.scala, scaleY: gs.scala, anchorX: gs.alone ? 0.5 : 0, anchorY: gs.alone ? 0.5 : 0, tint: f.colore });
      folla.addParticle(q); return { q, fase: f.fase };
    });
    scena.addChild(aloniFolla, folla);
    const aloniCorteo = new ParticleContainer({ dynamicProperties: { position: true } }), corteo = new ParticleContainer({ dynamicProperties: { position: true, color: true } });
    // Un corteo per ogni strada con gente in strada in questa ondata: verso lo stadio o, dopo, via dallo stadio.
    const cortei = folla0.cortei.flatMap((c) => {
      const v = animati.viali.find((x) => x.id === c.settore);
      // C-021: club dell'evento → club della strada → curva omonima → neutro grigio (gli ultimi tre in coloriViali)
      const delClub = c.club ? datiClub.get(c.club)?.colori : undefined;
      const colori: [string, string] = delClub ? [colore(delClub.primario)!, colore(delClub.secondario)!] : animati.coloriViali[c.settore] ?? animati.coloriCorteo;
      // C31-02: dal viale che parte dallo stadio (con la meta) il corteo va verso la meta: via dallo stadio
      return v ? [{ ...c, verso: v.versoMeta ? 'entra' as const : c.verso, punti: v.punti, colori, origine: delClub?.primario ?? animati.origineViali[c.settore] }] : [];
    });
    const marcia = cortei.flatMap((c) => Array.from({ length: 70 }, (_, i) => {
      const h = gc.alone ? new Particle({ texture: gc.alone.tex, scaleX: gc.alone.scala, scaleY: gc.alone.scala, anchorX: 0.5, anchorY: 0.5 }) : null;
      if (h) aloniCorteo.addParticle(h);
      const q = new Particle({ texture: gc.persona, scaleX: gc.scala, scaleY: gc.scala, anchorX: gc.alone ? 0.5 : 0, anchorY: gc.alone ? 0.5 : 0 });
      corteo.addParticle(q);
      return { q, h, c, u: (i * 0.618) % 1, off: ((i * 7) % 9) - 4, fase: i * 0.9 };
    }));
    const el = p.contenitore.current; // per le foto: cosa è stato disegnato davvero
    el?.setAttribute('data-dettagli', animati.dettagli.join(','));
    el?.setAttribute('data-stadio', animati.stadio); // S-25: e dove sta, per controllare che non copra i settori
    el?.setAttribute('data-stadio-ellisse', disp.stadio ? [disp.stadio.cx, disp.stadio.cy, disp.stadio.rx, disp.stadio.ry].map(Math.round).join(',') : '');
    el?.setAttribute('data-colori-cortei', Object.entries({ ...animati.origineViali, ...Object.fromEntries(cortei.map((c) => [c.settore, c.origine])) }).map(([id, o]) => `${id}=${o}`).join(','));
    el?.setAttribute('data-folla', `${folla0.spalti}|${cortei.map((c) => `${c.settore}>${c.verso}`).join(',')}`);
    // C22-03, per il guardiano: lato della persona in px CSS e se ha contorno e alone (la folla è quella della dinamica)
    el?.setAttribute('data-persone', ([['spalti', gs], ['corteo', gc], ['folla', gente('folla', 2.4)]] as const).map(([n, g]) => `${n}:${g.lato}/${g.alone ? 'alone' : 'no'}/${ALFA_MIN[n]}`).join(','));
    scena.addChild(aloniCorteo, corteo);

    // 3) posto per gli aloni (riempito dall'effetto sotto) e onde sui settori accesi
    const livelloAloni = new Container(); scena.addChild(livelloAloni); strato.current = livelloAloni;
    const onde = new Graphics(); scena.addChild(onde);
    const dinamica = new Container(); scena.addChild(dinamica); strDinamica.current = dinamica;
    vialiDin.current = animati.viali; coloriDin.current = animati.coloriViali; origineDin.current = animati.origineViali; // PO-102: colori per strada
    app.stage.addChild(scena);

    const giallo = token('--giallo');
    let t = 0;
    const passo = (tk?: Ticker) => {
      t += (tk?.deltaMS ?? 0) / 1000;
      for (const f of tifosi) f.q.alpha = 0.75 + 0.25 * Math.sin(t * 3 + f.fase); // C22-03: minimo in ALFA_MIN.spalti
      for (const k of marcia) {
        const u = (k.u + t * 0.025) % 1;
        const pos = bezier(k.c.punti, (k.c.verso === 'entra' ? u : 1 - u) * 0.75);
        k.q.x = pos.x + k.off; k.q.y = pos.y + k.off * 0.4; if (k.h) { k.h.x = k.q.x; k.h.y = k.q.y; } k.q.tint = k.c.colori[Math.sin(k.fase + t * 4) > 0 ? 0 : 1];
      }
      const battito = 1 + 0.15 * Math.sin(t * 4);
      for (const a of aloni.current) if (a.batte) a.s.scale.set((68 * battito) / 128);
      onde.clear();
      for (const a of aloni.current) if (a.acceso) {
        const f = (t % 1.2) / 1.2;
        onde.circle(a.x, a.y, 14 + f * 26).stroke({ color: giallo, width: 3, alpha: 1 - f });
      }
      muoviDin.current?.(t);
      folla.update(); corteo.update(); aloniCorteo.update();
    };
    passo();
    const anima = !fermo();
    if (anima) app.ticker.add(passo); // da fermo resta il fotogramma disegnato da passo()
    return () => {
      app.ticker?.remove(passo);
      strato.current = null; aloni.current = []; strDinamica.current = null; muoviDin.current = null; // distrutti con la scena: il prossimo disegno non li deve toccare
      p.contenitore.current?.setAttribute('data-aloni', '0');
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
    p.contenitore.current?.setAttribute('data-aloni', String(aloni.current.length));
    p.contenitore.current?.setAttribute('data-lampeggianti', punti.filter((q) => (tutti && q.livello !== null) || q.acceso).map((q) => q.id).join(','));
    // S-26: anche gli aloni si rifanno quando lo sfondo si ridisegna (la scena vecchia li ha distrutti). Rosso C31W02: no.
  }, [punti, texAlone, pianta, p.contenitore, spento('C31W02') ? 0 : volte]);

  // PO-089: chi si muove per la chiamata in corso (corteo sul viale citato o folla attorno al punto).
  useEffect(() => {
    const livello = strDinamica.current;
    if (!livello) return;
    livello.removeChildren().forEach((c) => c.destroy());
    const q = punti.find((x) => x.id === p.citato);
    const d = dinamicaDi(p.citato, q?.tipo, vialiDin.current);
    // C23-01: club dell'evento dell'ondata → club della strada → curva omonima → neutro (come i cortei dell'ondata)
    const delClub = d && p.folla.club?.[d.settore] ? datiClub.get(p.folla.club[d.settore]!)?.colori : undefined;
    const colori: [string, string] = delClub ? [colore(delClub.primario)!, colore(delClub.secondario)!] : d ? coloriDin.current[d.settore] ?? neutroCorteo().map(token) as [string, string] : ['', ''];
    muoviDin.current = d && q ? costruisciDinamica(livello, d, q, vialiDin.current.find((v) => v.id === d.settore)?.punti ?? null, colori, !vialiDin.current.find((v) => v.id === d.settore)?.versoMeta && esceDinamica(p.folla, d.settore)) : null;
    muoviDin.current?.(0);
    p.contenitore.current?.setAttribute('data-dinamica', d ? `${d.tipo}:${d.settore}` : '');
    p.contenitore.current?.setAttribute('data-dinamica-colori', d?.tipo === 'corteo' ? delClub?.primario ?? origineDin.current[d.settore] ?? 'neutro' : '');
  }, [punti, pianta, volte, p.citato, p.folla.spalti, JSON.stringify(p.folla.club ?? {}), JSON.stringify(p.folla.cortei), p.contenitore]);
  return null;
}

export function StratoPixi(p: { contenitore: RefObject<HTMLDivElement | null>; punti: PuntoMappa[]; margine: Margine; atmosfera: Atmosfera; folla: Folla; citato?: string; pronto: () => void }) {
  return (
    <Application className="mappa-tela" resizeTo={p.contenitore} preference="webgl" backgroundAlpha={0} antialias autoDensity
      resolution={Math.min(2, window.devicePixelRatio || 1)} onInit={p.pronto}>
      <Disegno punti={p.punti} margine={p.margine} atmosfera={p.atmosfera} folla={p.folla} citato={p.citato} contenitore={p.contenitore} />
    </Application>
  );
}
