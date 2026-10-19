// D-187 (PO-052, PO-058): guardiano dello scorrimento verticale, dalla sonda di S-12 (coordination/sonde/s12-altezze.mjs,
// che sostituisce rev-schermate.mjs, ferma alla scelta del genere). Gioca e01 intera col piano del bot attento e misura
// a ogni scena quanto la pagina eccede lo schermo; poi confronta il massimo per schermata con SOGLIE (misurate dopo D-187).
// Crediti: possono scorrere. Chiamata: D-114 accetta lo scorrimento, la soglia è il massimo misurato (non deve crescere).
// Nel primo cambio di scena dopo una risposta si controlla anche che la versione non stia sopra le lettere delle opzioni
// (rosso C187V01).
// Rosso VALMORA_ROSSI=C187M01: la mappa non si abbassa e il guardiano diventa rosso.
// Da solo: VP=360x640,360x760 [FOTO=cartella] node tools/sonda-altezze.mjs [build]
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
import { servi } from './foto.mjs';
import { leggiDati } from './dati-disco.mjs';
import * as M from '../src/logica/missione.ts';
import { attenta } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';

// Massimo scorrimento per schermata (px), misurato il 19/10 dopo D-191 e D-193 con questo pilota; le schermate non
// elencate: 0 (crediti liberi). Resta solo la chiamata, che D-114 lascia scorrere: la soglia è il massimo di prima.
// Mai alzarle per far passare una modifica.
export const SOGLIE = {
  '360x640': { chiamata: 664 },
  '360x760': { chiamata: 544 },
  '375x667': { chiamata: 618 },
  '412x830': { chiamata: 435 },
};
const LIBERE = new Set(['crediti']);
// Nomi dei settori sopra i segni dell'ultima risposta: misurati e stampati, non bloccano. Con la stessa build il massimo
// cambia fra due giri (183 e 350 px² a 360×760; 506 col rosso C187S01): una soglia sarebbe instabile.
export const VP_PER_LARGHEZZA = { 360: ['360x640', '360x760'], 375: ['375x667'], 412: ['412x830'] };

const piano = (m, v, dich) => { const g = attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich); ond.push({ d }); s = M.chiudiOndata(m, s, dich); }
  return ond; };
async function schiera(p, d) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); } }
const lento = (p) => p.waitForFunction(() => { const s = document.querySelectorAll('.scena'); return s.length === 1 && getComputedStyle(s[0]).opacity === '1'; }, null, { timeout: 8000 }).catch(() => {});
const misura = (p) => p.evaluate(() => { const s = document.scrollingElement, sc = document.querySelector('.scena');
  return { pagina: s.scrollHeight, ecc: s.scrollHeight - innerHeight, scena: sc?.dataset.scena ?? '?', mappa: Math.round(document.querySelector('.mappa')?.getBoundingClientRect().height ?? 0), testo: sc?.innerText.length ?? 0, titolo: (sc?.querySelector('h1,h2,h3,p')?.textContent ?? '').trim().slice(0, 40),
    // S-21: il pulsante «Home» della mappa abbassata non copre punti o nomi dei settori
    casa: (() => { const h = document.querySelector('.mappa > .tasto-home')?.getBoundingClientRect(); if (!h) return 0;
      return [...document.querySelectorAll('.mappa .settore-punto, .mappa .settore-nome')].filter((e) => { const r = e.getBoundingClientRect(); return Math.max(0, Math.min(h.right, r.right) - Math.max(h.left, r.left)) * Math.max(0, Math.min(h.bottom, r.bottom) - Math.max(h.top, r.top)) > 4; }).length; })(),
    // D-187 (S-12): nomi dei settori sopra i segni dell'ultima risposta (px², il caso peggiore)
    segni: Math.round(Math.max(0, ...[...document.querySelectorAll('.mappa .settore-nome')].flatMap((n) => { const a = n.getBoundingClientRect();
      return [...document.querySelectorAll('.mappa .settore .segno-effetto')].map((g) => { const b = g.getBoundingClientRect(); return Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)); }); }))) }; });
// durante il cambio di scena (D-187, rosso C187V01): la scena che esce, spostata a sinistra, passa sopra la versione e non
// sotto: al centro della versione, se una scena lo copre, in cima dev'esserci la scena (le sue lettere restano leggibili)
const versioneSopra = (p) => p.evaluate(() => { const ve = document.querySelector('[data-versione-angolo]'), v = ve?.getBoundingClientRect(); if (!v) return 0;
  const x = (v.left + v.right) / 2, y = (v.top + v.bottom) / 2;
  const coperta = [...document.querySelectorAll('.scena')].some((s) => { const r = s.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; });
  if (!coperta || document.querySelectorAll('.scena').length < 2 && getComputedStyle(document.querySelector('.scena')).transform === 'none') return 0;
  ve.style.pointerEvents = 'auto'; // la versione non riceve tocchi: per elementFromPoint serve per un attimo
  const sopra = !!document.elementFromPoint(x, y)?.closest('[data-versione-angolo]'); ve.style.removeProperty('pointer-events'); return sopra ? 1 : 0; });

export async function giraAltezze({ build = 'dist', dirDati = 'data', vps, rossi = [], cartella = '' }) {
  const dati = leggiDati(dirDati), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), e01 = dati['missioni/e01.json'];
  const srv = await servi(build), url = `http://127.0.0.1:${srv.address().port}/`;
  const percorso = process.env.VALMORA_CHROME ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const b = await chromium.launch({ executablePath: percorso }); const ris = [], errori = [], sopra = [];
  try {
    for (const vp of vps) {
      const [w, h] = vp.split('x').map(Number);
      const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, reducedMotion: 'reduce' });
      if (rossi.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, rossi);
      await p.addInitScript(() => { globalThis.__VALMORA_SECONDO_MS = 1; }); // come foto.mjs (PO-121): niente attese reali; senza, in CI «bloccato su chiamata» a 412
      p.on('pageerror', (e) => errori.push(`${vp}: ${e.message}`));
      const c = async (sel) => { if (await p.locator(sel).count()) { await p.locator(sel).first().click(); await p.waitForTimeout(120); await lento(p); return true; } return false; };
      const rileva = async (nome) => { const x = await misura(p); ris.push({ vp, nome, ...x }); if (cartella) await p.screenshot({ path: join(cartella, `${vp}-${nome}-${ris.filter((r) => r.vp === vp && r.nome === nome).length}.png`), fullPage: true }); };
      await p.goto(url); await p.evaluate(() => localStorage.clear()); await p.reload(); await lento(p); await p.waitForTimeout(400);
      await rileva('titolo');
      await p.getByRole('button', { name: 'Nuova partita' }).click(); await p.waitForTimeout(300); await lento(p);
      let pl = null, io = 0, fermi = 0, passi = 0, provata = false; const visti = new Set();
      while (passi++ < 300) {
        await lento(p); const m = await misura(p), q = m.scena, chiave = `${q}|${m.titolo}|${m.pagina}|${m.testo}`;
        if (!visti.has(chiave)) { visti.add(chiave); await rileva(q); }
        if (q === 'verbale') break;
        if (await c('[data-azione="conferma-passo"]') || await c('[data-azione="conferma-nuova"]') || await c('[data-genere="m"]') || await c('[data-azione="guida-salta"]')) continue;
        if (q === 'schieramento') { pl ??= piano(e01, JSON.parse(await p.evaluate(() => localStorage.getItem('valmora-salvataggio'))).variabili, dich); await schiera(p, pl[io++].d); await rileva('schierato'); await c('[data-azione="conferma"]'); await c('[data-azione="conferma-davvero"]'); continue; }
        if (await c('[data-azione="continua"]')) continue;
        const opz = p.locator('[data-opzione]:not(:disabled):not([aria-disabled="true"])');
        if (await opz.count()) {
          if (!provata) { // la prima risposta: opzioni in basso, dove sta la versione, e cambio di scena osservato
            provata = true; await p.evaluate(() => { const o = document.querySelector('.opzione'); if (o) scrollTo(0, o.getBoundingClientRect().top + scrollY - innerHeight + 70); }); await p.waitForTimeout(150);
            await opz.first().click(); let n = 0, vista = false; // fino alla fine del cambio di scena (dopo la finestra «Annulla»)
            for (let i = 0; i < 300; i++) { n = Math.max(n, await versioneSopra(p)); const k = await p.evaluate(() => document.querySelectorAll('.scena').length); if (k > 1) vista = true; else if (vista) break; await p.waitForTimeout(20); } if (n) sopra.push(`${vp}: nel cambio di scena la versione sta sopra la scena che esce e ne copre le lettere (D-187)`);
            await lento(p);
          } else await c('[data-opzione]:not(:disabled):not([aria-disabled="true"])');
          await p.locator('[data-azione="continua"]').first().waitFor({ timeout: 4000 }).catch(() => {}); continue;
        }
        let fatto = false; for (const a of ['passo', 'prossimo', 'avanti', 'inizia', 'rapporto', 'avvia-episodio']) if (await c(`[data-azione="${a}"]`)) { fatto = true; break; }
        if (!fatto) { await p.waitForTimeout(400); if (++fermi > 20) { errori.push(`${vp}: bloccato su ${q}`); break; } } else fermi = 0;
      }
      await p.close();
    }
  } finally { await b.close(); srv.close(); }
  return { ris, errori, sopra };
}

/** Problemi: scorrimento oltre la soglia per schermata, errori di pagina, blocchi, versione sopra le lettere. */
export function controllaAltezze({ ris, errori, sopra }) {
  const max = {};
  for (const r of ris) if (!LIBERE.has(r.nome)) { const k = `${r.vp}|${r.nome}`; if (!max[k] || r.ecc > max[k].ecc) max[k] = r; }
  const male = Object.values(max).filter((r) => r.ecc > (SOGLIE[r.vp]?.[r.nome] ?? 0))
    .map((r) => `${r.vp} ${r.nome}: la pagina scorre di ${r.ecc} px (soglia ${SOGLIE[r.vp]?.[r.nome] ?? 0}, mappa ${r.mappa} px; D-187)`);
  const casa = ris.filter((r) => r.casa).map((r) => `${r.vp} ${r.nome}: il pulsante «Home» copre ${r.casa} fra punti e nomi dei settori (S-21, mappa ${r.mappa} px)`);
  return [...male, ...casa, ...errori, ...sopra];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const vps = (process.env.VP ?? '360x640,360x760,375x667,412x830').split(','), rossi = (process.env.VALMORA_ROSSI ?? '').split(',').filter(Boolean);
  const g = await giraAltezze({ build: process.argv[2] ?? 'dist', vps, rossi, cartella: process.env.FOTO ?? '' });
  const max = {}; for (const r of g.ris) { const k = `${r.vp} ${r.nome}`; max[k] = Math.max(max[k] ?? -1, r.ecc); }
  for (const [k, v] of Object.entries(max)) console.log(`${k}: ${v}`);
  console.log(`nomi sopra i segni, massimo: ${Math.max(0, ...g.ris.map((r) => r.segni))} px²`);
  const male = controllaAltezze(g); console.log(male.length ? `ROSSO (${male.length}):\n${male.join('\n')}` : 'VERDE');
  process.exit(male.length ? 1 : 0);
}
