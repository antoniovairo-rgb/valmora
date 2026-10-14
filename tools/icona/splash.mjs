// C22-07: splash d'avvio Android col logo di Valmora (prima: i 11 splash.png del modello di Capacitor). Stesso disegno
// dell'icona (icona.svg.mjs), al centro, alto il 40% del lato corto, su giallo col retino; tutte le densità e i due
// orientamenti. Da Android 12 il sistema non mostra questa immagine: usa values-v31/styles.xml (colore e icona).
// Uso: node tools/icona/splash.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { iconaSvg } from './icona.svg.mjs';
const { chromium } = await import('playwright-core');
const RES = 'android/app/src/main/res';
const MISURE = { // lato corto × lato lungo, come i file di Capacitor che sostituisce
  mdpi: [320, 480], hdpi: [480, 800], xhdpi: [720, 1280], xxhdpi: [960, 1600], xxxhdpi: [1280, 1920],
};
const giallo = readFileSync('src/resa/token.css', 'utf8').match(/--giallo:\s*(#[0-9a-f]{6})/i)[1];
const soggetto = iconaSvg({ sfondo: false, scala: 1.25 }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
function svg(w, h) {
  const f = Math.min(w, h) / 320; // il retino cresce con la densità (mdpi: 22 px)
  const lato = Math.round(Math.min(w, h) * 0.55); // con scala 1,25 il soggetto è circa il 73% del riquadro: ~40% del lato corto
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <pattern id="r" width="${22 * f}" height="${22 * f}" patternUnits="userSpaceOnUse"><circle cx="${11 * f}" cy="${11 * f}" r="${4.2 * f}" fill="#e6be00"/></pattern>
  <rect width="${w}" height="${h}" fill="${giallo}"/><rect width="${w}" height="${h}" fill="url(#r)"/>
  <svg x="${(w - lato) / 2}" y="${(h - lato) / 2}" width="${lato}" height="${lato}" viewBox="0 0 1024 1024">${soggetto}</svg></svg>`;
}
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage();
async function png(w, h, file) {
  await p.setViewportSize({ width: w, height: h });
  await p.setContent(`<html><body style="margin:0">${svg(w, h)}</body></html>`);
  writeFileSync(file, await p.screenshot({ clip: { x: 0, y: 0, width: w, height: h } }));
}
for (const [d, [corto, lungo]] of Object.entries(MISURE)) {
  await png(corto, lungo, `${RES}/drawable-port-${d}/splash.png`);
  await png(lungo, corto, `${RES}/drawable-land-${d}/splash.png`);
}
await png(480, 320, `${RES}/drawable/splash.png`);
await b.close();
console.log('splash: 11 file in', RES);
