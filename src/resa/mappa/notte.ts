// Dettagli della mappa aerea per e03 «Notte di coppa» (D-081…D-084): quartiere di case basse attaccato
// allo stadio, parcheggi con le strisce, notte (velo scuro, finestre accese, lampioni lungo i viali) e i
// cartelloni del progetto «stadio nuovo» in fondo al primo viale. Tutto dentro la texture disegnata una
// volta (sfondo.ts). Colori solo dai token «--mappa-*».
import { alfa, bezier, token, type Pt } from './sfondo.ts';

/** Case basse a schiera con orti, fitte, attorno al punto del settore «quartiere». */
export function quartiere(f: CanvasRenderingContext2D, q: Pt, r: () => number, raggio: number) {
  const tetti = [1, 2, 3, 7].map((i) => token(`--mappa-tetto-${i}`));
  const scuro = token('--nero');
  for (let y = q.y - raggio; y < q.y + raggio; y += 13) for (let x = q.x - raggio; x < q.x + raggio; x += 11) {
    if ((x - q.x) ** 2 + (y - q.y) ** 2 > raggio * raggio) continue;
    f.fillStyle = alfa(scuro, 0.4); f.fillRect(x + 2, y + 2, 9, 7);
    f.fillStyle = tetti[Math.floor(r() * tetti.length)]!; f.fillRect(x, y, 9, 7);
    f.fillStyle = alfa(scuro, 0.25); f.fillRect(x + 4, y, 1, 7); // colmo del tetto
    if (r() < 0.35) { f.fillStyle = token('--mappa-albero-2'); f.fillRect(x + 1, y + 8, 7, 4); } // orto
  }
}

/** Parcheggio: piazzale grigio con le strisce bianche e le auto in fila. */
export function parcheggi(f: CanvasRenderingContext2D, q: Pt, r: () => number, w: number, h: number) {
  const x0 = q.x - w / 2, y0 = q.y - h / 2;
  f.fillStyle = token('--mappa-parcheggio'); f.fillRect(x0, y0, w, h);
  const auto = [1, 2, 3, 4, 5].map((i) => token(`--mappa-auto-${i}`));
  for (let fila = 0; fila < 3; fila++) {
    const y = y0 + 6 + fila * (h - 12) / 3;
    for (let x = x0 + 4; x < x0 + w - 6; x += 8) {
      f.fillStyle = alfa(token('--bianco'), 0.7); f.fillRect(x, y, 1, 10);
      if (r() < 0.7) { f.fillStyle = auto[Math.floor(r() * auto.length)]!; f.fillRect(x + 2, y + 2, 4, 7); }
    }
  }
}

/** Cartelloni del progetto «stadio nuovo» (D-084): pannelli chiari in fondo al viale, senza scritte. */
export function cartelloni(f: CanvasRenderingContext2D, viale: Pt[]) {
  for (const t of [0.12, 0.2]) {
    const p = bezier(viale, t);
    f.fillStyle = alfa(token('--nero'), 0.5); f.fillRect(p.x + 14, p.y - 5, 26, 12);
    f.fillStyle = token('--mappa-cartellone'); f.fillRect(p.x + 12, p.y - 7, 26, 12);
    f.fillStyle = token('--magenta'); f.fillRect(p.x + 12, p.y - 7, 26, 3);
    f.fillStyle = token('--ciano'); f.fillRect(p.x + 15, p.y - 1, 12, 2);
  }
}

/** Notte: velo scuro su tutto, poi finestre accese sui tetti e lampioni lungo i viali, che restano luminosi. */
export function notte(f: CanvasRenderingContext2D, W: number, H: number, viali: Pt[][], fari: Pt[], r: () => number) {
  f.fillStyle = alfa(token('--mappa-notte'), 0.62); f.fillRect(0, 0, W, H);
  const finestra = token('--mappa-finestra');
  for (let i = 0; i < W * H / 260; i++) {
    const x = r() * W, y = r() * H;
    f.fillStyle = alfa(finestra, 0.55 + r() * 0.4); f.fillRect(x, y, 1.6, 1.6);
  }
  const luce = (p: Pt, raggio: number, forza: number) => {
    const g = f.createRadialGradient(p.x, p.y, 0, p.x, p.y, raggio);
    g.addColorStop(0, alfa(token('--mappa-lampione'), forza)); g.addColorStop(1, alfa(token('--mappa-lampione'), 0));
    f.fillStyle = g; f.beginPath(); f.arc(p.x, p.y, raggio, 0, 7); f.fill();
    f.fillStyle = token('--mappa-lampione'); f.beginPath(); f.arc(p.x, p.y, 1.4, 0, 7); f.fill();
  };
  for (const v of viali) for (let t = 0.05; t < 1; t += 0.11) { const p = bezier(v, t); luce({ x: p.x + 14, y: p.y }, 14, 0.5); luce({ x: p.x - 14, y: p.y }, 14, 0.5); }
  for (const p of fari) luce(p, 60, 0.3);
}
