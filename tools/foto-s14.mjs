// S-14 (PO-022): foto del prototipo «tempo reale» su e02, ondata 1 (stato del bot attento), a 360, 375 e 412 px.
// prima = gioco di sempre; a, b, c = modi del prototipo (globalThis.__VALMORA_TEMPO_REALE); pausa; scadenza.
// Uso: node tools/foto-s14.mjs [cartella]   (serve dist/ già costruito)
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { servi } from './foto.mjs';
import { leggiDati } from './dati-disco.mjs';
import { salvataggioTutti } from './foto-bozze.mjs';
import { partenzeAttente } from './foto-schieramenti.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { schiera } from '../src/logica/missione.ts';

const cartella = process.argv[2] ?? 'coordination/handoffs/sviluppatrice/s14';
mkdirSync(cartella, { recursive: true });
const CHIAVE = 'valmora-salvataggio';
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x);
const st = partenzeAttente('data').find((x) => x.m.id === 'e02' && x.n === 1);
const salvataggio = JSON.stringify({ ...salvataggioTutti(missioni, v0), in_corso: schiera(st.m, st.s, st.d) });
// c: lo stesso schieramento senza nessuno nel viale della stazione (evento in ondata 1), per vedere il settore che peggiora
const scoperto = Object.fromEntries(Object.entries(st.d).map(([r, ps]) => [r, { ...ps, viale_stazione: 0 }]));
const salvataggioC = JSON.stringify({ ...salvataggioTutti(missioni, v0), in_corso: schiera(st.m, st.s, scoperto) });
const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const browser = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const esiti = [];
const leggi = (p) => p.evaluate((k) => ({ chiamata: document.querySelector('[data-messaggio^="chiamata-"]')?.dataset.messaggio ?? null,
  resta: document.querySelector('[data-resta]')?.dataset.resta ?? null, orologio: document.querySelector('[data-orologio]')?.dataset.orologio ?? null,
  corrono: document.querySelector('[data-corrono]')?.dataset.corrono ?? null, scelte: JSON.parse(localStorage.getItem(k) ?? '{}').in_corso?.scelte ?? [],
  modifiche: JSON.parse(localStorage.getItem(k) ?? '{}').in_corso?.modifiche ?? {},
  tocco: Math.min(...[...document.querySelectorAll('.tempo-pausa, .tempo-ritmo')].map((b) => Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height))),
  orizzontale: document.documentElement.scrollWidth > innerWidth }), CHIAVE);
try {
  for (const w of [360, 375, 412]) for (const modo of [null, 'a', 'b', 'c']) {
    const p = await browser.newPage({ viewport: { width: w, height: 760 }, reducedMotion: 'reduce' });
    await p.addInitScript(([x, ms]) => { if (x) globalThis.__VALMORA_TEMPO_REALE = x; globalThis.__VALMORA_SECONDO_MS = ms; }, [modo, modo === 'c' ? 100 : 1000]);
    await p.goto(url); await p.evaluate(([k, v]) => localStorage.setItem(k, v), [CHIAVE, modo === 'c' ? salvataggioC : salvataggio]); await p.reload();
    await p.getByRole('button', { name: 'Riprendi' }).click();
    await p.waitForSelector('[data-opzione]', { timeout: 15000 }); await p.waitForTimeout(modo === 'c' ? 2600 : 2200);
    const nome = modo ?? 'prima';
    await p.screenshot({ path: join(cartella, `${nome}-${w}.png`) });
    const x = await leggi(p); esiti.push({ w, modo: nome, ...x, scelte: x.scelte.length });
    if (modo && w === 360) {
      await p.click('[data-azione="pausa"]'); await p.waitForTimeout(300);
      const fermo = await leggi(p); await p.screenshot({ path: join(cartella, `${modo}-pausa-${w}.png`) });
      await p.waitForTimeout(modo === 'c' ? 2000 : 3000); const dopo = await leggi(p);
      esiti.push({ w, modo: `${modo} in pausa`, fermo: fermo.resta === dopo.resta && fermo.orologio === dopo.orologio, prima: fermo.resta ?? fermo.orologio, dopo: dopo.resta ?? dopo.orologio });
      await p.click('[data-azione="riprendi-tempo"]');
      if (modo !== 'c') {
        // scadenza: si lascia correre il tempo fino in fondo
        await p.evaluate(() => { globalThis.__VALMORA_SECONDO_MS = 50; });
        await p.waitForFunction((c) => document.querySelector('[data-messaggio^="chiamata-"]')?.dataset.messaggio !== c, x.chiamata, { timeout: 40000 }).catch(() => {});
        await p.waitForTimeout(400); const s = await leggi(p);
        await p.screenshot({ path: join(cartella, `${modo}-dopo-scadenza-${w}.png`) });
        esiti.push({ w, modo: `${modo} scaduta`, da: x.chiamata, a: s.chiamata, ultimaScelta: s.scelte.at(-1) ?? null });
      } else {
        await p.waitForTimeout(4500); const s = await leggi(p);
        await p.screenshot({ path: join(cartella, `c-dopo-minuti-${w}.png`) });
        esiti.push({ w, modo: 'c minuti', orologio: s.orologio, modifiche: s.modifiche, corrono: s.corrono });
      }
    }
    await p.close();
  }
} finally { await browser.close(); srv.close(); }
for (const e of esiti) console.log(JSON.stringify(e));
