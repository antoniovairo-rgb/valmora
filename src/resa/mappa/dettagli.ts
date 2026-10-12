// Dettagli grafici delle mappe (D-095): disegni dall'alto, nella texture dello sfondo (sfondo.ts), al centro
// della mappa («id») o accanto a un settore («id@settore»). Luoghi inventati, niente insegne né scritte,
// nessuna persona ferita in vista. Colori solo dai token «--mappa-*».
import { spento } from '../../interruttori.ts';
import { alfa, token, type Pt } from './sfondo.ts';

export interface Dettaglio { id: string; settore?: string }
/** «banca@piazza_centrale» → { id: 'banca', settore: 'piazza_centrale' } */
export const leggiDettaglio = (x: string): Dettaglio => { const [id = '', settore] = x.split('@'); return settore ? { id, settore } : { id }; };

type F = CanvasRenderingContext2D;
const ombra = (f: F, x: number, y: number, w: number, h: number) => { f.fillStyle = alfa(token('--nero'), 0.4); f.fillRect(x + 3, y + 3, w, h); };
const blocco = (f: F, x: number, y: number, w: number, h: number, colore: string) => { ombra(f, x, y, w, h); f.fillStyle = colore; f.fillRect(x, y, w, h); };
const tondo = (f: F, x: number, y: number, r: number, colore: string) => { f.fillStyle = colore; f.beginPath(); f.arc(x, y, r, 0, 7); f.fill(); };
const auto = (f: F, x: number, y: number, colore: string, giro = 0) => {
  f.save(); f.translate(x, y); f.rotate(giro); ombra(f, -6, -3, 12, 6); f.fillStyle = colore; f.fillRect(-6, -3, 12, 6);
  f.fillStyle = alfa(token('--nero'), 0.35); f.fillRect(-2, -3, 3, 6); f.restore();
};

/** Banca: palazzo di pietra col colonnato sul davanti e un furgone portavalori fermo all'ingresso. */
function banca(f: F, c: Pt) {
  blocco(f, c.x - 34, c.y - 26, 68, 40, token('--mappa-pietra'));
  f.fillStyle = alfa(token('--nero'), 0.18); f.fillRect(c.x - 34, c.y - 26, 68, 6);
  for (let i = 0; i < 6; i++) tondo(f, c.x - 27 + i * 11, c.y + 18, 2.4, token('--mappa-pietra'));
  auto(f, c.x + 22, c.y + 28, token('--mappa-furgone'));
  f.fillStyle = token('--mappa-furgone'); f.fillRect(c.x + 12, c.y + 25, 22, 7);
}

/** Zona rossa: perimetro di transenne tratteggiato con due varchi presidiati da furgoni. */
function zonaRossa(f: F, c: Pt) {
  f.strokeStyle = token('--mappa-transenna'); f.lineWidth = 3; f.setLineDash([7, 4]);
  f.beginPath(); f.moveTo(c.x - 14, c.y - 34); f.lineTo(c.x - 50, c.y - 34); f.lineTo(c.x - 50, c.y + 34); f.lineTo(c.x + 50, c.y + 34);
  f.lineTo(c.x + 50, c.y - 34); f.lineTo(c.x + 14, c.y - 34); f.stroke(); f.setLineDash([]);
  auto(f, c.x - 22, c.y - 42, token('--mappa-presidio')); auto(f, c.x + 22, c.y - 42, token('--mappa-presidio'));
}

/** Palco del concerto: palco scuro con la copertura, due torri delle luci e il prato davanti. */
function palco(f: F, c: Pt, r: () => number) {
  f.fillStyle = alfa(token('--mappa-prato-1'), 0.8); f.fillRect(c.x - 46, c.y - 6, 92, 40);
  blocco(f, c.x - 30, c.y - 30, 60, 22, token('--mappa-palco'));
  f.strokeStyle = alfa(token('--bianco'), 0.5); f.lineWidth = 1;
  for (let i = 1; i < 6; i++) { f.beginPath(); f.moveTo(c.x - 30 + i * 10, c.y - 30); f.lineTo(c.x - 30 + i * 10, c.y - 8); f.stroke(); }
  for (const s of [-1, 1]) { blocco(f, c.x + s * 26 - 3, c.y + 4, 6, 6, token('--mappa-palco')); tondo(f, c.x + s * 26, c.y + 7, 6, alfa(token('--mappa-faro'), 0.4)); }
  const folla = [1, 2, 3].map((i) => token(`--mappa-folla-${i}`));
  for (let i = 0; i < 90; i++) { f.fillStyle = folla[i % 3]!; f.fillRect(c.x - 40 + r() * 80, c.y + 12 + r() * 20, 1.5, 1.5); }
}

/** Piazza storica: lastricato a riquadri, fontana al centro, portici sui due lati lunghi. */
function piazzaStorica(f: F, c: Pt) {
  f.fillStyle = token('--mappa-lastricato'); f.fillRect(c.x - 48, c.y - 34, 96, 68);
  f.strokeStyle = alfa(token('--nero'), 0.12); f.lineWidth = 1;
  for (let x = -48; x <= 48; x += 12) { f.beginPath(); f.moveTo(c.x + x, c.y - 34); f.lineTo(c.x + x, c.y + 34); f.stroke(); }
  for (let y = -34; y <= 34; y += 12) { f.beginPath(); f.moveTo(c.x - 48, c.y + y); f.lineTo(c.x + 48, c.y + y); f.stroke(); }
  for (const s of [-1, 1]) {
    blocco(f, c.x - 48, c.y + s * 40 - 5, 96, 10, token('--mappa-tetto-2'));
    for (let i = 0; i < 8; i++) { f.fillStyle = alfa(token('--nero'), 0.3); f.fillRect(c.x - 44 + i * 12, c.y + s * 40 - 1, 6, 2); }
  }
  tondo(f, c.x, c.y, 11, token('--mappa-pietra')); tondo(f, c.x, c.y, 8, token('--mappa-acqua')); tondo(f, c.x, c.y, 2, token('--mappa-pietra'));
}

/** Fabbrica: capannoni col tetto a denti di sega, ciminiera spenta, cancello sul davanti. */
function fabbrica(f: F, c: Pt) {
  blocco(f, c.x - 44, c.y - 28, 70, 46, token('--mappa-capannone'));
  f.fillStyle = alfa(token('--nero'), 0.22);
  for (let i = 0; i < 7; i++) f.fillRect(c.x - 44 + i * 10, c.y - 28, 4, 46);
  tondo(f, c.x + 38, c.y - 18, 7, alfa(token('--nero'), 0.4)); tondo(f, c.x + 36, c.y - 20, 7, token('--mappa-pietra')); tondo(f, c.x + 36, c.y - 20, 3, token('--nero'));
  f.strokeStyle = token('--mappa-transenna'); f.lineWidth = 2; f.beginPath(); f.moveTo(c.x - 44, c.y + 30); f.lineTo(c.x + 26, c.y + 30); f.stroke();
}

/** Stabile occupato: palazzo col cortile e striscioni colorati appesi ai lati (senza scritte). */
function stabileOccupato(f: F, c: Pt) {
  blocco(f, c.x - 36, c.y - 30, 72, 60, token('--mappa-tetto-4'));
  f.fillStyle = token('--mappa-piazzale'); f.fillRect(c.x - 18, c.y - 14, 36, 28);
  const strisce = [1, 2, 3].map((i) => token(`--mappa-striscione-${i}`));
  [[-38, -20], [-38, 6], [34, -14], [34, 10]].forEach(([dx, dy], i) => { f.fillStyle = strisce[i % 3]!; f.fillRect(c.x + dx!, c.y + dy!, 4, 14); });
  f.fillStyle = strisce[0]!; f.fillRect(c.x - 20, c.y - 34, 40, 4);
}

/** Incidente: due auto di traverso, mezzi di soccorso, nastro e lampeggianti. Nessuna persona in vista. */
function incidente(f: F, c: Pt) {
  f.strokeStyle = token('--mappa-nastro'); f.lineWidth = 1.5; f.setLineDash([4, 3]);
  f.strokeRect(c.x - 40, c.y - 24, 80, 48); f.setLineDash([]);
  auto(f, c.x - 8, c.y - 4, token('--mappa-auto-2'), 0.6); auto(f, c.x + 8, c.y + 4, token('--mappa-auto-3'), -0.9);
  for (const [dx, dy] of [[-28, 14], [28, -14]] as const) {
    blocco(f, c.x + dx - 9, c.y + dy - 4, 18, 8, token('--mappa-soccorso'));
    f.fillStyle = token('--mappa-lampeggiante-1'); f.fillRect(c.x + dx - 3, c.y + dy - 2, 2, 2);
    f.fillStyle = token('--mappa-lampeggiante-2'); f.fillRect(c.x + dx + 1, c.y + dy - 2, 2, 2);
    tondo(f, c.x + dx, c.y + dy, 12, alfa(token('--mappa-lampeggiante-1'), 0.15));
  }
}

/** Cantiere dello stadio nuovo: terra battuta recintata, una gru e cumuli di materiale. */
function cantiere(f: F, c: Pt) {
  f.fillStyle = token('--mappa-terra'); f.fillRect(c.x - 46, c.y - 32, 92, 64);
  f.strokeStyle = token('--mappa-transenna'); f.lineWidth = 1.5; f.setLineDash([3, 2]); f.strokeRect(c.x - 46, c.y - 32, 92, 64); f.setLineDash([]);
  f.save(); f.translate(c.x - 10, c.y); f.rotate(-0.5);
  f.fillStyle = alfa(token('--nero'), 0.35); f.fillRect(-30, 4, 66, 4);
  f.fillStyle = token('--mappa-gru'); f.fillRect(-32, -2, 66, 4); f.fillRect(-4, -5, 8, 10); f.restore();
  for (const [dx, dy] of [[24, -18], [30, 14], [-30, 18]] as const) blocco(f, c.x + dx - 6, c.y + dy - 4, 12, 8, token('--mappa-tetto-5'));
}

/** Porto: specchio d'acqua, due moli, container colorati e una gru di banchina. */
function porto(f: F, c: Pt) {
  f.fillStyle = token('--mappa-acqua'); f.fillRect(c.x - 50, c.y + 6, 100, 30);
  for (const dx of [-30, 14]) blocco(f, c.x + dx, c.y + 2, 10, 30, token('--mappa-marciapiede'));
  const cont = [1, 2, 3].map((i) => token(`--mappa-container-${i}`));
  for (let i = 0; i < 12; i++) blocco(f, c.x - 46 + (i % 6) * 15, c.y - 26 + Math.floor(i / 6) * 9, 13, 6, cont[i % 3]!);
  f.fillStyle = token('--mappa-gru'); f.fillRect(c.x + 30, c.y - 30, 4, 40); f.fillRect(c.x + 22, c.y - 30, 20, 4);
}

/** Mercato: file di bancarelle con le tende a strisce. */
function mercato(f: F, c: Pt) {
  const tende = [1, 2, 3].map((i) => token(`--mappa-tenda-${i}`));
  for (let fila = 0; fila < 3; fila++) for (let i = 0; i < 6; i++) {
    const x = c.x - 45 + i * 15, y = c.y - 26 + fila * 20;
    blocco(f, x, y, 12, 10, tende[(i + fila) % 3]!);
    f.fillStyle = alfa(token('--bianco'), 0.6); f.fillRect(x + 3, y, 2, 10); f.fillRect(x + 8, y, 2, 10);
  }
}

const DISEGNI: Record<string, (f: F, c: Pt, r: () => number) => void> = {
  banca, zona_rossa: zonaRossa, palco_concerto: palco, piazza_storica: piazzaStorica, fabbrica,
  stabile_occupato: stabileOccupato, incidente, cantiere_stadio: cantiere, porto, mercato,
};

/** Disegna i dettagli che hanno un disegno qui (rosso C15D01: nessuno) (i cartelloni stanno in notte.ts); restituisce gli id disegnati. */
export function disegnaDettagli(f: F, posti: { id: string; dove: Pt }[], r: () => number): string[] {
  const fatti: string[] = [];
  if (spento('C15D01')) return fatti; // rosso: nessun dettaglio disegnato
  for (const d of posti) { const disegno = DISEGNI[d.id]; if (disegno) { disegno(f, d.dove, r); fatti.push(d.id); } }
  return fatti;
}
