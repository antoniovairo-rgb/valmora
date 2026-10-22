// S-23: Chromium salva un PNG opaco come RGB (24 bit) anche con omitBackground; Play vuole l'icona «32-bit PNG
// (with alpha)». Qui un PNG RGB a 8 bit diventa RGBA a 8 bit (alfa 255 dove non c'era), pixel identici.
import { deflateSync, inflateSync } from 'node:zlib';

const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function blocco(tipo, dati) {
  const t = Buffer.from(tipo, 'ascii'), l = Buffer.alloc(4), c = Buffer.alloc(4);
  l.writeUInt32BE(dati.length); c.writeUInt32BE(crc(Buffer.concat([t, dati])));
  return Buffer.concat([l, t, dati, c]);
}
const paeth = (a, b, c) => { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };

export function rgba(png) {
  const w = png.readUInt32BE(16), h = png.readUInt32BE(20), bit = png[24], colore = png[25];
  if (colore === 6) return png;
  if (colore !== 2 || bit !== 8 || png[28] !== 0) throw new Error(`PNG non gestito: colore ${colore}, ${bit} bit, interlacciato ${png[28]}`);
  const idat = [];
  for (let i = 8; i < png.length;) { const n = png.readUInt32BE(i), t = png.toString('ascii', i + 4, i + 8); if (t === 'IDAT') idat.push(png.subarray(i + 8, i + 8 + n)); i += 12 + n; }
  const raw = inflateSync(Buffer.concat(idat)), riga = w * 3, out = Buffer.alloc(h * (w * 4 + 1));
  let prima = Buffer.alloc(riga);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (riga + 1)], r = Buffer.from(raw.subarray(y * (riga + 1) + 1, (y + 1) * (riga + 1)));
    for (let x = 0; x < riga; x++) {
      const a = x >= 3 ? r[x - 3] : 0, b = prima[x], c = x >= 3 ? prima[x - 3] : 0;
      r[x] = (r[x] + [0, a, b, (a + b) >> 1, paeth(a, b, c)][f]) & 0xff;
    }
    const o = y * (w * 4 + 1);
    for (let x = 0; x < w; x++) { out[o + 1 + x * 4] = r[x * 3]; out[o + 2 + x * 4] = r[x * 3 + 1]; out[o + 3 + x * 4] = r[x * 3 + 2]; out[o + 4 + x * 4] = 255; }
    prima = r;
  }
  const ihdr = Buffer.from(png.subarray(16, 29)); ihdr[9] = 6;
  return Buffer.concat([png.subarray(0, 8), blocco('IHDR', ihdr), blocco('IDAT', deflateSync(out, { level: 9 })), blocco('IEND', Buffer.alloc(0))]);
}
