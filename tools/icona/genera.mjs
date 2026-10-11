// Genera le icone di Valmora (PO-048) da tools/icona/icona.svg.mjs con Chromium (playwright-core).
// Android: mipmap-*/ic_launcher.png, ic_launcher_round.png, ic_launcher_foreground.png (+ sfondo giallo adattivo).
// Web: public/icone/icona-{192,512}.png, icona-maskable-512.png, apple-touch-icon.png (180), favicon-32.png.
import { mkdirSync, writeFileSync } from 'node:fs';
import { iconaSvg } from './icona.svg.mjs';
const { chromium } = await import('playwright-core');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage();
async function png(svg, size, file, tondo = false) {
  await p.setViewportSize({ width: size, height: size });
  await p.setContent(`<html><body style="margin:0;background:transparent"><div style="width:${size}px;height:${size}px;${tondo ? 'border-radius:50%;overflow:hidden;' : ''}">${svg.replace('width="1024" height="1024"', `width="${size}" height="${size}"`)}</div></body></html>`);
  writeFileSync(file, await p.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } }));
}
const piena = iconaSvg({ sfondo: true, scala: 1.25 });
const primoPiano = iconaSvg({ sfondo: false, scala: 0.8 });  // dentro il cerchio sicuro del primo piano adattivo
const maskable = iconaSvg({ sfondo: true, scala: 1.0 });     // web «maskable»: soggetto nel 80% centrale
const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [d, f] of Object.entries(dens)) {
  const dir = `android/app/src/main/res/mipmap-${d}`;
  await png(piena, 48 * f, `${dir}/ic_launcher.png`);
  await png(piena, 48 * f, `${dir}/ic_launcher_round.png`, true);
  await png(primoPiano, 108 * f, `${dir}/ic_launcher_foreground.png`);
}
writeFileSync('android/app/src/main/res/values/ic_launcher_background.xml', '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#FFD400</color>\n</resources>\n');
mkdirSync('public/icone', { recursive: true });
await png(piena, 192, 'public/icone/icona-192.png');
await png(piena, 512, 'public/icone/icona-512.png');
await png(maskable, 512, 'public/icone/icona-maskable-512.png');
await png(piena, 180, 'public/icone/apple-touch-icon.png');
await png(piena, 32, 'public/icone/favicon-32.png');
writeFileSync('public/icone/icona.svg', piena);
await b.close();
console.log('icone generate');
