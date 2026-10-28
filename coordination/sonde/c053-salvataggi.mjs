// C-053 punto 3: salvataggio di una partita a metà creato dalla 0.53.0 e ripreso dalla 0.54.0.
// Due modi, stesso script, stessa strategia (il bot attento, stesso generatore):
//   C053_SV=2 C053_GV=0.53.0 node coordination/sonde/c053-salvataggi.mjs crea   (dalla radice di un checkout di 84fd51f5, build in dist/)
//   node coordination/sonde/c053-salvataggi.mjs riprendi <cartella con i file di «crea»>                  (dalla radice di main)
// «crea» porta ogni scenario al suo punto, scrive il localStorage grezzo, poi gioca fino in fondo e scrive il racconto e lo stato finale.
// «riprendi» carica quel localStorage nella 0.54.0, controlla scena e chiamata, il salvataggio dopo il caricamento, e rigioca fino in fondo.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as L from './c053-lib.mjs';

const modo = process.argv[2], dir = process.argv[3] ?? process.env.C053_OUT ?? 'coordination/collaudi/c053/dati/salvataggi';
mkdirSync(dir, { recursive: true });
const SCENARI = [
  { nome: 'e01-ondata2', ep: 'e01', ferma: (q, p, r) => r.length >= 7 && q === 'chiamata' },
  { nome: 'e09-ondata3', ep: 'e09', ferma: (q, p, r) => r.length >= 9 && q === 'chiamata' },
  { nome: 'e17-ondata2', ep: 'e17', ferma: (q, p, r) => r.length >= 6 && q === 'chiamata' },
  { nome: 'e29-ondata4', ep: 'e29', ferma: (q, p, r) => r.length >= 13 && q === 'chiamata' },
  { nome: 'e05-rapporto', ep: 'e05', ferma: (q, p, r) => r.length >= 4 && q === 'rapporto' },
  { nome: 'e05-schieramento', ep: 'e05', ferma: (q, p, r) => r.length >= 4 && q === 'schieramento' && false },
  { nome: 'e01-sconfitta', ep: 'e01', strategia: 'peggiore', ferma: (q) => q === 'verbale' },
];
const ids = (r) => r.map((x) => `${x.ondata}${x.imprevisto ? '*' : ''}${x.variante ? '~' : ''}:${x.id}>${x.scelta}`);
const finale = async (p, ep) => { const s = await L.stato(p); return { scena: await L.scenaDi(p), episodio: s.episodi[ep], variabili: s.variabili, concluse: s.missioni_concluse, in_corso: s.in_corso ? 'presente' : null }; };
const A = await L.avvia();
const esiti = [];
for (const sc of SCENARI) {
  const m = L.missioni.find((x) => x.id === sc.ep);
  if (modo === 'crea') {
    const p = await L.nuovaPagina(A.browser, A.url, 375, 667, L.salvataggioPrima(sc.ep));
    await L.apriEpisodio(p, m);
    let primi;
    if (sc.nome === 'e05-schieramento') { // un solo passo di bozza: tre unità messe e non confermate, all'ondata 2
      primi = await L.giocaEpisodio(p, m, { ferma: (q, pp, r) => r.length >= 4 && q === 'schieramento' });
      const risorsa = await p.locator('[data-risorsa]').first().getAttribute('data-risorsa');
      await p.click(`[data-risorsa="${risorsa}"]`); const settori = await p.locator('[data-settore] .settore-punto').all();
      for (const s of settori.slice(0, 3)) { await s.click(); await p.waitForTimeout(80); }
      await p.waitForTimeout(500);
    } else primi = await L.giocaEpisodio(p, m, { strategia: sc.strategia, ferma: sc.ferma });
    const grezzo = await p.evaluate((k) => localStorage.getItem(k), L.CHIAVE);
    const visto = { scena: await L.scenaDi(p), chiamata: await p.evaluate(() => document.querySelector('[data-messaggio]')?.dataset.messaggio ?? null), presenze: await p.locator('[data-presenza]').count(), testo: await p.evaluate(() => document.querySelector('.scena')?.innerText ?? ''), azioni: await p.evaluate(() => [...document.querySelectorAll('.scena [data-azione]')].map((x) => x.dataset.azione)) };
    writeFileSync(`${dir}/${sc.nome}.salvataggio.json`, grezzo);
    let resto = [], fine = null;
    if (sc.nome !== 'e05-schieramento') {
      if (sc.nome === 'e01-sconfitta') { /* il verbale è la fine */ } else resto = await L.giocaEpisodio(p, m, { strategia: sc.strategia });
      fine = await finale(p, sc.ep);
    }
    writeFileSync(`${dir}/${sc.nome}.053.json`, JSON.stringify({ visto, primi: ids(primi), resto: ids(resto), fine, versione: JSON.parse(grezzo).game_version, sv: JSON.parse(grezzo).save_version, errori: p.errori }, null, 1));
    console.log(`[crea] ${sc.nome}: save_version ${JSON.parse(grezzo).save_version}, game_version ${JSON.parse(grezzo).game_version}, scena «${visto.scena}», chiamata ${visto.chiamata}, resto ${resto.length} chiamate, fine ${fine?.scena}`);
    await p.close();
  } else {
    const grezzo = readFileSync(`${dir}/${sc.nome}.salvataggio.json`, 'utf8'), rif = JSON.parse(readFileSync(`${dir}/${sc.nome}.053.json`, 'utf8'));
    const p = await L.nuovaPagina(A.browser, A.url, 375, 667, null);
    await p.evaluate(([k, v]) => localStorage.setItem(k, v), [L.CHIAVE, grezzo]); await p.reload(); await L.lento(p);
    const vecchio = JSON.parse(grezzo);
    const riprendi = p.getByRole('button', { name: 'Riprendi' });
    const ok = { riprendi: await riprendi.count() === 1 };
    if (ok.riprendi) { await riprendi.click(); await L.lento(p); await p.waitForTimeout(300); }
    const visto = { scena: await L.scenaDi(p), chiamata: await p.evaluate(() => document.querySelector('[data-messaggio]')?.dataset.messaggio ?? null), presenze: await p.locator('[data-presenza]').count(), testo: await p.evaluate(() => document.querySelector('.scena')?.innerText ?? ''), azioni: await p.evaluate(() => [...document.querySelectorAll('.scena [data-azione]')].map((x) => x.dataset.azione)) };
    ok.scena = visto.scena === rif.visto.scena; ok.chiamata = visto.chiamata === rif.visto.chiamata; ok.testoUguale = visto.testo === rif.visto.testo; ok.presenze = visto.presenze === rif.visto.presenze;
    ok.azioni = JSON.stringify(visto.azioni) === JSON.stringify(rif.visto.azioni);
    // salvataggio dopo il caricamento: tutto ciò che c'era c'è ancora
    const nuovo = await L.stato(p), mancano = [];
    const conf = (a, b, via) => { if (b === undefined) return; if (typeof b === 'object' && b !== null) for (const k of Object.keys(b)) conf(a?.[k], b[k], `${via}.${k}`); else if (a !== b) mancano.push(`${via}: ${JSON.stringify(b)} → ${JSON.stringify(a)}`); };
    conf(nuovo, { ...vecchio, save_version: undefined, game_version: undefined, bozza: vecchio.bozza }, 'sal');
    ok.salvataggio_dopo = { save_version: nuovo.save_version, differenze: mancano, seme_in_corso: nuovo.in_corso?.seme ?? null, seme_sconfitta: nuovo.sconfitta?.seme ?? null };
    let resto = [], fine = null;
    if (sc.nome !== 'e05-schieramento' && sc.nome !== 'e01-sconfitta') { resto = await L.giocaEpisodio(p, m, { strategia: sc.strategia }); }
    if (sc.nome !== 'e05-schieramento') fine = await finale(p, sc.ep);
    ok.resto = JSON.stringify(ids(resto)) === JSON.stringify(rif.resto); ok.fine = JSON.stringify(fine) === JSON.stringify(rif.fine);
    esiti.push({ nome: sc.nome, ok, visto: { scena: visto.scena, chiamata: visto.chiamata }, rif: { scena: rif.visto.scena, chiamata: rif.visto.chiamata }, resto054: ids(resto), resto053: rif.resto, fine054: fine, fine053: rif.fine, errori: p.errori });
    console.log(`[riprendi] ${sc.nome}: ${JSON.stringify(ok)}${p.errori.length ? ' ERRORI ' + p.errori : ''}`);
    await p.close();
  }
}
if (modo !== 'crea') writeFileSync(`${dir}/esiti-054.json`, JSON.stringify(esiti, null, 1));
await A.chiudi();
