// Tutti gli episodi, abbozzi compresi (S-09, D-087), senza giocarli tutti a ogni catena:
// - un salvataggio di prova con ogni episodio superato (1 stella, variabili iniziali) li rende tutti avviabili;
// - ognuno si apre dalla città (stagione giusta, segno «bozza»), si attraversano sala e briefing fino al primo
//   schieramento: nessun errore di console, nessuna chiave di testo mancante «[[…]]», i dettagli dei dati disegnati;
// - il primo episodio di ogni stagione oltre la prima si gioca per intero (partita di foto.mjs).
import { leggiDati } from './dati-disco.mjs';
import { avanzaFino, controllaHome, controllaTripla } from './foto-club.mjs';
import { controllaNomiSala } from './foto-c15.mjs';
import { controllaVignetta } from './foto-c22.mjs';
import { controllaCitta, controllaNomiCittaTutti } from './foto-c17.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { GAME_VERSION } from '../src/versione.ts';

const CHIAVE = 'valmora-salvataggio';

export function missioniDai(dirDati) {
  const dati = leggiDati(dirDati);
  const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x).sort((a, b) => a.episodio - b.episodio);
  const v0 = variabiliIniziali(dati['stato.json'].variabili);
  return { missioni, v0 };
}

/** Salvataggio v2 con tutti gli episodi superati: ognuno parte dalle variabili iniziali. */
export function salvataggioTutti(missioni, v0) {
  const episodi = Object.fromEntries(missioni.map((m) => [m.id, { migliore: { esito: m.esiti[0].id, fallita: false, stelle: 1 }, tentativi: 1, variabili_prima: v0, variabili_dopo: v0 }]));
  return { save_version: 2, game_version: GAME_VERSION, seme: 1, caso: 1, variabili: v0, missioni_concluse: missioni.map((m) => m.id), episodi, genere: 'm', rapporto_aperto: null, in_corso: null };
}

/** Dalla città: stagione dell'episodio, segno «bozza» sul punto e sulla scheda, tocco sul punto, «Rigioca». */
export async function apriDallaCitta(pagina, m, atteso) {
  const stagione = pagina.locator(`[data-stagione="${m.stagione}"]`);
  if (await stagione.count()) await stagione.click();
  const punto = pagina.locator(`[data-episodio="${m.id}"]`);
  atteso(`${m.id}: ${m.bozza ? 'abbozzo senza' : 'episodio finito col'} segno «bozza» sulla città (S-09)`, (await punto.getAttribute('data-bozza') === 'si') === !!m.bozza);
  await punto.locator('.settore-punto').click();
  atteso(`${m.id}: scheda ${m.bozza ? 'senza' : 'con'} segno «bozza» (S-09)`, ((await pagina.locator('[data-bozza-scheda]').count()) === 1) === !!m.bozza);
  await pagina.click('[data-azione="avvia-episodio"]');
  // episodio già superato: tre conferme prima di rigiocarlo (S-16, PO-066)
  if (await pagina.locator('.tripla').count()) { await controllaTripla(pagina, atteso, `${m.id} «Rigioca»`); await pagina.click('[data-azione="conferma-rigioca"]'); }
}

const PAGINE = 3; // D-202
export async function apriTutte(c) {
  const { pagina, dirDati, atteso, scena, premi, partita, pianoAttento, errori, cartella } = c;
  const { missioni, v0 } = missioniDai(dirDati);
  const sal = JSON.stringify(salvataggioTutti(missioni, v0));
  const finestra = pagina.viewportSize();
  await pagina.setViewportSize({ width: finestra.width, height: 760 }); // il telefono di riferimento (PO-045, PO-052)
  await controllaNomiCittaTutti(pagina, atteso, sal, scena); // C20-03
  // D-125: i 16 stemmi alla misura vera, a 360/375/412 (tools/foto-stemmi.mjs), con le foto nella cartella del giro
  const { paginaStemmi, controllaStemmiTutti } = await import('./foto-stemmi.mjs');
  for (const w of [360, 375, 412]) { const p = await paginaStemmi(pagina.context().browser(), w, process.env.VALMORA_ROSSI ?? ''); await controllaStemmiTutti(p, atteso, `${w}px`); if (cartella) await p.screenshot({ path: `${cartella}/stemmi-${w}.png`, fullPage: true }); await p.close(); }
  // C47-03 (D-218): C17-12 anche sulla stagione 3 con tutti i 36 episodi conclusi, stelle comprese (rosso C218S01)
  await pagina.evaluate(([k, v]) => localStorage.setItem(k, v), [CHIAVE, sal]); await pagina.reload(); await scena('titolo'); await pagina.getByRole('button', { name: 'Riprendi' }).click(); await scena('citta');
  await pagina.click('[data-stagione="3"]'); await controllaCitta(pagina, atteso, `città, stagione 3 con 36 episodi, ${pagina.viewportSize().width}×${pagina.viewportSize().height}`);
  // PO-091: con nessun episodio superato, la stagione 2 è chiusa e la scheda dice cosa la apre; «Prossimo» porta all'episodio 01
  await pagina.evaluate(([k, v]) => localStorage.setItem(k, v), [CHIAVE, JSON.stringify({ ...JSON.parse(sal), episodi: {}, missioni_concluse: [] })]);
  await pagina.reload(); await scena('titolo'); await pagina.getByRole('button', { name: 'Riprendi' }).click(); await scena('citta');
  await controllaCitta(pagina, atteso, `città ${pagina.viewportSize().width}×${pagina.viewportSize().height}`);
  await pagina.click('[data-stagione="2"]');
  const chiusa = await pagina.locator('[data-invito="chiusa"]').textContent().catch(() => '');
  atteso(`città: la stagione 2 chiusa dice «${chiusa}» invece di perché è chiusa e cosa la apre (PO-091)`, /chiusa/.test(chiusa) && /superato/.test(chiusa));
  await pagina.click('[data-azione="vai-prossimo"]').catch(() => {});
  atteso('città: «Prossimo» non porta alla scheda dell\'episodio 01 (PO-091)', (await pagina.locator('[data-scheda-episodio="e01"]').count()) === 1);
  const prime = new Set([...new Set(missioni.map((m) => m.stagione))].slice(1).map((s) => missioni.find((m) => m.stagione === s)?.id));
  // D-202: gli episodi si aprono su PAGINE pagine insieme (attese, non calcolo); quelli che giocano una partita restano sulla
  // pagina del giro (partita è legata a lei). Ogni pagina conta i suoi errori di console; tutti finiscono anche nel giro.
  const altre = await Promise.all(Array.from({ length: PAGINE - 1 }, async () => {
    const q = await pagina.context().browser().newPage({ viewport: { width: finestra.width, height: 760 }, reducedMotion: 'reduce' }), err = [];
    await q.addInitScript(() => { globalThis.__VALMORA_SECONDO_MS = 1; }); const rossi = (process.env.VALMORA_ROSSI ?? '').split(',').filter(Boolean);
    if (rossi.length) await q.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, rossi);
    q.on('console', (x) => { if (x.type() === 'error') { err.push(x.text()); errori.push(x.text()); } }); await q.goto(pagina.url());
    return { pagina: q, errori: err, premi: (sel) => avanzaFino(q, sel, () => {}).then(() => q.click(sel)), scena: async (nome) => {
      await q.waitForSelector(`.scena[data-scena="${nome}"]`, { timeout: 5000 });
      await q.waitForFunction(() => document.querySelectorAll('.scena').length === 1 && getComputedStyle(document.querySelector('.scena')).opacity === '1'
        && [...document.querySelectorAll('[data-messaggio]')].every((x) => getComputedStyle(x).opacity === '1') && [...document.querySelectorAll('.mappa')].every((x) => x.dataset.pronta === 'si'), null, { timeout: 5000 }); } };
  }));
  const proprie = [], ascolta = (x) => { if (x.type() === 'error') proprie.push(x.text()); }; pagina.on('console', ascolta); // la pagina del giro scrive già nel giro
  const tutte = [{ pagina, errori: proprie, premi, scena }, ...altre], giri = tutte.map(() => []);
  for (const [i, m] of missioni.entries()) giri[prime.has(m.id) ? 0 : i % tutte.length].push([i, m]);
  await Promise.all(tutte.map((P, k) => (async () => { for (const [i, m] of giri[k]) await apriUna(P, i, m); })()));
  await Promise.all(altre.map((P) => P.pagina.close())); pagina.off('console', ascolta);
  await pagina.setViewportSize(finestra);

  async function apriUna({ pagina, errori, premi, scena }, i, m) {
    const prima = errori.length;
    try {
      await pagina.evaluate(([k, v]) => localStorage.setItem(k, v), [CHIAVE, sal]);
      await pagina.reload(); await scena('titolo');
      await pagina.getByRole('button', { name: 'Riprendi' }).click(); await scena('citta');
      await apriDallaCitta(pagina, m, atteso);
      if (prime.has(m.id)) await partita({ ...pianoAttento(dirDati, i, v0) });
      else {
        const testi = [];
        await scena('sala'); testi.push(await pagina.locator('main').textContent());
        await controllaVignetta(pagina, 'apertura-', atteso, `${m.id} sala dalla città`, true); // C26: entrata dalla città, rosso C78V01
        if (i === 0 && (await pagina.locator('[data-azione="passo"]').count())) { // S-21: indietro rilegge il passo precedente
          await pagina.click('[data-azione="passo"]'); await pagina.goBack().catch(() => {}); await pagina.waitForTimeout(150);
          const passo = await pagina.getAttribute('.passi', 'data-passo').catch(() => null);
          atteso(`${m.id} sala: col tasto indietro si è a «${passo}», non al passo 1 (D-104)`, passo?.startsWith('1/') && (await pagina.locator('.scena[data-scena="sala"]').count()) === 1);
        }
        if ((await pagina.getAttribute('.mappa', 'data-mappa')) === 'webgl') { // dettagli dei dati disegnati davvero (D-095)
          const voluti = (m.mappa.dettagli ?? []).map((x) => x.split('@')[0]).sort().join(','), visti = ((await pagina.getAttribute('.mappa', 'data-dettagli')) ?? '').split(',').filter(Boolean).sort().join(',');
          atteso(`${m.id}: dettagli disegnati «${visti}», i dati dicono «${voluti}» (D-095)`, visti === voluti);
          await controllaNomiSala(pagina, atteso, `${m.id} sala`);
          // S-25 (PO-080): due curve = stadio con la partita; nessuna curva ma il piazzale dello stadio = stadio vuoto
          const tipi = m.mappa.settori.map((x) => x.tipo), curve = tipi.filter((t) => t === 'curva').length;
          const stadio = curve >= 2 ? 'pieno' : !curve && tipi.includes('piazzale') ? 'vuoto' : '', visto = await pagina.getAttribute('.mappa', 'data-stadio');
          atteso(`${m.id}: stadio disegnato «${visto}», i dati dicono «${stadio}» (S-25)`, visto === stadio);
          const coperti = stadio === 'vuoto' ? await pagina.evaluate(() => { // pallini dei settori fuori dagli spalti (i nomi, su fondo nero, possono starci sopra)
            const m = document.querySelector('.mappa'), r = m.getBoundingClientRect(), [cx, cy, rx, ry] = m.dataset.stadioEllisse.split(',').map(Number);
            return [...m.querySelectorAll('.settore-punto')].filter((e) => { const b = e.getBoundingClientRect();
              return Math.hypot((b.x + b.width / 2 - r.x - cx) / rx, (b.y + b.height / 2 - r.y - cy) / ry) < 1.1; }).map((e) => e.closest('[data-settore]').dataset.settore);
          }) : [];
          atteso(`${m.id}: lo stadio vuoto copre ${coperti.join(', ')} (S-25)`, !coperti.length);
          if (stadio === 'vuoto' && cartella) await pagina.locator('.mappa').first().screenshot({ path: `${cartella}/s25-${m.id}-stadio-vuoto.png` });
        }
        await premi('[data-azione="avanti"]'); await scena('briefing'); testi.push(await pagina.locator('main').textContent());
        await premi('[data-azione="inizia"]'); await scena('schieramento'); testi.push(await pagina.locator('main').textContent());
        await controllaHome(pagina, `${m.id} schieramento`, atteso);
        const manca = [...new Set(testi.join(' ').match(/\[\[[^\]]+\]\]/g) ?? [])];
        atteso(`${m.id}: chiavi di testo mancanti ${manca.slice(0, 3).join(', ')}`, !manca.length);
      }
    } catch (e) { atteso(`${m.id}: non si apre (${e.message.split('\n')[0]})`, false); }
    atteso(`${m.id}: ${errori.length - prima} errori di console aprendolo (${errori.slice(prima, prima + 1).join('')})`, errori.length === prima);
  }
}
