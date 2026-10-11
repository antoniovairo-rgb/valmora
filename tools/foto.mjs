// Gioca e01 nel browser a 360/375/412 px: foto di ogni schermata, errori di console,
// scorrimento orizzontale, salvataggio e ripresa (ricarica dopo l'ondata 1).
// Uso: node tools/foto.mjs [cartella-foto]   (predefinita: out/foto, ignorata da git)
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright-core';
import { leggiDati } from './dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { iniziaMissione, giocaOndata } from '../src/logica/plancia.ts';
import { attenta } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';

export const LARGHEZZE = [360, 375, 412];
const TIPI = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };

function servi(dir) {
  const srv = createServer((req, res) => {
    const p = join(dir, decodeURIComponent((req.url ?? '/').split('?')[0]) === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
    if (!existsSync(p)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': TIPI[extname(p)] ?? 'application/octet-stream' });
    res.end(readFileSync(p));
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

/** Disposizioni del giocatore attento per e01, calcolate dal motore (le stesse del bot). */
function disposizioniAttente() {
  const dati = leggiDati();
  const m = dati['missioni/e01.json'];
  const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
  let s = iniziaMissione(m, variabiliIniziali(dich.values()), dich);
  const out = [];
  for (let n = 1; n <= m.ondate.length; n++) { const d = attenta(m, n, s.variabili, creaCaso(n)); out.push(d); s = giocaOndata(m, s, d, dich); }
  return out;
}

export async function giraFoto(cartella = 'out/foto') {
  mkdirSync(cartella, { recursive: true });
  const srv = await servi('dist');
  const url = `http://127.0.0.1:${srv.address().port}/`;
  const percorso = process.env.VALMORA_CHROME ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const browser = await chromium.launch({ executablePath: percorso });
  const piani = disposizioniAttente();
  const giri = [];
  try {
    for (const larghezza of LARGHEZZE) {
      const g = { larghezza, errori: [], scorrimento: [], attesi: [] };
      const pagina = await browser.newPage({ viewport: { width: larghezza, height: 800 } });
      pagina.on('console', (m) => { if (m.type() === 'error') g.errori.push(m.text()); });
      pagina.on('pageerror', (e) => g.errori.push(e.message));
      let k = 0;
      const foto = async () => {
        const schermata = await pagina.getAttribute('main', 'data-schermata');
        const [contenuto, finestra] = await pagina.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
        if (contenuto > finestra) g.scorrimento.push({ schermata, contenuto, finestra });
        await pagina.screenshot({ path: join(cartella, `${larghezza}-${String(++k).padStart(2, '0')}-${schermata}.png`), fullPage: true });
      };
      const premi = async (testo) => { await pagina.getByRole('button', { name: testo }).click(); };
      await pagina.goto(url);
      await pagina.evaluate(() => localStorage.clear());
      await pagina.reload();
      await foto();
      await premi('Nuova partita'); await foto();
      await premi('Alla plancia');
      for (let n = 1; n <= piani.length; n++) {
        await pagina.click('[data-azione="azzera"]');
        for (const [r, perSettore] of Object.entries(piani[n - 1])) {
          for (const [s, q] of Object.entries(perSettore)) for (let i = 0; i < q; i++) await pagina.getByLabel(`aggiungi ${r} a ${s}`).click();
        }
        await foto();
        await pagina.click('[data-azione="avvia"]'); await foto();
        if (n === 1) { // salvataggio e ripresa: ricarico la pagina in mezzo alla missione
          await pagina.reload();
          const riprendi = await pagina.getByRole('button', { name: 'Riprendi' }).count();
          g.attesi.push({ cosa: 'dopo la ricarica manca «Riprendi»', ok: riprendi === 1 });
          if (riprendi) await premi('Riprendi');
          const titolo = await pagina.textContent('h1');
          g.attesi.push({ cosa: `la ripresa non porta all'ondata 2 (titolo «${titolo}»)`, ok: (await pagina.textContent('main')).includes('Ondata 2 di 3') });
          continue;
        }
        await pagina.click('[data-azione="avanti"]');
      }
      await foto();
      g.attesi.push({ cosa: 'il giocatore attento non arriva a «Contenuto»', ok: (await pagina.textContent('h1')) === 'Contenuto' });
      await pagina.close();
      giri.push(g);
    }
  } finally { await browser.close(); srv.close(); }
  return giri;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { controllaGiro } = await import('./controlli-grafica.mjs');
  const giri = await giraFoto(process.argv[2]);
  const p = giri.flatMap(controllaGiro);
  console.log(p.length ? p.join('\n') : `verde: ${giri.length} larghezze, foto in ${process.argv[2] ?? 'out/foto'}`);
}
