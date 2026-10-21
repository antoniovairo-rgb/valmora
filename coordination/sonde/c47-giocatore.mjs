// C-047: partita da giocatore in prima persona. Demone Chromium (dito, movimento ridotto) comandato a mano con curl:
//   node coordination/sonde/c47-giocatore.mjs <cartella-log> &      poi   c() { curl -s localhost:8147 -d "$1"; }
// Comandi: nuovo <ep|-> <larg> [alt]   (ep = episodio di cui si parte, con i precedenti conclusi dal bot attento come in C-044; «-» = partita nuova)
//          (nuovo: 4° argomento facoltativo = variabili forzate, es. carte=perse,fascicolo=nessuno)
//          vai | schiera r:settore,r:settore | scegli <opzione> | foto <nome> | ricarica | tocca <selettore> | testo | misura
// Ogni scena e ogni misura finiscono in <cartella-log>/partita.jsonl. Tocchi sull'interfaccia; nessuna scelta viene da un bot.
import { existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { servi } from '../../tools/foto.mjs';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { attenta } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { iniziaMissione, schiera, chiamateAperte, rispondi, chiudiOndata, missioneFinita, concludiMissione } from '../../src/logica/missione.ts';
import { valutaEpisodio } from '../../src/logica/episodi.ts';
import { GAME_VERSION } from '../../src/versione.ts';

const cart = process.argv[2]; mkdirSync(cart, { recursive: true });
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x).sort((a, b) => a.episodio - b.episodio);
function salvataggioFino(id) {
  let v = v0; const episodi = {}, concluse = [];
  for (const m of missioni) {
    if (m.id === id) break;
    const g = attenta(creaCaso(1), dich); let s = iniziaMissione(m, v, dich);
    while (!missioneFinita(m, s)) { s = schiera(m, s, g.schiera(m, s)); for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = chiudiOndata(m, s, dich); }
    const f = concludiMissione(m, s, dich);
    episodi[m.id] = { migliore: { esito: f.esito.id, fallita: !!f.esito.fallita, stelle: valutaEpisodio(m, f).stelle }, tentativi: 1, variabili_prima: v, variabili_dopo: f.variabili };
    concluse.push(m.id); v = f.variabili;
  }
  return { save_version: 2, game_version: GAME_VERSION, seme: 1, caso: 1, variabili: v, missioni_concluse: concluse, episodi, genere: 'm', rapporto_aperto: null, in_corso: null };
}
const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const browser = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
let ctx, p, larg = 360, alt = 760, n = 0, ep = '';
const errori = [];
const log = (o) => appendFileSync(join(cart, 'partita.jsonl'), JSON.stringify(o) + '\n');
const vede = async (x) => (await p.locator(x).count()) > 0 && p.locator(x).first().isVisible();
const scena = () => p.getAttribute('.scena', 'data-scena').catch(() => null);
const misura = () => p.evaluate(() => ({ scena: document.querySelector('.scena')?.dataset.scena, w: innerWidth, ih: innerHeight, sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, scroll_y: document.documentElement.scrollHeight - innerHeight, testo: (document.querySelector('.scena')?.innerText ?? '').replace(/\n+/g, ' | ') }));
async function stato(etichetta) { const m = await misura(); log({ ep, etichetta, ...m }); return m; }
async function foto(nome) { await p.screenshot({ path: join(cart, `foto-${ep}-${larg}x${alt}-${String(++n).padStart(3, '0')}-${nome}.jpg`), type: 'jpeg', quality: 55 }); }
async function avanza() { // da una scena non decisionale alla prossima decisione; restituisce testo
  for (let i = 0; i < 60; i++) {
    await p.waitForTimeout(120);
    const sc = await scena();
    if (await vede('[data-azione="continua"]')) { await p.click('[data-azione="continua"]'); continue; }
    if (await vede('[data-riepilogo]') && await vede('[data-azione="conferma-davvero"]')) { await stato('riepilogo-schieramento'); return 'riepilogo'; }
    if (sc === 'sala' || sc === 'briefing') {
      await stato(sc); await foto(sc);
      for (const a of ['inizia', 'prossimo', 'avanti', 'passo']) if (await vede(`.scena [data-azione="${a}"]`)) { await p.click(`.scena [data-azione="${a}"]`); break; }
      continue;
    }
    if (await vede('[data-messaggio^="chiamata-"]') && await p.locator('.opzione').count()) {
      const d = await p.evaluate(() => ({ imp: !!document.querySelector('[data-imprevisto], .imprevisto'), timer: !!document.querySelector('[role="timer"]'), opz: [...document.querySelectorAll('.opzione')].map((e) => `${e.dataset.opzione}: ${e.innerText.replace(/\s+/g, ' ')}`) }));
      const m = await stato(d.imp ? 'chiamata-IMPREVISTO' : 'chiamata'); log({ ep, opzioni: d.opz, imprevisto: d.imp, timer: d.timer });
      if (d.imp) await foto('imprevisto');
      return `CHIAMATA${d.imp ? ' [IMPREVISTO]' : ''} (scorre ${m.scroll_y}px)\n${m.testo}\nOPZIONI:\n${d.opz.join('\n')}`;
    }
    if (sc === 'schieramento') { const m = await stato('schieramento'); const ris = await p.evaluate(() => [...document.querySelectorAll('[data-risorsa]')].map((e) => `${e.dataset.risorsa}[${e.innerText.replace(/\s+/g, ' ')}]${e.disabled ? '(spenta)' : ''}`)); const set = await p.evaluate(() => [...document.querySelectorAll('[data-settore]')].map((e) => e.dataset.settore)); return `SCHIERAMENTO (scorre ${m.scroll_y}px)\n${m.testo}\nRISORSE: ${ris.join(' ; ')}\nSETTORI: ${set.join(', ')}`; }
    if (await vede('[data-azione="rapporto"]')) { await stato('chiusura'); await p.click('[data-azione="rapporto"]'); continue; }
    if (sc === 'rapporto') { const m = await stato('rapporto'); await foto('rapporto'); const t = `RAPPORTO (scorre ${m.scroll_y}px, mappa ${await p.evaluate(() => { const x = document.querySelector('.mappa'); return x ? (x.dataset.nascosta !== undefined ? 'nascosta' : 'visibile') : 'assente'; })})\n${m.testo}\n`; await p.locator('.scena [data-azione="avanti"], .scena button:has-text("Prossima ondata"), .scena button:has-text("Leggi il verbale")').first().click({ timeout: 3000 }); return t + '\n' + await avanza(); }
    if (sc === 'verbale') { const m = await stato('verbale'); await foto('verbale'); const b = p.locator('.scena [data-azione="passo"], .scena [data-azione="avanti"], .scena [data-azione="prossimo"]').first(); if (await vede('[data-azione="epilogo"]') || !(await b.count())) return `VERBALE FINE (scorre ${m.scroll_y}px)\n${m.testo}`; await p.click('.scena [data-azione="passo"], .scena [data-azione="avanti"], .scena [data-azione="prossimo"]'); return `VERBALE (scorre ${m.scroll_y}px)\n${m.testo}`; }
    if (sc === 'epilogo') { const m = await stato('epilogo'); await foto('epilogo'); return `EPILOGO (scorre ${m.scroll_y}px)\n${m.testo}`; }
    if (sc === 'citta') { const m = await stato('citta'); await foto('citta'); return `CITTA (scorre ${m.scroll_y}px)\n${m.testo}`; }
  }
  const m = await stato('bloccato?'); await foto('bloccato'); return `NESSUNA DECISIONE TROVATA (scena ${m.scena})\n${m.testo}`;
}
async function comando(riga) {
  const [c, ...a] = riga.trim().split(/\s+/);
  if (c === 'nuovo') {
    ep = a[0]; larg = Number(a[1]); alt = Number(a[2] ?? 760);
    if (ctx) await ctx.close();
    ctx = await browser.newContext({ viewport: { width: larg, height: alt }, hasTouch: true, reducedMotion: 'reduce' }); p = await ctx.newPage(); p.setDefaultTimeout(8000);
    p.on('console', (x) => { if (x.type() === 'error') { errori.push(x.text()); log({ ERRORE_CONSOLE: x.text() }); } }); p.on('pageerror', (e) => { errori.push(e.message); log({ ERRORE_PAGINA: e.message }); });
    await p.addInitScript(() => { globalThis.__VALMORA_SECONDO_MS = 1; });
    await p.goto(url);
    if (ep !== '-') { const sv = salvataggioFino(ep); for (const kv of (a[3] ?? '').split(',').filter(Boolean)) { const [k, x] = kv.split('='); sv.variabili = { ...sv.variabili, [k]: x }; } log({ ep, salvataggio_variabili_forzate: a[3] ?? null, variabili: sv.variabili }); await p.evaluate(([k, x]) => localStorage.setItem(k, x), ['valmora-salvataggio', JSON.stringify(sv)]); await p.reload(); }
    await p.waitForTimeout(400); return (await stato('home')).testo + (await vede('text=Riprendi') ? '' : '');
  }
  if (c === 'tocca') { await p.click(a.join(' ')); await p.waitForTimeout(150); return (await stato('tocca')).testo; }
  if (c === 'riprendi') { await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(300); return (await stato('riprendi')).testo; }
  if (c === 'episodio') { // episodio <id> [stagione]: dalla città alla scheda, avvia
    const sId = a[1]; if (sId) { const st = p.locator(`[data-stagione="${sId}"]`); if (await st.count()) await st.click(); }
    await p.locator(`[data-episodio="${a[0]}"] .settore-punto`).click(); const m = await stato('scheda-episodio'); await foto('scheda'); return m.testo; }
  if (c === 'avvia') { await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200); if (await p.locator('.tripla').count()) await p.click('[data-azione="conferma-rigioca"]'); return avanza(); }
  if (c === 'vai') return avanza();
  if (c === 'testo' || c === 'misura') { const m = await stato('misura'); return JSON.stringify({ ...m, testo: undefined }) + '\n' + m.testo; }
  if (c === 'foto') { await foto(a[0] ?? 'x'); return 'foto ok'; }
  if (c === 'ricarica') { await p.reload(); await p.waitForTimeout(400); const t = (await stato('ricaricata')).testo; if (await vede('text=Riprendi')) { await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(300); return 'RICARICATA + Riprendi → ' + (await stato('ripreso')).testo; } return 'RICARICATA → ' + t; }
  if (c === 'schiera') { // schiera ambulanza:tornelli,steward:curva ...
    for (const x of a.join('').split(',').filter(Boolean)) { const [r, sett] = x.split(':'); if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]:not([disabled])`); await p.click(`[data-settore="${sett}"] .settore-punto`); }
    await p.click('[data-azione="conferma"]'); await p.waitForSelector('[data-riepilogo]'); const r = await stato('riepilogo'); await foto('conferma'); return 'RIEPILOGO (scorre ' + r.scroll_y + 'px)\n' + r.testo; }
  if (c === 'conferma') { await p.click('[data-azione="conferma-davvero"]'); return avanza(); }
  if (c === 'scegli') {
    await p.click(`[data-opzione="${a[0]}"]`);
    await p.waitForFunction(() => !document.querySelector('[data-annulla]'), null, { timeout: 8000 }).catch(() => {});
    await p.waitForSelector('[data-azione="continua"]', { timeout: 3000 }).catch(() => {});
    const m = await stato('risposta'); const t = `RISPOSTA (scorre ${m.scroll_y}px)\n${m.testo}\n`; if (m.scroll_y > 0 || process.env.FOTO_TUTTE) await foto('risposta');
    if (await vede('[data-azione="continua"]')) await p.click('[data-azione="continua"]');
    return t + '\n' + await avanza(); }
  if (c === 'esci') { setTimeout(() => process.exit(0), 100); return 'bye'; }
  return 'comando ignoto';
}
let coda = Promise.resolve();
createServer((rq, rs) => { let b = ''; rq.on('data', (d) => (b += d)); rq.on('end', () => { coda = coda.then(() => comando(b)).then((t) => rs.end(t + '\n'), (e) => rs.end('ERRORE: ' + e.message.split('\n')[0] + '\n')); }); }).listen(8147);
