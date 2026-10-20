// S-18 C45-03 (D-205): foto e scorrimento del verbale con la dicitura del confronto, a 360/375/412×760, verde e rosso
// (__NO_C4503). Partita: e02 dopo e01 concluso dal bot attento; schieramento attento (seme 1), sempre la prima risposta
// valida. Il bilancio atteso si calcola prima in Node con la stessa partita. Uso: npx vite build && node coordination/sonde/s18-c45-foto.mjs <cartella>
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { servi } from '../../tools/foto.mjs';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { attenta } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { iniziaMissione, schiera, chiamateAperte, rispondi, chiudiOndata, missioneFinita, concludiMissione, opzioniValide } from '../../src/logica/missione.ts';
import { valutaEpisodio } from '../../src/logica/episodi.ts';
import { bilancio } from '../../src/logica/bilancio.ts';
import { daTabella } from '../../src/logica/confronto.ts';
import { GAME_VERSION } from '../../src/versione.ts';

const cart = process.argv[2] ?? 'coordination/handoffs/sviluppatrice/S-18-foto'; mkdirSync(cart, { recursive: true });
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
const e01 = dati['missioni/e01.json'], e02 = dati['missioni/e02.json'];
const gioca = (m, v, prima) => { const g = attenta(creaCaso(1), dich); let s = iniziaMissione(m, v, dich); const piano = [];
  while (!missioneFinita(m, s)) { const d = g.schiera(m, s); piano.push(d); s = schiera(m, s, d);
    for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, prima ? opzioniValide(c, s, m)[0].id : g.scegli(m, s, c), dich); s = chiudiOndata(m, s, dich); }
  return { piano, fine: concludiMissione(m, s, dich) }; };
const a = gioca(e01, v0, false);
const sv = { save_version: 2, game_version: GAME_VERSION, seme: 1, caso: 1, variabili: a.fine.variabili, missioni_concluse: ['e01'], genere: 'm', rapporto_aperto: null, in_corso: null,
  episodi: { e01: { migliore: { esito: a.fine.esito.id, fallita: !!a.fine.esito.fallita, stelle: valutaEpisodio(e01, a.fine).stelle }, tentativi: 1, variabili_prima: v0, variabili_dopo: a.fine.variabili } } };
const b = gioca(e02, a.fine.variabili, true);
const tab = JSON.parse(readFileSync('src/logica/confronti.json', 'utf8'));
const atteso = bilancio(e02, b.fine, 3, daTabella(tab, 'e02'));
const voci = (l) => l.map((v) => `${v.chiamata}:${v.opzione}${v.controcorrente ? ' (dicitura)' : ''}`);
const out = { atteso: { esito: b.fine.esito.id, aiuti: voci(atteso.aiuti), pesi: voci(atteso.pesi) }, misure: [] };

const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const br = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const lento = (p) => p.waitForFunction(() => { const s = document.querySelectorAll('.scena'); return s.length === 1 && getComputedStyle(s[0]).opacity === '1'; }, null, { timeout: 8000 }).catch(() => {});
try {
  for (const rosso of [false, true]) for (const w of [360, 375, 412]) {
    const ctx = await br.newContext({ viewport: { width: w, height: 760 }, hasTouch: true, reducedMotion: 'reduce' }), p = await ctx.newPage(); p.setDefaultTimeout(8000);
    const errori = []; p.on('pageerror', (e) => errori.push(e.message)); p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text()); });
    await p.addInitScript((r) => { globalThis.__VALMORA_SECONDO_MS = 1; if (r) globalThis.__NO_C4503 = true; }, rosso);
    await p.goto(url); await p.evaluate((x) => localStorage.setItem('valmora-salvataggio', x), JSON.stringify(sv)); await p.reload(); await lento(p);
    await p.getByRole('button', { name: 'Riprendi' }).click(); await lento(p);
    await p.locator('[data-episodio="e02"] .settore-punto').click(); await p.waitForTimeout(200);
    await p.click('[data-azione="avvia-episodio"]'); await lento(p);
    let io = 0, passi = 0, fermi = 0;
    const c = async (sel) => { if (await p.locator(sel).count()) { await p.locator(sel).first().click(); await p.waitForTimeout(120); await lento(p); return true; } return false; };
    while (passi++ < 400) {
      await lento(p); const q = await p.evaluate(() => document.querySelector('.scena')?.dataset.scena ?? '?');
      if (q === 'verbale') break;
      if (await c('[data-azione="conferma-passo"]') || await c('[data-azione="guida-salta"]')) continue;
      if (q === 'schieramento') { const d = b.piano[io++];
        for (const [r, ps] of Object.entries(d)) for (const [s, n] of Object.entries(ps)) for (let k = 0; k < n; k++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); }
        await c('[data-azione="conferma"]'); await c('[data-azione="conferma-davvero"]'); continue; }
      if (await c('[data-azione="continua"]')) continue;
      if (await p.locator('[data-opzione]:not(:disabled):not([aria-disabled="true"])').count()) { await c('[data-opzione]:not(:disabled):not([aria-disabled="true"])');
        await p.waitForFunction(() => !document.querySelector('[data-annulla]'), null, { timeout: 8000 }).catch(() => {}); continue; }
      let fatto = false; for (const x of ['passo', 'avanti', 'inizia', 'rapporto']) if (await c(`[data-azione="${x}"]`)) { fatto = true; break; }
      if (!fatto) { await p.waitForTimeout(300); if (++fermi > 20) { errori.push(`bloccato su ${q}`); break; } } else fermi = 0;
    }
    // verbale: ogni passo, foto e scorrimento
    for (let k = 0; k < 8; k++) {
      await p.evaluate(() => new Promise((ok) => { scrollTo(0, 0); requestAnimationFrame(() => requestAnimationFrame(ok)); }));
      const m = await p.evaluate(() => { const v = document.querySelector('.passo:not([hidden])'); const sez = v?.querySelector('[data-sezione]')?.dataset.sezione ?? 'altro';
        return { sezione: sez, scorre: document.scrollingElement.scrollHeight - innerHeight,
          voci: [...(v?.querySelectorAll('[data-scelta]') ?? [])].map((x) => x.dataset.scelta + ' · ' + x.querySelector('small')?.textContent) }; });
      const nome = `${rosso ? 'rosso' : 'verde'}-${w}x760-${k}-${m.sezione}`;
      if (m.sezione === 'aiuti' || m.sezione === 'pesi') await p.screenshot({ path: join(cart, `${nome}.png`), fullPage: true });
      out.misure.push({ rosso, vp: `${w}x760`, passo: k, ...m });
      if (!(await p.locator('.passo:not([hidden]) ~ * [data-azione="passo"], [data-azione="passo"]').count())) break;
      await p.click('[data-azione="passo"]'); await p.waitForTimeout(150);
    }
    out.misure.push({ rosso, vp: `${w}x760`, errori });
    await ctx.close();
  }
} finally { await br.close(); srv.close(); }
writeFileSync(join(cart, 'misure.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify(out.atteso));
for (const x of out.misure) console.log(JSON.stringify(x));
