// PO-140 (D-179): guardiano della home della proposta A. Con una partita salvata, alla larghezza del giro e alle altezze
// 760 (telefono di riferimento, PO-045) e 640 (sotto i 700 px la vignetta si abbassa):
// - vignetta della home, frase-obiettivo e i tre pulsanti principali (Riprendi, Nuova partita, La città e il gioco) si
//   vedono senza scorrere oltre SOGLIA_SCORRIMENTO;
// - a 640 la vignetta è più bassa che a 760 e non sotto il minimo;
// - il menu «Altro» è chiuso, si apre col tocco e con Invio, mostra crediti/esporta/importa/idee (sostieni nel browser),
//   Esc lo chiude e ridà il fuoco al tasto «Altro».
// Rosso VALMORA_ROSSI=C140H01: la home di prima (niente vignetta, frase, menu). Foto in cartella: home-<w>x<h>.png,
// home-altro-<w>.png. Da solo: node tools/foto-home.mjs (server di sviluppo, 360/375/412).
import { join } from 'node:path';
import { GAME_VERSION } from '../src/versione.ts';

// Misurato il 18/10 (PO-140): il fondo di «La città e il gioco» resta sopra il bordo della finestra di 106/117/96 px a
// 760 e di 43/62/62 px a 640 (360/375/412). Soglia: 0 px, nessuno scorrimento. Mai alzarla per far passare una modifica.
export const SOGLIA_SCORRIMENTO = 0;
const ALTEZZE = [760, 640];
const salvataggio = JSON.stringify({ save_version: 2, game_version: GAME_VERSION, seme: 1, caso: 1, variabili: {}, missioni_concluse: [], episodi: {}, genere: 'm', rapporto_aperto: null, in_corso: null });

/** Apre il menu «Altro» se c'è ed è chiuso (per i guardiani che toccano crediti, esporta, importa, idee). */
export async function apriAltro(pagina) {
  const t = pagina.locator('[data-azione="altro"]');
  if ((await t.count()) && (await t.getAttribute('aria-expanded')) !== 'true') await t.click();
}

export async function controllaHomeA(browser, url, cartella, atteso, rossi, larghezza) {
  const misure = [];
  for (const h of ALTEZZE) {
    const dove = `home ${larghezza}×${h} (PO-140)`;
    const p = await browser.newPage({ viewport: { width: larghezza, height: h }, reducedMotion: 'reduce' });
    if (rossi.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, rossi);
    await p.goto(url); await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), salvataggio); await p.reload();
    await p.waitForSelector('main[data-schermata="titolo"]', { timeout: 15000 });
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    const m = await p.evaluate(() => {
      const r = (e) => e?.getBoundingClientRect();
      const bott = [...document.querySelectorAll('main .pulsante')];
      const tre = [bott.find((b) => /Riprendi/.test(b.textContent)), bott.find((b) => /Nuova partita/.test(b.textContent)), document.querySelector('[data-azione="guida"]')].map(r);
      const v = r(document.querySelector('[data-home-vignetta] [data-vignetta="home"]')), o = r(document.querySelector('[data-obiettivo]'));
      const cose = [v, o, ...tre];
      return { manca: cose.filter((x) => !x || !x.height).length, scorre: Math.round(Math.max(...cose.filter(Boolean).map((x) => x.bottom)) - innerHeight),
        vignetta: v ? Math.round(v.height) : 0, min: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--home-vignetta-min')) || 0 };
    });
    misure.push({ h, ...m });
    atteso(`${dove}: ${m.manca} fra vignetta, frase-obiettivo e i tre pulsanti mancano`, m.manca === 0);
    atteso(`${dove}: per vedere vignetta, frase e tre pulsanti si scorre di ${m.scorre} px (soglia ${SOGLIA_SCORRIMENTO})`, m.manca === 0 && m.scorre <= SOGLIA_SCORRIMENTO);
    atteso(`${dove}: vignetta alta ${m.vignetta} px, sotto il minimo ${m.min}`, m.vignetta >= m.min - 1);
    if (cartella) await p.screenshot({ path: join(cartella, `home-${larghezza}x${h}.png`) });
    if (h === ALTEZZE[0]) await controllaAltro(p, atteso, `${dove} menu «Altro»`, cartella && join(cartella, `home-altro-${larghezza}.png`));
    await p.close();
  }
  const [alta, bassa] = misure;
  atteso(`home ${larghezza}: vignetta ${bassa.vignetta} px a ${bassa.h} e ${alta.vignetta} px a ${alta.h}: sotto i 700 px non si abbassa (PO-140)`, bassa.vignetta > 0 && bassa.vignetta < alta.vignetta);
  return misure;
}

async function controllaAltro(p, atteso, dove, foto) {
  const tasto = p.locator('[data-azione="altro"]'), menu = p.locator('[data-altro]');
  if (!(await tasto.count())) { atteso(`${dove}: manca il tasto`, false); return; }
  const visibili = () => p.evaluate(() => ['crediti', 'esporta', 'importa', 'idee'].filter((a) => { const e = document.querySelector(`[data-azione="${a}"]`); return e && e.getBoundingClientRect().height > 0; }));
  atteso(`${dove}: aperto prima del tocco`, (await tasto.getAttribute('aria-expanded')) === 'false' && !(await menu.isVisible()));
  await tasto.click();
  const dentro = await visibili();
  atteso(`${dove}: col tocco si vedono solo ${dentro.join(', ') || 'nessuna'} di crediti, esporta, importa, idee`, dentro.length === 4 && (await tasto.getAttribute('aria-expanded')) === 'true');
  if (foto) { await menu.scrollIntoViewIfNeeded(); await p.screenshot({ path: foto, fullPage: true }); }
  await p.keyboard.press('Tab'); await p.keyboard.press('Escape');
  const chiuso = !(await menu.isVisible()), fuoco = await p.evaluate(() => document.activeElement?.getAttribute('data-azione'));
  atteso(`${dove}: Esc dal menu ${chiuso ? 'lo chiude' : 'non lo chiude'} e il fuoco va su «${fuoco}» invece di «altro»`, chiuso && fuoco === 'altro');
  await p.keyboard.press('Enter');
  atteso(`${dove}: con Invio sul tasto il menu non si apre`, await menu.isVisible());
}

/** Braccio rosso per la catena grafica: con C140H01 (la home di prima) il guardiano deve dare almeno un rosso a 360. */
export async function homeRossaVista(build = 'dist') {
  const { servi } = await import('./foto.mjs'); const { chromium } = await import('playwright-core'); const { existsSync } = await import('node:fs');
  const srv = await servi(build), percorso = process.env.VALMORA_CHROME ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const browser = await chromium.launch({ executablePath: percorso }); const male = [];
  try { await controllaHomeA(browser, `http://127.0.0.1:${srv.address().port}/`, '', (c, ok) => { if (!ok) male.push(c); }, ['C140H01'], 360); }
  finally { await browser.close(); srv.close(); }
  return male.length > 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { createServer } = await import('vite');
  const { chromium } = await import('playwright-core');
  const server = await createServer({ server: { port: 5198, strictPort: true }, logLevel: 'error' }); await server.listen();
  const browser = await chromium.launch(process.env.CHROME_PATH || !process.env.CI ? { executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium' } : {});
  const rossi = (process.env.VALMORA_ROSSI ?? '').split(',').filter(Boolean), male = [], cartella = process.env.CARTELLA ?? '';
  for (const w of [360, 375, 412]) {
    const mis = await controllaHomeA(browser, 'http://localhost:5198/', cartella, (cosa, ok) => { if (!ok) male.push(cosa); }, rossi, w);
    console.log(`${w}: ${mis.map((x) => `${x.h}: scorre ${x.scorre} px, vignetta ${x.vignetta} px`).join(' · ')}`);
  }
  await browser.close(); await server.close();
  console.log(male.length ? `ROSSO (${male.length}):\n${male.join('\n')}` : 'VERDE');
  process.exit(male.length ? 1 : 0);
}
