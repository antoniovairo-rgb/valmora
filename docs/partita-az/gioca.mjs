// PO-126 (S-06): una campagna intera giocata nel browser vero, da «Nuova partita» al verbale di e36, un solo
// salvataggio. Le decisioni le prende il motore (src/logica/bot.ts, «attenta») sullo stato letto dal salvataggio
// della pagina; il giocatore sbaglia ogni tanto (seme fisso). Nessuna variabile scritta a mano: si legge e basta.
// Uso (dalla radice, dopo `npx vite build`): node docs/partita-az/gioca.mjs [seme]
// Esce: docs/partita-az/foto/*.jpg e docs/partita-az/partita.json (registro della partita).
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright-core';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { avanzaFino } from '../../tools/foto-club.mjs';
import { creaCaso } from '../../src/logica/caso.ts';
import { attenta, equilibrata } from '../../src/logica/bot.ts';
import { chiamateAperte, disponibili, opzioniValide, settoriAmmessi } from '../../src/logica/missione.ts';
import { GAME_VERSION } from '../../src/versione.ts';

const SEME = process.argv[2] ?? 'partita-az:1';
const P_SBAGLIO_RISPOSTA = 0.15, P_SBAGLIO_SCHIERA = 0.2; // «attento che sbaglia ogni tanto» (dichiarati nel rapporto)
const FOTO = 'docs/partita-az/foto';
rmSync(FOTO, { recursive: true, force: true }); mkdirSync(FOTO, { recursive: true });
const dati = leggiDati();
const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
const missioni = Object.fromEntries(Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => [m.id, m]));
const testi = Object.assign({}, ...Object.entries(dati).filter(([k]) => k.startsWith('testi/it/')).map(([, v]) => v));
const t = (k) => testi[String(k).replace(/^testi:/, '')] ?? k;
const caso = creaCaso(SEME);
const att = attenta(caso, dich), eq = equilibrata(caso, dich);

const TIPI = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
const srv = await new Promise((ok) => { const s = createServer((req, res) => {
  const u = decodeURIComponent((req.url ?? '/').split('?')[0]); const p = join('dist', u === '/' ? 'index.html' : u);
  if (!existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TIPI[extname(p)] ?? 'application/octet-stream' }); res.end(readFileSync(p));
}); s.listen(0, '127.0.0.1', () => ok(s)); });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const pagina = await browser.newPage({ viewport: { width: 360, height: 760 }, reducedMotion: 'reduce' });

const registro = { seme: SEME, game_version: GAME_VERSION, sbagli: { risposta: P_SBAGLIO_RISPOSTA, schieramento: P_SBAGLIO_SCHIERA }, episodi: [], errori: [], scorrimento: [], extra: [] };
let ep = null; let passo = 0;
const dove = async () => (await pagina.getAttribute('.scena', 'data-scena').catch(() => '?'));
pagina.on('console', async (m) => { if (m.type() === 'error' || (m.type() === 'warning' && !m.text().includes('GL Driver Message'))) registro.errori.push({ tipo: m.type(), testo: m.text().slice(0, 300), episodio: ep?.id ?? null, passo }); });
pagina.on('pageerror', (e) => registro.errori.push({ tipo: 'pageerror', testo: e.message.slice(0, 300), episodio: ep?.id ?? null, passo }));

const scena = async (nome, timeout = 8000) => {
  await pagina.waitForSelector(`.scena[data-scena="${nome}"]`, { timeout });
  await pagina.waitForFunction(() => document.querySelectorAll('.scena').length === 1 && getComputedStyle(document.querySelector('.scena')).opacity === '1'
    && [...document.querySelectorAll('[data-messaggio]')].every((x) => getComputedStyle(x).opacity === '1') && [...document.querySelectorAll('.mappa')].every((x) => x.dataset.pronta === 'si'), null, { timeout });
};
const stabile = (timeout = 8000) => pagina.waitForFunction(() => document.querySelectorAll('.scena').length === 1 && getComputedStyle(document.querySelector('.scena')).opacity === '1'
  && [...document.querySelectorAll('.mappa')].every((x) => x.dataset.pronta === 'si'), null, { timeout });
const foto = async (nome) => {
  await pagina.mouse.move(0, 0);
  const [c, f] = await pagina.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  if (c > f) registro.scorrimento.push({ episodio: ep?.id ?? null, scena: await dove(), contenuto: c, finestra: f });
  const file = `${nome}.jpg`;
  await pagina.screenshot({ path: join(FOTO, file), type: 'jpeg', quality: 50 });
  (ep?.foto ?? registro.extra).push(file); return file;
};
const premi = async (sel) => { await avanzaFino(pagina, sel, async () => { passo++; }); await pagina.click(sel); passo++; if (ep) ep.tocchi++; };
/** Tocco che cambia scena: aspetta che la scena di prima sia uscita. */
const vai = async (sel) => { const v = await pagina.$('.scena'); await premi(sel); if (v) await pagina.waitForFunction((e) => !e.isConnected, v, { timeout: 8000 }); };
const sal = () => pagina.evaluate(() => JSON.parse(localStorage.getItem('valmora-salvataggio') ?? 'null'));
const testo = (sel) => pagina.locator(sel).first().textContent({ timeout: 2000 }).then((x) => (x ?? '').replace(/\s+/g, ' ').trim(), () => '');
const parole = (s) => (s.match(/\S+/g) ?? []).length;
const leggi = (s) => { if (ep) ep.parole += parole(s); return s; };

/** Schieramento: attento; con probabilità P_SBAGLIO_SCHIERA un'unità finisce in un settore ammesso a caso. Dopo
 *  3 tentativi falliti dello stesso episodio il giocatore si concentra (niente sbagli). */
function decidiSchieramento(m, ic, concentrato) {
  const d = att.schiera(m, ic);
  if (!concentrato && caso.numero() < P_SBAGLIO_SCHIERA) {
    const unita = Object.entries(d).flatMap(([r, ps]) => Object.entries(ps).filter(([, n]) => n > 0).map(([s]) => [r, s]));
    if (unita.length) {
      const [r, s] = caso.scegli(unita); const altro = caso.scegli(settoriAmmessi(m, r));
      if (altro !== s) { d[r][s]--; d[r][altro] = (d[r][altro] ?? 0) + 1; ep.sbagli.push(`ondata ${ic.ondata}: ${t(`risorsa.${r}`)} in «${t(`settore.${altro}`)}» invece di «${t(`settore.${s}`)}»`); }
    }
  }
  return d;
}
function decidiRisposta(m, ic, c, concentrato) {
  const v = opzioniValide(c, ic, m);
  const buona = (concentrato >= 2 ? eq : att).scegli(m, ic, c);
  if (!concentrato && caso.numero() < P_SBAGLIO_RISPOSTA) { const x = caso.scegli(v).id; if (x !== buona) { ep.sbagli.push(`chiamata ${c.id}: «${x}» invece di «${buona}»`); return x; } }
  return buona;
}

async function schieramento(m, ic, concentrato, primaOndata) {
  const d = decidiSchieramento(m, ic, concentrato);
  const unita = Object.entries(d).flatMap(([r, ps]) => Object.entries(ps).flatMap(([s, q]) => Array(q).fill([r, s])));
  for (const [r, s] of unita) {
    if ((await pagina.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await premi(`[data-risorsa="${r}"]`);
    await premi(`[data-settore="${s}"] .settore-punto`);
  }
  if (primaOndata) await foto(`${m.id}-${ep.tentativi}-schieramento`);
  await premi('[data-azione="conferma"]');
  await premi('[data-azione="conferma-davvero"]');
  return Object.fromEntries(Object.entries(d).map(([r, ps]) => [r, Object.fromEntries(Object.entries(ps).filter(([, n]) => n > 0))]));
}

async function giocaEpisodio(m) {
  ep = registro.episodi.find((x) => x.id === m.id);
  if (!ep) { ep = { id: m.id, stagione: m.stagione, episodio: m.episodio, titolo: t(m.titolo), tentativi: 0, prove: [], foto: [], tocchi: 0, parole: 0, sbagli: [] }; registro.episodi.push(ep); }
  const s0 = await sal(); ep.variabili_prima ??= s0.variabili;
  await scena('sala'); ep.sala ??= leggi(await testo('.scena')); if (!ep.tentativi) await foto(`${m.id}-introduzione`);
  await vai('[data-azione="avanti"]'); await scena('briefing');
  while (await pagina.locator('[data-azione="prossimo"]').count()) await premi('[data-azione="prossimo"]');
  ep.briefing ??= leggi(await testo('.scena')); if (!ep.tentativi) await foto(`${m.id}-briefing`);
  await vai('[data-azione="inizia"]');
  return giocaDaQui(m, null);
}

async function giocaDaQui(m, ripartenza) {
  ep.tentativi++;
  const prova = { n: ep.tentativi, ripartenza, ondate: [], fiducia_prima: null };
  ep.prove.push(prova);
  const concentrato = ep.tentativi > 3 ? ep.tentativi - 3 : 0;
  let fotoChiamata = false, fotoRapporto = false;
  for (;;) {
    await stabile();
    const vecchia = await pagina.$('.scena');
    const nome = await dove();
    const s = await sal(); const ic = s?.in_corso;
    if (nome === 'schieramento') {
      await scena('schieramento');
      prova.fiducia_prima ??= ic.variabili.credito;
      const o = { n: ic.ondata, titolo: leggi(await testo('.testata-t')), chiamate: [] };
      o.disposizione = await schieramento(m, ic, concentrato, ic.ondata === 1 || (ripartenza && !prova.ondate.length));
      prova.ondate.push(o);
    } else if (nome === 'chiamata') {
      await scena('chiamata');
      const c = chiamateAperte(m, ic)[0];
      const mostrata = await pagina.locator(`[data-messaggio="chiamata-${c.id}"]`).count();
      if (!mostrata) registro.problemi_rilevati = [...(registro.problemi_rilevati ?? []), `${m.id} ondata ${ic.ondata}: a schermo non c'è la chiamata ${c.id} attesa dal motore`];
      const op = decidiRisposta(m, ic, c, concentrato);
      const domanda = leggi(await testo(`[data-messaggio="chiamata-${c.id}"]`));
      const scelta = leggi(await testo(`[data-opzione="${op}"]`));
      if (!fotoChiamata) { await foto(`${m.id}-${ep.tentativi}-chiamata`); fotoChiamata = true; }
      await premi(`[data-opzione="${op}"]`);
      const voce = { id: c.id, opzione: op, domanda, scelta, valide: opzioniValide(c, ic, m).length };
      await pagina.waitForFunction((e) => !e.isConnected, vecchia, { timeout: 8000 }); await stabile();
      if ((await dove()) === 'risposta') { await scena('risposta'); voce.risposta = leggi(await testo('.scena')); const r = await pagina.$('.scena'); await premi('[data-azione="continua"]'); await pagina.waitForFunction((e) => !e.isConnected, r, { timeout: 8000 }); }
      prova.ondate.at(-1)?.chiamate.push(voce);
    } else if (nome === 'chiusura') {
      await scena('chiusura'); await premi('[data-azione="rapporto"]');
    } else if (nome === 'rapporto') {
      await scena('rapporto');
      const r = ic.rapporti.at(-1);
      const o = prova.ondate.find((x) => x.n === r.n) ?? prova.ondate.at(-1);
      if (o) { o.rapporto = leggi(await testo('.scena')); o.tensione = r.tensione; o.tensione_max = ic.variabili.tensione_max; o.fiducia = ic.variabili.credito; }
      const ultima = r.n === m.ondate.length;
      if (!fotoRapporto || ultima) { await foto(`${m.id}-${ep.tentativi}-rapporto${r.n}`); fotoRapporto = true; }
      if (ultima) { prova.tensione_max = ic.variabili.tensione_max; prova.fiducia_dopo = ic.variabili.credito; prova.variabili_fine = ic.variabili; }
      await premi('[data-azione="avanti"]');
    } else if (nome === 'verbale') {
      await scena('verbale');
      const s2 = await sal(); const voce = s2.episodi[m.id];
      prova.esito = await pagina.getAttribute('[data-esito]', 'data-esito');
      prova.esito_testo = await testo('[data-esito]');
      prova.verbale = leggi(await testo('.scheda.verbale p'));
      prova.fallita = (await pagina.locator('[data-fallita]').count()) > 0;
      prova.stelle = await pagina.evaluate(() => document.querySelectorAll('.scheda.verbale .stella.piena, .scheda.verbale [data-piena="si"]').length);
      prova.bilancio = (await pagina.evaluate(() => [...document.querySelectorAll('[data-sezione]')].map((x) => `${x.dataset.sezione}: ${x.textContent.replace(/\s+/g, ' ').trim()}`)));
      prova.migliore_registrato = voce?.migliore ?? null;
      await foto(`${m.id}-${ep.tentativi}-verbale`);
      return { prova, sal: s2 };
    } else throw new Error(`${m.id}: scena inattesa «${nome}»`);
    await pagina.waitForFunction((e) => !e.isConnected, vecchia, { timeout: 8000 });
  }
}

try {
  await pagina.goto(`http://127.0.0.1:${srv.address().port}/`);
  await pagina.evaluate(() => localStorage.clear()); await pagina.reload();
  await scena('titolo'); await foto('00-titolo');
  registro.versione_home = await pagina.getAttribute('[data-versione]', 'data-versione').catch(() => null);
  registro.riga_home = await testo('[data-versione]');
  await pagina.getByRole('button', { name: 'Nuova partita' }).click(); await scena('genere'); await foto('00-genere');
  await pagina.click('[data-genere="m"]');
  await scena('guida'); await foto('00-guida');
  while (await pagina.locator('[data-azione="guida-avanti"]').count()) await pagina.click('[data-azione="guida-avanti"]');
  await pagina.click('[data-azione="guida-fine"]');
  await scena('citta'); await foto('00-citta-s1');
  await vai('[data-azione="avvia-episodio"]');
  let stagione = 1;
  for (let giro = 0; giro < 400; giro++) {
    const id = await pagina.getAttribute('.scena[data-scena="sala"]', 'data-missione', { timeout: 8000 });
    const m = missioni[id];
    let { prova, sal: s } = await giocaEpisodio(m);
    while (prova.fallita) {
      const riparti = pagina.locator('[data-azione="riparti"]');
      if (await riparti.count()) {
        const n = Number(await riparti.getAttribute('data-ondata'));
        await vai('[data-azione="riparti"]');
        ({ prova, sal: s } = await giocaDaQui(m, n));
      } else {
        await vai('[data-azione="rigioca"]');
        ({ prova, sal: s } = await (async () => { await scena('sala'); await vai('[data-azione="avanti"]'); await scena('briefing');
          while (await pagina.locator('[data-azione="prossimo"]').count()) await premi('[data-azione="prossimo"]');
          await vai('[data-azione="inizia"]'); return giocaDaQui(m, 1); })());
      }
      if (ep.tentativi > 12) throw new Error(`${m.id}: oltre 12 tentativi`);
    }
    ep.variabili_dopo = s.variabili; ep.registro = s.episodi[m.id];
    const prossimo = pagina.locator('[data-azione="prossimo"]');
    await avanzaFino(pagina, '[data-azione="prossimo"]', async () => {});
    const dopo = await prossimo.count() ? null : 'fine';
    if (dopo === 'fine' || m.id === 'e36') {
      await avanzaFino(pagina, '[data-azione="citta"]', async () => {}); await foto(`${m.id}-finale-ultimo-passo`);
      await pagina.click('[data-azione="citta"]'); await scena('citta'); await foto('99-citta-finale');
      registro.dopo_finale = await testo('.scena');
      break;
    }
    // Cambio di stagione: il giocatore passa dalla mappa della città per vedere la stagione nuova
    const prossimaStagione = Object.values(missioni).find((x) => x.episodio === m.episodio + 1)?.stagione;
    if (prossimaStagione && prossimaStagione !== stagione) {
      await pagina.click('[data-azione="citta"]'); await scena('citta'); ep = null;
      await foto(`00-citta-fine-s${stagione}`);
      stagione = prossimaStagione;
      registro[`citta_fine_s${stagione - 1}`] = await testo('.scena');
      await vai('[data-azione="avvia-episodio"]');
      await scena('sala'); await foto(`00-citta-s${stagione}-sala`);
      continue;
    }
    await vai('[data-azione="prossimo"]');
  }
} catch (e) {
  registro.blocco = { messaggio: e.message.slice(0, 500), episodio: ep?.id ?? null, scena: await dove(), passo };
  await foto('blocco').catch(() => {});
} finally {
  registro.salvataggio_finale = await sal().catch(() => null);
  writeFileSync('docs/partita-az/partita.json', JSON.stringify(registro, null, 1));
  await browser.close(); srv.close();
  console.log(registro.blocco ? `BLOCCO: ${JSON.stringify(registro.blocco)}` : `fine: ${registro.episodi.length} episodi, errori console ${registro.errori.length}`);
}
