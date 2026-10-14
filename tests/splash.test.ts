// C22-07: splash d'avvio Android col logo di Valmora (generato da tools/icona/splash.mjs), in tutte le densità e nei due
// orientamenti, mai il modello di Capacitor; da Android 12 (values-v31) colore e icona della schermata d'avvio.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const RES = 'android/app/src/main/res';
const MISURE: Record<string, [number, number]> = { mdpi: [320, 480], hdpi: [480, 800], xhdpi: [720, 1280], xxhdpi: [960, 1600], xxxhdpi: [1280, 1920] };
/** Impronte (sha256) dei splash.png del modello di Capacitor, com'erano nel ramo fino a d5475c2. */
const MODELLO = ['07fa579e1c83e04ba7f9cbcbfcf41b68e15fe3638f2c44a04e58b809103e6b69','08cc34ad7713fe7ed58bceaa37b2387b670c53cd60264b4bd6442db3098e75dc','0c7f1212f25b7b90e9a6e1d320013e4ff3d3e03e634cbb07b7b7981cac51627f','22f87e1e3bc89aa01a7dbc39c9a4db058cd0bf4ad3fe9f55712bf69eb997f4bf','3db071a03b2f8ffe0dfd4170fc59842d53cd15bba5e88af59401d58efabf7827','42aa26392546fcdee1b8d3ac6d4b41bfcceb41dc6a4f3a3c30c24a8a8f4db862','5cf98b4451bd99b20df26f9e608a46946118be6b0ae90762f9ca1786a30c76ff','60393ce8636fd263e4e1fea3fd4ab2de948c6295e898fda9b50ac4e5283be809','b73049cb37fe76d6c11b87a796766bf6af0c85483b31eb6a921657b0d764a4b9','c5015f4ba3628392b538386c5e210f0b94f352a3160adab934fd0311972137ca'];

type Leggi = (percorso: string) => Buffer | null;
export function controllaSplash(leggi: Leggi, modello = MODELLO): string[] {
  const errori: string[] = [];
  const file: [string, number, number][] = [['drawable/splash.png', 480, 320]];
  for (const [d, [c, l]] of Object.entries(MISURE)) file.push([`drawable-port-${d}/splash.png`, c, l], [`drawable-land-${d}/splash.png`, l, c]);
  for (const [f, w, h] of file) {
    const b = leggi(`${RES}/${f}`);
    if (!b) { errori.push(`${f} manca`); continue; }
    const [lw, lh] = [b.readUInt32BE(16), b.readUInt32BE(20)]; // intestazione IHDR del PNG
    if (lw !== w || lh !== h) errori.push(`${f} è ${lw}×${lh} invece di ${w}×${h}`);
    if (modello.includes(createHash('sha256').update(b).digest('hex'))) errori.push(`${f} è ancora il modello di Capacitor`);
  }
  const stili = leggi(`${RES}/values-v31/styles.xml`)?.toString() ?? '';
  for (const [attr, risorsa] of [['android:windowSplashScreenBackground', 'values/ic_launcher_background.xml'], ['android:windowSplashScreenAnimatedIcon', 'mipmap-mdpi/ic_launcher_foreground.png']]) {
    if (!stili.includes(`name="${attr}"`)) errori.push(`values-v31: manca ${attr}`);
    else if (!leggi(`${RES}/${risorsa}`)) errori.push(`${attr}: manca ${risorsa}`);
  }
  return errori;
}

const disco: Leggi = (p) => (existsSync(p) ? readFileSync(p) : null);

describe('C22-07 splash di Valmora', () => {
  it('11 splash nelle misure giuste, nessuno del modello, colore e icona per Android 12+', () => {
    expect(controllaSplash(disco)).toEqual([]);
  });
  it('braccio rosso: vede il modello, le misure sbagliate e gli stili mancanti', () => {
    const qui = createHash('sha256').update(readFileSync(`${RES}/drawable/splash.png`)).digest('hex');
    expect(controllaSplash(disco, [qui])).toContain('drawable/splash.png è ancora il modello di Capacitor');
    const corto = Buffer.alloc(24); corto.writeUInt32BE(1, 16); corto.writeUInt32BE(1, 20);
    const errori = controllaSplash((p) => (p.endsWith('.png') ? corto : null));
    expect(errori).toContain('drawable/splash.png è 1×1 invece di 480×320');
    expect(errori).toContain('values-v31: manca android:windowSplashScreenBackground');
  });
});
