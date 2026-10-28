// C-053 (collaudatrice, sola lettura): pilota di Playwright per giocare un episodio dalla resa vera della 0.54.0.
// Uso da altre sonde c053-*.mjs. Si lancia dalla radice del repository (importa i .ts col type-stripping di node).
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';
import { servi } from '../../tools/foto.mjs';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { giocaMissione } from '../../src/logica/missione.ts';
import * as M from '../../src/logica/missione.ts';
import { attenta, peggiore, casuale } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';

export const CHIAVE = 'valmora-salvataggio';
export const dati = leggiDati('data');
export const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
export const v0 = variabiliIniziali(dich.values());
export const missioni = Object.entries(dati).filter(([k]) => /^missioni\/e\d+\.json$/.test(k)).map(([, m]) => m).sort((a, b) => a.episodio - b.episodio);
export const testi = Object.assign({}, ...Object.entries(dati).filter(([k]) => k.startsWith('testi/it/')).map(([, v]) => v));
export const tx = (k) => testi[String(k ?? '').replace(/^testi:/, '')] ?? `[[${k}]]`;

/** Salvataggio v3 con gli episodi prima di `id` superati giocando davvero col motore (seme 0, giocatore attento), così le variabili di storia sono vere. */
export function salvataggioPrima(id, { genere = 'm', seme = 7 } = {}) {
  let vars = v0; const episodi = {}, concluse = [];
  for (const m of missioni) {
    if (m.id === id) break;
    const e = giocaMissione(m, vars, dich, attenta(creaCaso(1), dich), 0);
    episodi[m.id] = { migliore: { esito: e.esito.id, fallita: !!e.esito.fallita, stelle: 3 }, tentativi: 1, variabili_prima: vars, variabili_dopo: e.variabili };
    concluse.push(m.id); vars = e.variabili;
  }
  return { save_version: Number(process.env.C053_SV ?? 3), game_version: process.env.C053_GV ?? '0.54.0', seme, caso: seme, variabili: vars, missioni_concluse: concluse, episodi, genere, rapporto_aperto: null, in_corso: null };
}

export async function avvia() {
  const srv = await servi('dist'); const url = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
  return { srv, url, browser, chiudi: async () => { await browser.close(); srv.close(); } };
}

export const stato = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), CHIAVE);
export const lento = (p) => p.waitForFunction(() => { const s = document.querySelectorAll('.scena'); return s.length === 1 && getComputedStyle(s[0]).opacity === '1'; }, null, { timeout: 8000 }).catch(() => {});
export const scenaDi = (p) => p.evaluate(() => document.querySelector('.scena')?.dataset.scena ?? '?');
export async function tocca(p, sel) { const l = p.locator(sel); if (await l.count()) { await l.first().click(); await p.waitForTimeout(60); await lento(p); return true; } return false; }

export async function nuovaPagina(b, url, w, h, salvataggio, extra = {}) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, reducedMotion: 'reduce' });
  await p.addInitScript(() => { globalThis.__VALMORA_SECONDO_MS = 1; });
  p.errori = []; p.on('pageerror', (e) => p.errori.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') p.errori.push(m.text()); });
  await p.goto(url);
  if (salvataggio) { await p.evaluate(([k, v]) => localStorage.setItem(k, v), [CHIAVE, JSON.stringify(salvataggio)]); await p.reload(); }
  await lento(p);
  return p;
}

/** Dalla città all'inizio dell'episodio: stagione, punto, «Avvia», passi di sala/briefing fino alla prima scena di gioco. */
export async function apriEpisodio(p, m) {
  await p.getByRole('button', { name: 'Riprendi' }).click(); await lento(p);
  await tocca(p, `[data-stagione="${m.stagione}"]`);
  await p.locator(`[data-episodio="${m.id}"] .settore-punto`).click(); await p.waitForTimeout(80);
  await p.click('[data-azione="avvia-episodio"]'); await lento(p);
  if (await p.locator('.tripla').count()) { await p.click('[data-azione="conferma-rigioca"]').catch(() => {}); await lento(p); }
}

/**
 * Gioca fino a `fino` ('verbale' | 'chiamata:<n>' ecc. non usati): ritorna il racconto di ciò che il giocatore vede.
 * strategia: 'attenta' | 'peggiore' | 'casuale'. Registra per ogni chiamata id (data-messaggio), testo letto, opzioni, risposta, ondata.
 */
export async function giocaEpisodio(p, m, { strategia = 'attenta', rapporti = false, ferma = null, sulla = null } = {}) {
  const racconto = []; let passi = 0, fermi = 0, ondata = 0;
  const bot = (strategia === 'peggiore' ? peggiore : strategia === 'casuale' ? casuale : attenta)(creaCaso(`c053:${m.id}:${strategia}`), dich);
  while (passi++ < 600) {
    await lento(p); const q = await scenaDi(p);
    if (q === 'verbale' || q === 'epilogo') break;
    if (ferma && (await ferma(q, p, racconto))) break;
    if (await tocca(p, '[data-azione="conferma-passo"]') || await tocca(p, '[data-azione="conferma-nuova"]')) continue;
    if (q === 'schieramento') {
      const sv = await stato(p); ondata = sv.in_corso.ondata;
      const d = bot.schiera(m, sv.in_corso, dich);
      for (const [r, ps] of Object.entries(d)) for (const [s, n] of Object.entries(ps)) for (let x = 0; x < n; x++) {
        if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`);
        await p.click(`[data-settore="${s}"] .settore-punto`);
      }
      await tocca(p, '[data-azione="conferma"]'); await tocca(p, '[data-azione="conferma-davvero"]'); continue;
    }
    if (q === 'chiamata') {
      const sv = await stato(p), ic = sv.in_corso; const c = ic && M.chiamateAperte(m, ic)[0];
      const letto = await p.evaluate(() => ({ id: document.querySelector('[data-messaggio]')?.dataset.messaggio, testo: document.querySelector('.scena')?.innerText }));
      if (!c || (letto.id && !letto.id.endsWith(c.id))) { await p.waitForTimeout(250); if (++fermi > 40) { racconto.push({ errore: `scena chiamata e salvataggio non concordano: ${letto.id} / ${c?.id}` }); break; } continue; } // scena in uscita: il salvataggio è già avanti
      const opz = bot.scegli(m, ic, c);
      const opzioni = await p.evaluate(() => [...document.querySelectorAll('[data-opzione]')].map((o) => o.dataset.opzione));
      const rec = { ondata: ic.ondata, id: c.id, imprevisto: !!c.imprevisto, variante: c.variante_di ?? null, carta: c.carta ?? null, seme: ic.seme, posto: null, letto, opzioni, scelta: opz };
      if (!opzioni.includes(opz)) { racconto.push({ ...rec, errore: 'opzione del bot non offerta nella resa' }); break; }
      await p.click(`[data-opzione="${opz}"]`); await p.waitForTimeout(80);
      await p.click('[data-conferma]'); await lento(p);
      rec.risposta = await p.evaluate(() => document.querySelector('.scena')?.innerText);
      rec.scenaDopo = await scenaDi(p);
      racconto.push(rec); if (sulla) await sulla(rec, p);
      continue;
    }
    if (await tocca(p, '[data-azione="continua"]')) continue;
    let fatto = false;
    for (const a of ['passo', 'prossimo', 'avanti', 'inizia', 'rapporto', 'epilogo', 'avvia-episodio']) if (await tocca(p, `[data-azione="${a}"]`)) { fatto = true; break; }
    if (!fatto) { await p.waitForTimeout(300); if (++fermi > 20) { racconto.push({ errore: `bloccato su ${q}` }); break; } } else fermi = 0;
  }
  return racconto;
}
