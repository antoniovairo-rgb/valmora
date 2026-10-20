// C-044: scorrimento (scrollHeight − innerHeight) di home senza/con salvataggio e città, a 360/375/412 × 760 e a 360×640, 375×667.
// Uso: node coordination/sonde/c44-altezze.mjs <cartella foto>
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { servi } from '../../tools/foto.mjs';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { GAME_VERSION } from '../../src/versione.ts';
const cartella = process.argv[2]; mkdirSync(cartella, { recursive: true });
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
const ms = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x).sort((a, b) => a.episodio - b.episodio);
const sal = (n) => { const c = ms.slice(0, n); return JSON.stringify({ save_version: 2, game_version: GAME_VERSION, seme: 1, caso: 1, variabili: v0, missioni_concluse: c.map((m) => m.id), episodi: Object.fromEntries(c.map((m) => [m.id, { migliore: { esito: m.esiti[0].id, fallita: false, stelle: 1 }, tentativi: 1, variabili_prima: v0, variabili_dopo: v0 }])), genere: 'm', rapporto_aperto: null, in_corso: null }); };
const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const out = [];
try {
  for (const [w, h] of [[360, 760], [375, 760], [412, 760], [360, 640], [375, 667]]) for (const n of [0, 6, 12, 24, 36]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, reducedMotion: 'reduce' }), p = await ctx.newPage();
    await p.goto(url); if (n) await p.evaluate(([k, x]) => localStorage.setItem(k, x), ['valmora-salvataggio', sal(n)]); await p.reload();
    await p.waitForSelector('.scena[data-scena="titolo"]'); await p.waitForTimeout(400);
    const r = async (nome) => { const x = await p.evaluate(() => ({ sh: document.documentElement.scrollHeight, ih: innerHeight, sw: document.documentElement.scrollWidth })); out.push(`${w}×${h} salvataggio=${n} ${nome}: scorre ${x.sh - x.ih}px, orizz ${x.sw - w}`); return x; };
    await r('home'); if (n === 6 || n === 0) await p.screenshot({ path: join(cartella, `home-s${n}-${w}x${h}.jpg`), type: 'jpeg', quality: 55 });
    if (n) { await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('.scena[data-scena="citta"]'); await p.waitForTimeout(500); await r('città'); if (n === 12) await p.screenshot({ path: join(cartella, `citta-s${n}-${w}x${h}.jpg`), type: 'jpeg', quality: 55 }); }
    await ctx.close();
  }
} finally { await b.close(); srv.close(); }
console.log(out.join('\n'));
