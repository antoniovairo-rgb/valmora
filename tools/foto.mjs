// Gioca la prima missione nel browser a 360/375/412 px, come il giocatore attento (src/logica/bot.ts):
// foto di ogni scena, errori di console, scorrimento orizzontale, link APK, trascinamento di un'unità,
// ripresa dopo una ricarica a metà ondata, esito finale = il migliore della missione.
// Uso: node tools/foto.mjs [cartella-foto] [cartella-build] [cartella-dati]
//   predefinite: out/foto (ignorata da git), dist, data. Con dati di prova serve una build fatta con
//   VALMORA_DATI=<cartella-dati> (vite.config.ts), per esempio in out/dist-prova.
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright-core';
import { leggiDati } from './dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, iniziaMissione, missioneFinita, opzioniValide, rispondi, schiera } from '../src/logica/missione.ts';
import { attenta, equilibrata, peggiore } from '../src/logica/bot.ts';
import { valutaEpisodio } from '../src/logica/episodi.ts';
import { creaCaso } from '../src/logica/caso.ts';
import { URL_APK } from '../src/resa/collegamenti.ts';

export const LARGHEZZE = [360, 375, 412];
const TIPI = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };

function servi(dir) {
  const srv = createServer((req, res) => {
    const u = decodeURIComponent((req.url ?? '/').split('?')[0]);
    const p = join(dir, u === '/' ? 'index.html' : u);
    if (!existsSync(p)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': TIPI[extname(p)] ?? 'application/octet-stream' });
    res.end(readFileSync(p));
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

/** Una partita sulla prima missione, calcolata dal motore: schieramenti, risposte, esito. */
function gioca(m, dich, g) {
  let s = iniziaMissione(m, variabiliIniziali(dich.values()), dich);
  const ondate = [];
  while (!missioneFinita(m, s)) {
    const disposizione = g.schiera(m, s);
    s = schiera(m, s, disposizione);
    const risposte = [];
    for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); risposte.push([c.id, o]); s = rispondi(m, s, c.id, o, dich); }
    ondate.push({ disposizione, risposte });
    s = chiudiOndata(m, s, dich);
  }
  const fine = concludiMissione(m, s, dich);
  return { ondate, esito: fine.esito.id, stelle: valutaEpisodio(m, fine).stelle, fallita: !!fine.esito.fallita };
}

/**
 * Il giocatore attento di bot.ts; se non arriva all'esito migliore (guarda solo la tensione), il
 * giocatore equilibrato (pesa anche il credito; in e01 v2 arriva a 3 stelle); se nemmeno lui,
 * schieramento attento e risposte dal seme più piccolo che porta all'esito migliore. Così il giro
 * prova sempre che l'esito migliore si raggiunge dall'interfaccia; quale giocatore è servito è stampato.
 */
export function pianoAttento(dirDati = 'data') {
  const dati = leggiDati(dirDati);
  const m = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x).sort((a, b) => a.episodio - b.episodio)[0];
  const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
  const migliore = m.esiti[0].id;
  const fallimento = gioca(m, dich, peggiore(creaCaso(1), dich)); // per provare «fallito → rigioca» (D-059)
  const att = attenta(creaCaso(1), dich);
  const base = gioca(m, dich, att);
  if (base.esito === migliore) return { m, ...base, migliore, fallimento, giocatore: 'attento', esitoAttento: base.esito };
  const eq = gioca(m, dich, equilibrata(creaCaso(1), dich));
  if (eq.esito === migliore) return { m, ...eq, migliore, fallimento, giocatore: 'equilibrato', esitoAttento: base.esito };
  for (let seme = 1; seme <= 1000; seme++) {
    const caso = creaCaso(`foto:${m.id}:${seme}`);
    const p = gioca(m, dich, { schiera: att.schiera, scegli: (_m, st, c) => caso.scegli(opzioniValide(c, st)).id });
    if (p.esito === migliore) return { m, ...p, migliore, fallimento, giocatore: `schieramento attento, risposte dal seme ${seme}`, esitoAttento: base.esito };
  }
  return { m, ...base, migliore, fallimento, giocatore: 'attento (nessun seme 1-1000 arriva al migliore)', esitoAttento: base.esito };
}

export async function giraFoto(cartella = 'out/foto', build = 'dist', dirDati = 'data') {
  mkdirSync(cartella, { recursive: true });
  const srv = await servi(build);
  const url = `http://127.0.0.1:${srv.address().port}/`;
  const percorso = process.env.VALMORA_CHROME ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const browser = await chromium.launch({ executablePath: percorso });
  const piano = pianoAttento(dirDati);
  const giri = [];
  try {
    for (const larghezza of LARGHEZZE) {
      const g = { larghezza, errori: [], scorrimento: [], attesi: [] };
      const atteso = (cosa, ok) => g.attesi.push({ cosa, ok });
      // reducedMotion: transizioni ridotte a dissolvenze e mappa ferma → foto stabili fra un giro e l'altro.
      const pagina = await browser.newPage({ viewport: { width: larghezza, height: 800 }, reducedMotion: 'reduce' });
      pagina.on('console', (m) => { if (m.type() === 'error') g.errori.push(m.text()); });
      pagina.on('pageerror', (e) => g.errori.push(e.message));
      let k = 0;
      const scena = async (nome) => {
        await pagina.waitForSelector(`.scena[data-scena="${nome}"]`, { timeout: 5000 });
        await pagina.waitForFunction(() => document.querySelectorAll('.scena').length === 1 && getComputedStyle(document.querySelector('.scena')).opacity === '1'
          && [...document.querySelectorAll('[data-messaggio]')].every((x) => getComputedStyle(x).opacity === '1') && [...document.querySelectorAll('.mappa')].every((x) => x.dataset.pronta === 'si'), null, { timeout: 5000 });
      };
      const foto = async () => {
        const nome = await pagina.getAttribute('.scena', 'data-scena');
        const [contenuto, finestra] = await pagina.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
        if (contenuto > finestra) g.scorrimento.push({ schermata: nome, contenuto, finestra });
        await pagina.screenshot({ path: join(cartella, `${larghezza}-${String(++k).padStart(2, '0')}-${nome}.png`), fullPage: true });
      };
      const premi = (sel) => pagina.click(sel);
      const presenze = () => pagina.locator('[data-presenza]').count();
      const ricaricaERiprendi = async (attesa, perche) => {
        await pagina.reload();
        await scena('titolo');
        const riprendi = await pagina.getByRole('button', { name: 'Riprendi' }).count();
        atteso(`${perche}: dopo la ricarica manca «Riprendi»`, riprendi === 1);
        if (riprendi) await pagina.getByRole('button', { name: 'Riprendi' }).click();
        const ok = await scena(attesa).then(() => true, () => false);
        atteso(`${perche}: la ripresa non torna a «${attesa}»`, ok);
      };

      await pagina.goto(url);
      await pagina.evaluate(() => localStorage.clear());
      await pagina.reload();
      await scena('titolo');
      const apk = await pagina.getAttribute('[data-azione="apk"]', 'href').catch(() => null);
      atteso(`nella home manca il link all'APK (trovato «${apk}»)`, apk === URL_APK);
      await foto();
      await premi('[data-azione="crediti"]'); await scena('crediti'); await foto();
      await pagina.getByRole('button', { name: 'Torna al titolo' }).click(); await scena('titolo');
      await pagina.getByRole('button', { name: 'Nuova partita' }).click(); await scena('citta'); await foto();

      // Una partita intera dall'interfaccia, dalla sala al verbale. «completa»: foto di ogni scena,
      // trascinamento e ricariche a metà ondata; altrimenti solo il verbale (serve per il fallimento).
      let completa = true;
      const fotoSe = () => (completa ? foto() : Promise.resolve());
      const partita = async (p) => {
        await scena('sala'); await fotoSe();
        await premi('[data-azione="avanti"]'); await scena('briefing'); await fotoSe();
        while (await pagina.locator('[data-azione="prossimo"]').count()) await premi('[data-azione="prossimo"]');
        if (p.m.briefing.length > 1) { await scena('briefing'); await fotoSe(); }
        await premi('[data-azione="inizia"]');
        for (const [i, o] of p.ondate.entries()) {
          const n = i + 1;
          await scena('schieramento');
          atteso(`ondata ${n}: la scena è dell'ondata ${await pagina.getAttribute('main', 'data-ondata')}`, (await pagina.getAttribute('main', 'data-ondata')) === String(n));
          let unita = Object.entries(o.disposizione).flatMap(([r, ps]) => Object.entries(ps).flatMap(([s, q]) => Array(q).fill([r, s])));
          if (completa && n === 1 && unita.length) { // la prima unità si trascina davvero dal vassoio alla mappa
            const [r, s] = unita[0];
            const da = await pagina.locator(`[data-risorsa="${r}"]`).boundingBox();
            const a = await pagina.locator(`[data-settore="${s}"] .settore-punto`).boundingBox();
            await pagina.mouse.move(da.x + da.width / 2, da.y + da.height / 2);
            await pagina.mouse.down();
            await pagina.mouse.move(a.x + a.width / 2, a.y + a.height / 2, { steps: 12 });
            await pagina.mouse.up();
            atteso(`trascinamento: ${r} non è arrivata in ${s}`, (await pagina.locator(`[data-presenza="${r}@${s}"]`).count()) === 1);
            unita = unita.slice(1);
          }
          for (const [r, s] of unita) { // le altre col tocco: unità, poi settore
            if ((await pagina.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await premi(`[data-risorsa="${r}"]`);
            await premi(`[data-settore="${s}"] .settore-punto`);
          }
          await fotoSe();
          await premi('[data-azione="conferma"]');
          const dopo = o.risposte.length ? 'chiamata' : 'chiusura';
          await scena(dopo);
          if (completa && n === 1) { // a metà ondata: ricarico e riprendo
            const prima = await presenze();
            await ricaricaERiprendi(dopo, 'dopo lo schieramento');
            atteso(`ripresa: unità sulla mappa ${await presenze()} invece di ${prima}`, (await presenze()) === prima);
          }
          for (const [j, [c, op]] of o.risposte.entries()) {
            await scena('chiamata');
            atteso(`ondata ${n}: aperta una chiamata diversa da «${c}»`, (await pagina.locator(`[data-messaggio="chiamata-${c}"]`).count()) === 1);
            await fotoSe();
            await premi(`[data-opzione="${op}"]`);
            if (p.m.ondate[i].chiamate.find((x) => x.id === c).opzioni.find((x) => x.id === op).risposta) {
              await scena('risposta');
              if (j === 0) await fotoSe();
              await premi('[data-azione="continua"]');
            }
            if (completa && n === 1 && j === 0) await ricaricaERiprendi(o.risposte.length > 1 ? 'chiamata' : 'chiusura', 'dopo la prima risposta');
          }
          await scena('chiusura'); await fotoSe();
          await premi('[data-azione="rapporto"]'); await scena('rapporto'); await fotoSe();
          const cifre = await pagina.locator('.elenco-settori').textContent();
          atteso(`rapporto ${n}: la tensione si vede in numeri (D-055): «${cifre}»`, !/\d/.test(cifre ?? ''));
          await premi('[data-azione="avanti"]');
        }
        await scena('verbale'); await foto();
      };

      // 1) fallimento col giocatore peggiore → «Rigioca l'episodio» (D-059)
      const f = piano.fallimento;
      atteso(`il giocatore peggiore non fallisce l'episodio (esito «${f.esito}»): il rigioco non si prova`, f.fallita);
      await premi('[data-azione="avvia-episodio"]');
      completa = false;
      await partita({ m: piano.m, ...f });
      completa = true;
      atteso(`fallimento: il verbale non dice «fallito» (esito «${await pagina.getAttribute('[data-esito]', 'data-esito')}»)`, (await pagina.locator('[data-fallita="si"]').count()) === 1);
      atteso('fallimento: stelle diverse da 0', (await pagina.getAttribute('.stelle', 'data-stelle')) === '0');
      await premi('[data-azione="rigioca"]');

      // 2) rigioco col giocatore migliore, con tutte le prove
      await partita(piano);
      const esito = await pagina.getAttribute('[data-esito]', 'data-esito');
      atteso(`giocatore «${piano.giocatore}»: la resa finisce con «${esito}», il motore dice «${piano.esito}»`, esito === piano.esito);
      atteso(`giocatore «${piano.giocatore}»: non arriva all'esito migliore «${piano.migliore}» (arriva a «${esito}»)`, esito === piano.migliore);
      const stelle = await pagina.getAttribute('.stelle', 'data-stelle');
      atteso(`verbale: ${stelle} stelle a schermo, il motore dice ${piano.stelle}`, stelle === String(piano.stelle));
      // 3) mappa della città: l'episodio è superato e mostra le sue stelle
      await premi('[data-azione="citta"]'); await scena('citta'); await foto();
      const ep = pagina.locator(`[data-episodio="${piano.m.id}"]`);
      atteso(`città: ${piano.m.id} è «${await ep.getAttribute('data-stato')}», non «superato»`, (await ep.getAttribute('data-stato')) === 'superato');
      atteso(`città: stelle di ${piano.m.id} sulla mappa diverse da ${piano.stelle}`, (await ep.locator('.stelle').getAttribute('data-stelle')) === String(piano.stelle));
      await pagina.close();
      giri.push(g);
    }
  } finally { await browser.close(); srv.close(); }
  return giri;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { controllaGiro } = await import('./controlli-grafica.mjs');
  const [cartella = 'out/foto', build = 'dist', dati = 'data'] = process.argv.slice(2);
  const giri = await giraFoto(cartella, build, dati);
  const p = giri.flatMap(controllaGiro);
  const piano = pianoAttento(dati);
  console.log(`giocatore: ${piano.giocatore}; esito del giocatore attento di bot.ts: ${piano.esitoAttento}`);
  console.log(p.length ? p.join('\n') : `verde: ${giri.length} larghezze, foto in ${cartella}`);
  process.exit(p.length ? 1 : 0);
}
