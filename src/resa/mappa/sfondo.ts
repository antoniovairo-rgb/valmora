// Sfondo della mappa aerea al tramonto (D-067, bozza docs/stili/mappa-realistica.js): disegnato UNA
// volta su un canvas 2D che diventa una texture Pixi. Tetti, alberi, auto, viali, piazzale, stadio con
// le curve colorate, prato a strisce, fari e velo serale. Seme fisso (caso.ts): stessa città a ogni avvio.
// Lo stadio sta fra le due curve dei dati, i viali partono dai settori di tipo «strada».
// Colori: solo dai token CSS «--mappa-*» (letti a runtime), mai scritti qui; curve, folla e corteo coi
// colori del club della curva (dati, D-086), e se il club non li ha i token di prima.
import { creaCaso } from '../../logica/caso.ts';
import { cartelloni, notte, parcheggi, quartiere } from './notte.ts';

export interface Pt { x: number; y: number }
export interface Stadio { cx: number; cy: number; rx: number; ry: number }
export interface Colori { primario: string; secondario: string }
export interface Disposizione { W: number; H: number; club: { sx?: Colori; dx?: Colori; corteo?: Colori }; stadio: Stadio | null; viali: Pt[][]; idViali: string[]; centro: Pt; stazione: Pt | null; quartieri: Pt[]; parcheggi: Pt[]; notte: boolean; cartelloni: boolean }
/** Atmosfera della missione (campi facoltativi dei dati, mappa.ora e mappa.dettagli): e03 è di notte. */
export interface Atmosfera { notte?: boolean; cartelloni?: boolean }
export interface Animati { folla: { x: number; y: number; colore: string; fase: number }[]; viali: { id: string; punti: Pt[] }[]; coloriCorteo: [string, string]; fari: Pt[] }

// Il minificatore CSS può scrivere i token come «#fff» o con un nome: il canvas li riporta a «#rrggbb».
let tavolozza: CanvasRenderingContext2D | null = null;
export const token = (nome: string) => {
  tavolozza ??= document.createElement('canvas').getContext('2d');
  const grezzo = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  if (!tavolozza) return grezzo;
  tavolozza.fillStyle = grezzo;
  return String(tavolozza.fillStyle);
};
/** Colore di un dato (club) riportato a «#rrggbb» come i token; undefined resta undefined. */
export const colore = (grezzo: string | undefined) => {
  if (!grezzo) return undefined;
  tavolozza ??= document.createElement('canvas').getContext('2d');
  if (!tavolozza) return grezzo;
  tavolozza.fillStyle = grezzo;
  return String(tavolozza.fillStyle);
};
/** Colore del token con trasparenza, come «#rrggbbaa» (i token dei colori sono «#rrggbb»). */
export const alfa = (colore: string, a: number) => colore + Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');

const lista = (base: string, n: number) => Array.from({ length: n }, (_, i) => token(`${base}-${i + 1}`));

/** Dove stanno stadio e viali, dalle posizioni (già in pixel) dei settori. */
export function disponi(W: number, H: number, settori: { id?: string; tipo: string; x: number; y: number; colori?: Colori }[], atm: Atmosfera = {}): Disposizione {
  const curve = settori.filter((s) => s.tipo === 'curva');
  // Curva di sinistra e di destra; il corteo è degli ospiti (la curva «ospiti», altrimenti la prima dei dati).
  const [sx, dx] = [...curve].sort((a, b) => a.x - b.x);
  const club = { sx: sx?.colori, dx: dx?.colori, corteo: (curve.find((s) => s.id?.includes('ospiti')) ?? curve[0])?.colori };
  const centro = settori.length ? { x: settori.reduce((a, s) => a + s.x, 0) / settori.length, y: settori.reduce((a, s) => a + s.y, 0) / settori.length } : { x: W / 2, y: H / 2 };
  let stadio: Stadio | null = null;
  if (curve.length >= 2) {
    const a = curve[0]!, b = curve[1]!;
    const rx = Math.abs(b.x - a.x) / 2 * 0.98;
    stadio = { cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 - rx * 0.12, rx, ry: rx * 0.62 };
  }
  const meta = stadio ? { x: stadio.cx, y: stadio.cy + stadio.ry * 0.9 } : centro;
  // Se c'è una stazione (e02) i viali partono da lì: gli ospiti arrivano in treno; altrimenti dal bordo basso.
  const st = settori.find((s) => s.tipo === 'stazione');
  const stazione = st ? { x: st.x, y: st.y } : null;
  const strade = settori.filter((s) => s.tipo === 'strada');
  const viali = strade.map((s) => {
    const fine = { x: meta.x + Math.sign(s.x - meta.x) * (stadio ? stadio.rx * 0.32 : 0), y: meta.y };
    const inizio = stazione ?? { x: s.x + Math.sign(s.x - meta.x) * 18, y: H + 12 };
    return [inizio, { x: s.x, y: s.y }, { x: s.x + (fine.x - s.x) * 0.55, y: fine.y + (s.y - fine.y) * 0.35 }, fine];
  });
  const quartieri = settori.filter((s) => s.tipo === 'quartiere').map((s) => ({ x: s.x, y: s.y }));
  const parch = settori.filter((s) => s.id?.includes('parcheggi')).map((s) => ({ x: s.x, y: s.y }));
  return { W, H, club, stadio, viali, idViali: strade.map((s) => s.id ?? ''), centro, stazione, quartieri, parcheggi: parch, notte: !!atm.notte, cartelloni: !!atm.cartelloni };
}

export const bezier = (p: Pt[], t: number): Pt => {
  const u = 1 - t;
  const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return { x: p.reduce((a, q, i) => a + q.x * k[i]!, 0), y: p.reduce((a, q, i) => a + q.y * k[i]!, 0) };
};

export function disegnaSfondo(f: CanvasRenderingContext2D, d: Disposizione): Animati {
  const { W, H, stadio } = d;
  const caso = creaCaso(7);
  const r = () => caso.numero();
  const scegli = <T>(xs: T[]) => xs[Math.floor(r() * xs.length)]!;
  const dentro = (x: number, y: number, k: number) => !!stadio && ((x - stadio.cx) / (stadio.rx * k)) ** 2 + ((y - stadio.cy) / (stadio.ry * k)) ** 2 < 1;

  f.fillStyle = token('--mappa-asfalto'); f.fillRect(0, 0, W, H);
  const chiaro = token('--bianco'); const scuro = token('--nero');
  for (let i = 0; i < W * H / 12; i++) { f.fillStyle = alfa(r() < 0.5 ? chiaro : scuro, r() * 0.05); f.fillRect(r() * W, r() * H, 1, 1); }

  const st = d.stazione;
  const RQ = Math.min(W, H) * 0.2; // raggio del quartiere di case basse (e03)
  const vicino = (ps: Pt[], x: number, y: number, rx: number, ry: number) => ps.some((p) => Math.abs(x - p.x) < rx && Math.abs(y - p.y) < ry);
  isolati(f, W, H, r, (x, y) => dentro(x, y, 1.42) || (!!st && Math.abs(y - st.y) < 34 && x < st.x + 70)
    || vicino(d.quartieri, x, y, RQ + 20, RQ + 16) || vicino(d.parcheggi, x, y, 70, 50));
  if (st) stazione(f, W, st);
  for (const q of d.quartieri) quartiere(f, q, r, RQ);
  for (const q of d.parcheggi) parcheggi(f, q, r, 96, 64);
  const auto = lista('--mappa-auto', 5);
  for (let i = 0; i < 40; i++) { const x = r() * W, y = r() * H; if (dentro(x, y, 1.3)) continue; f.fillStyle = scegli(auto); f.fillRect(x, y, 6, 3); }

  // Viali verso lo stadio.
  const viale = (p: Pt[], w: number, colore: string) => {
    f.strokeStyle = colore; f.lineWidth = w; f.lineCap = 'round';
    f.beginPath(); f.moveTo(p[0]!.x, p[0]!.y); f.bezierCurveTo(p[1]!.x, p[1]!.y, p[2]!.x, p[2]!.y, p[3]!.x, p[3]!.y); f.stroke();
  };
  for (const v of d.viali) {
    viale(v, 34, alfa(scuro, 0.45)); viale(v, 30, token('--mappa-marciapiede')); viale(v, 24, token('--mappa-viale'));
    f.setLineDash([6, 8]); viale(v, 1.2, alfa(chiaro, 0.6)); f.setLineDash([]);
  }

  const folla: Animati['folla'] = []; const fari: Pt[] = [];
  if (stadio) {
    const { cx, cy, rx, ry } = stadio; const k = rx / 100; // la bozza è disegnata con rx = 100
    f.fillStyle = token('--mappa-piazzale'); f.beginPath(); f.ellipse(cx, cy + 10 * k, rx * 1.28, ry * 1.39, 0, 0, 7); f.fill();
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2, x = cx + Math.cos(a) * rx * 1.22, y = cy + 10 * k + Math.sin(a) * ry * 1.29;
      f.fillStyle = alfa(scuro, 0.35); f.beginPath(); f.arc(x + 2, y + 2, 4 * k, 0, 7); f.fill();
      f.fillStyle = token('--mappa-siepe'); f.beginPath(); f.arc(x, y, 4 * k, 0, 7); f.fill();
    }
    f.fillStyle = alfa(scuro, 0.55); f.beginPath(); f.ellipse(cx + 6 * k, cy + 8 * k, rx * 1.04, ry * 1.06, 0, 0, 7); f.fill();
    for (let i = 0; i < 14; i++) {
      const t = i / 14;
      f.beginPath(); f.ellipse(cx, cy, rx - t * 24 * k, ry - t * 15 * k, 0, 0, 7);
      f.fillStyle = token(i % 2 ? '--mappa-gradinata-1' : '--mappa-gradinata-2'); f.fill();
    }
    const curva = (a0: number, a1: number, colore: string) => {
      for (let i = 0; i < 12; i++) {
        f.beginPath(); f.ellipse(cx, cy, rx * 0.98 - i * 2 * k, ry * 0.97 - i * 1.3 * k, 0, a0, a1);
        f.strokeStyle = alfa(colore, 0.25 + 0.04 * i); f.lineWidth = 1.6 * k; f.stroke();
      }
    };
    curva(Math.PI * 0.72, Math.PI * 1.28, colore(d.club.sx?.primario) ?? token('--mappa-curva-a')); curva(-Math.PI * 0.28, Math.PI * 0.28, colore(d.club.dx?.primario) ?? token('--mappa-curva-b'));
    // Tifosi delle curve: tre su quattro col primario, uno col secondario (sciarpe e bandiere).
    const tifoso = (c: Colori | undefined, i: number, base: string) => (c ? colore(i % 4 ? c.primario : c.secondario)! : token(base));
    const pw = 88 * k, ph = 52 * k;
    f.save(); f.beginPath(); f.rect(cx - pw / 2, cy - ph / 2, pw, ph); f.clip();
    for (let i = 0; i < 10; i++) { f.fillStyle = token(i % 2 ? '--mappa-prato-1' : '--mappa-prato-2'); f.fillRect(cx - pw / 2 + (i * pw) / 10, cy - ph / 2, pw / 10, ph); }
    f.restore();
    f.strokeStyle = alfa(chiaro, 0.85); f.lineWidth = 0.8;
    f.strokeRect(cx - pw / 2 + 2 * k, cy - ph / 2 + 2 * k, pw - 4 * k, ph - 4 * k);
    f.beginPath(); f.moveTo(cx, cy - ph / 2 + 2 * k); f.lineTo(cx, cy + ph / 2 - 2 * k); f.stroke();
    f.beginPath(); f.arc(cx, cy, 7 * k, 0, 7); f.stroke();
    f.strokeRect(cx - pw / 2 + 2 * k, cy - 10 * k, 10 * k, 20 * k); f.strokeRect(cx + pw / 2 - 12 * k, cy - 10 * k, 10 * k, 20 * k);
    f.strokeStyle = alfa(token('--mappa-tetto-stadio'), 0.55); f.lineWidth = 6 * k; f.beginPath(); f.ellipse(cx, cy, rx * 1.01, ry * 1.01, 0, 0, 7); f.stroke();
    // Fari e loro luce (fissi: stanno nella texture).
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
      const p = { x: cx + sx * 92 * k, y: cy + sy * 56 * k }; fari.push(p);
      const g = f.createRadialGradient(p.x, p.y, 0, p.x, p.y, 80 * k);
      g.addColorStop(0, alfa(token('--mappa-faro'), 0.5)); g.addColorStop(1, alfa(token('--mappa-faro'), 0));
      f.fillStyle = g; f.beginPath(); f.arc(p.x, p.y, 80 * k, 0, 7); f.fill();
      f.fillStyle = token('--mappa-faro'); f.beginPath(); f.arc(p.x, p.y, 2.2, 0, 7); f.fill();
    }
    const tinte = lista('--mappa-folla', 3);
    for (let i = 0; i < 1400; i++) {
      const a = r() * Math.PI * 2, q = r(), c = Math.cos(a);
      folla.push({ x: cx + c * (rx - q * 22 * k), y: cy + Math.sin(a) * (ry - q * 14 * k), fase: r() * 6.28,
        colore: c < -0.55 ? tifoso(d.club.sx, i, '--mappa-folla-a') : c > 0.55 ? tifoso(d.club.dx, i, '--mappa-folla-b') : scegli(tinte) });
    }
  }
  // Velo serale.
  const v = f.createLinearGradient(0, 0, 0, H);
  v.addColorStop(0, alfa(token('--mappa-velo-alto'), 0.28)); v.addColorStop(1, alfa(token('--mappa-velo-basso'), 0.1));
  f.fillStyle = v; f.fillRect(0, 0, W, H);
  if (d.cartelloni && d.viali[0]) cartelloni(f, d.viali[0]);
  if (d.notte) notte(f, W, H, d.viali, fari, r);
  const corteo = d.club.corteo;
  return { folla, viali: d.viali.map((punti, i) => ({ id: d.idViali[i] ?? '', punti })), fari,
    coloriCorteo: corteo ? [colore(corteo.primario)!, colore(corteo.secondario)!] : [token('--mappa-corteo-1'), token('--mappa-corteo-2')] };
}

/** Isolati con tetti, ombre, comignoli e alberi; «salta» lascia libero un posto (stadio, fiume). */
function isolati(f: CanvasRenderingContext2D, W: number, H: number, r: () => number, salta: (x: number, y: number) => boolean) {
  const scegli = <T>(xs: T[]) => xs[Math.floor(r() * xs.length)]!;
  const chiaro = token('--bianco'); const scuro = token('--nero');
  const tetti = lista('--mappa-tetto', 7); const alberi = lista('--mappa-albero', 3);
  for (let y = 6; y < H; y += 46) for (let x = 4; x < W; x += 58) {
    if (salta(x + 27, y + 20)) continue;
    f.fillStyle = token('--mappa-isolato'); f.fillRect(x, y, 54, 40);
    for (let k = 0; k < 5; k++) {
      const bw = 10 + r() * 20, bh = 10 + r() * 16, bx = x + 2 + r() * (52 - bw), by = y + 2 + r() * (38 - bh);
      f.fillStyle = alfa(scuro, 0.45); f.fillRect(bx + 3, by + 3, bw, bh);
      f.fillStyle = scegli(tetti); f.fillRect(bx, by, bw, bh);
      f.fillStyle = alfa(chiaro, 0.1); f.fillRect(bx, by, bw, 1.2);
      f.fillStyle = alfa(scuro, 0.18); f.fillRect(bx + bw / 2 - 0.5, by, 1, bh);
      if (r() < 0.5) { f.fillStyle = token('--mappa-marciapiede'); f.fillRect(bx + 2, by + 2, 3, 2); }
    }
    if (r() < 0.6) for (let k = 0; k < 4; k++) {
      const tx = x + r() * 54, ty = y + r() * 40, tr = 2.5 + r() * 3;
      f.fillStyle = alfa(scuro, 0.4); f.beginPath(); f.arc(tx + 2, ty + 2, tr, 0, 7); f.fill();
      f.fillStyle = scegli(alberi); f.beginPath(); f.arc(tx, ty, tr, 0, 7); f.fill();
    }
  }
}

/** Stazione (e02): fascio di binari che esce dal bordo sinistro, pensiline e fabbricato viaggiatori. */
function stazione(f: CanvasRenderingContext2D, W: number, st: Pt) {
  const fine = Math.min(W, st.x + 62);
  f.fillStyle = token('--mappa-viale'); f.fillRect(0, st.y - 16, fine, 32);
  for (let x = 0; x < fine; x += 5) { f.fillStyle = alfa(token('--mappa-marciapiede'), 0.35); f.fillRect(x, st.y - 15, 1.5, 30); }
  f.strokeStyle = token('--mappa-marciapiede'); f.lineWidth = 1;
  for (const dy of [-11, -6, 6, 11]) { f.beginPath(); f.moveTo(0, st.y + dy); f.lineTo(fine, st.y + dy); f.stroke(); }
  f.fillStyle = token('--mappa-tetto-4'); f.fillRect(st.x - 40, st.y - 2, 80, 4); // pensilina
  f.fillStyle = alfa(token('--nero'), 0.45); f.fillRect(st.x - 31, st.y + 19, 64, 18);
  f.fillStyle = token('--mappa-tetto-7'); f.fillRect(st.x - 34, st.y + 16, 64, 18); // fabbricato viaggiatori
  f.fillStyle = alfa(token('--bianco'), 0.15); f.fillRect(st.x - 34, st.y + 16, 64, 2);
}

/** Città di Valmora dall'alto per la mappa degli episodi (D-061): isolati, fiume, parco, velo serale. */
export function disegnaCitta(f: CanvasRenderingContext2D, W: number, H: number) {
  const caso = creaCaso(11); const r = () => caso.numero();
  const fiume = (x: number) => H * 0.22 + Math.sin((x / W) * Math.PI * 1.6) * H * 0.08 + (x / W) * H * 0.1;
  f.fillStyle = token('--mappa-asfalto'); f.fillRect(0, 0, W, H);
  isolati(f, W, H, r, (x, y) => Math.abs(y - fiume(x)) < 34 || (x > W * 0.55 && y > H * 0.62 && y < H * 0.82));
  f.fillStyle = token('--citta-parco'); f.fillRect(W * 0.57, H * 0.64, W * 0.36, H * 0.16);
  f.strokeStyle = token('--citta-fiume'); f.lineWidth = Math.max(14, W / 18); f.lineCap = 'round';
  f.beginPath(); for (let x = -10; x <= W + 10; x += 6) (x === -10 ? f.moveTo(x, fiume(x)) : f.lineTo(x, fiume(x))); f.stroke();
  for (const q of [0.3, 0.7]) { f.fillStyle = token('--mappa-marciapiede'); f.fillRect(W * q - 5, fiume(W * q) - 26, 10, 52); }
  const v = f.createLinearGradient(0, 0, 0, H);
  v.addColorStop(0, alfa(token('--mappa-velo-alto'), 0.28)); v.addColorStop(1, alfa(token('--mappa-velo-basso'), 0.1));
  f.fillStyle = v; f.fillRect(0, 0, W, H);
}

/** Texture dell'alone dei settori: bianco al centro, trasparente al bordo; il colore lo dà la tinta. */
export function canvasAlone(lato: number): HTMLCanvasElement {
  const c = document.createElement('canvas'); c.width = c.height = lato;
  const g = c.getContext('2d')!; const b = token('--bianco');
  const gr = g.createRadialGradient(lato / 2, lato / 2, 0, lato / 2, lato / 2, lato / 2);
  gr.addColorStop(0, alfa(b, 0.75)); gr.addColorStop(1, alfa(b, 0));
  g.fillStyle = gr; g.fillRect(0, 0, lato, lato);
  return c;
}
