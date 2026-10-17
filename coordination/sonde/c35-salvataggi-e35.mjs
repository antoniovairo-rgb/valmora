// Sonda C-035 (sola lettura): salvataggi VERI della 0.34.0 dentro e35, prima e dopo «blocca_barca» (e «segui_barca» come
// controllo), ripresi nella 0.35.0, che in ondata 3 mostra «barca_ormeggiata» al posto di «barca_ritorno» dopo il blocco.
// A) build A (0.34.0): lo stato del motore A (bot attento, seme 1, barca forzata) fino al punto voluto si mette nel
//    salvataggio, «Riprendi»; dove indicato si tocca nell'interfaccia di A la risposta (così l'ultimo passo lo salva A);
//    si ricarica e si esporta il file col pulsante «esporta».
// B) build B (0.35.0): importa il file, «Riprendi», legge scena e chiamata aperta; poi va avanti nell'interfaccia (prima
//    opzione, «continua») fino al rapporto dell'ondata e annota le chiamate viste; infine finisce la partita col motore B
//    sullo stato salvato da B (nessuna eccezione, esito trovato = nessun blocco).
// Uso: node coordination/sonde/c35-salvataggi-e35.mjs <radice A> <radice B> <cartella salvataggi> <uscita.json> [foto]
import { createServer } from 'node:http'; import { readFileSync, existsSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const [RA, RB] = [resolve(process.argv[2]), resolve(process.argv[3])]; const DIR = process.argv[4]; const OUT = process.argv[5]; const FOTO = process.argv[6]; mkdirSync(DIR, { recursive: true }); if (FOTO) mkdirSync(FOTO, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const servi = async (R) => { const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); }); await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); return { srv, url: `http://127.0.0.1:${srv.address().port}/` }; };
const { chromium } = await import(`${RB}/node_modules/playwright-core/index.mjs`);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const CH = 'valmora-salvataggio';
async function pagina(url, errori) { const p = await b.newPage({ viewport: { width: 360, height: 760 }, hasTouch: true, reducedMotion: 'reduce', acceptDownloads: true }); p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 160)); }); p.on('pageerror', (e) => errori.push(e.message.slice(0, 160))); await p.goto(url); return p; }
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const quale = (p) => p.evaluate(() => { const aperta = [...document.querySelectorAll('[data-messaggio^="chiamata-"]')].filter((x) => !x.classList.contains('risposta')).at(-1); return { scena: document.querySelector('.scena')?.dataset.scena, chiamata: aperta?.dataset.messaggio ?? null,
  testo: aperta?.innerText.replace(/\s+/g, ' ').slice(0, 300) ?? null, opzioni: [...document.querySelectorAll('[data-opzione]')].map((x) => x.dataset.opzione), salvato: (() => { try { const s = JSON.parse(localStorage.getItem('valmora-salvataggio')).in_corso; return s ? { ondata: s.ondata, risposte: s.risposte, scelte: s.scelte.map((x) => `${x.ondata}:${x.chiamata}/${x.opzione}`) } : null; } catch { return 'illeggibile'; } })() }; });

const carica = async (R) => { const M = await import(`${R}/src/logica/missione.ts`); const Bt = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
  const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`); const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`);
  const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
  return { M, Bt, creaCaso, dich, missioni, v0, salvataggioTutti, m: missioni.find((x) => x.id === 'e35') }; };
const A = await carica(RA); const B = await carica(RB);

// Punti: ondata in cui fermarsi, chiamate già risposte nel motore (in ordine; le altre dell'ondata restano aperte),
// risposta da toccare nell'interfaccia di A prima di esportare.
const PUNTI = [
  { nome: 'o1-barca_porto-prima', barca: 'blocca_barca', ondata: 1, fino: 'barca_porto' },
  { nome: 'o1-dopo-blocca_barca', barca: 'blocca_barca', ondata: 1, fino: 'barca_porto', tocca: 'blocca_barca' },
  { nome: 'o2-blocca', barca: 'blocca_barca', ondata: 2, fino: 'dirette' },
  { nome: 'o3-blocca-su-barca_ritorno', barca: 'blocca_barca', ondata: 3, fino: 'barca_ritorno' },
  { nome: 'o3-blocca-dopo-cerca_scatoloni', barca: 'blocca_barca', ondata: 3, fino: 'barca_ritorno', tocca: 'cerca_scatoloni' },
  { nome: 'o4-blocca-dopo-barca_ritorno', barca: 'blocca_barca', ondata: 4, fino: 'posto_prenotato', o3: 'cerca_scatoloni' },
  { nome: 'o2-segui', barca: 'segui_barca', ondata: 2, fino: 'dirette' },
  { nome: 'o3-segui-su-barca_ritorno', barca: 'segui_barca', ondata: 3, fino: 'barca_ritorno' },
];
const statoA = (pt) => { const { M, Bt, creaCaso, dich, m, v0 } = A; const caso = creaCaso(1); const g = Bt.attenta(caso, dich); let s = M.iniziaMissione(m, v0, dich);
  const sc1 = (c) => (c.id === 'barca_porto' ? pt.barca : c.id === 'barca_ritorno' && pt.o3 ? pt.o3 : g.scegli(m, s, c));
  while (s.ondata < pt.ondata) { s = M.schiera(m, s, g.schiera(m, s)); for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, sc1(c), dich); s = M.chiudiOndata(m, s, dich); }
  s = M.schiera(m, s, g.schiera(m, s));
  for (let c = M.chiamateAperte(m, s)[0]; c && c.id !== pt.fino; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, sc1(c), dich);
  return s; };

const SA = await servi(RA.replace(/\/$/, '')); const errA = []; const pa = await pagina(SA.url, errA); const ris = [];
for (const pt of PUNTI) {
  const r = { punto: pt.nome };
  try {
    const s = statoA(pt);
    await pa.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v); }, [CH, JSON.stringify({ ...A.salvataggioTutti(A.missioni, A.v0), in_corso: s })]); await pa.reload(); await sc(pa, 'titolo');
    await pa.getByRole('button', { name: 'Riprendi' }).click(); await sc(pa, 'chiamata').catch(() => {}); await pa.waitForTimeout(500);
    if (pt.tocca) { await pa.locator(`[data-opzione="${pt.tocca}"]`).tap(); await pa.waitForTimeout(800); await pa.locator('[data-azione="continua"]').tap().catch(() => {}); await pa.waitForTimeout(900); }
    r.a = await quale(pa); if (FOTO) await pa.screenshot({ path: join(FOTO, `A-${pt.nome}.jpg`), type: 'jpeg', quality: 75 });
    await pa.reload(); await sc(pa, 'titolo');
    const [scarico] = await Promise.all([pa.waitForEvent('download'), pa.click('[data-azione="esporta"]')]); r.file = join(DIR, `0.34.0-e35-${pt.nome}.json`); copyFileSync(await scarico.path(), r.file);
    r.versioneFile = JSON.parse(readFileSync(r.file, 'utf8')).versione ?? JSON.parse(readFileSync(r.file, 'utf8')).SAVE_VERSION ?? Object.keys(JSON.parse(readFileSync(r.file, 'utf8'))).join(',');
  } catch (e) { r.erroreA = e.message.slice(0, 200); }
  ris.push(r);
}
await pa.close(); SA.srv.close();

const SB = await servi(RB); const errB = []; const pb = await pagina(SB.url, errB);
for (const r of ris) {
  if (!r.file) continue;
  try {
    await pb.evaluate(() => localStorage.clear()); await pb.reload(); await sc(pb, 'titolo');
    await pb.setInputFiles('[data-importa]', r.file); await pb.waitForTimeout(800); r.erroreImporta = await pb.locator('[data-errore-importa]').count();
    await pb.reload(); await sc(pb, 'titolo'); await pb.getByRole('button', { name: 'Riprendi' }).click(); await sc(pb, 'chiamata').catch(() => {}); await pb.waitForTimeout(600);
    r.b = await quale(pb); if (FOTO) await pb.screenshot({ path: join(FOTO, `B-${r.punto}.jpg`), type: 'jpeg', quality: 75 });
    r.stessaChiamata = r.b.chiamata === r.a?.chiamata;
    // avanti nell'interfaccia di B fino a fine ondata: prima opzione, «continua»
    r.viste = [];
    for (let i = 0; i < 8; i++) {
      const q = await quale(pb); if (q.scena !== 'chiamata' || !q.opzioni.length) { r.fineGiro = q.scena; break; }
      r.viste.push(`${q.chiamata} [${q.opzioni.join(',')}] «${q.testo?.slice(0, 120)}»`);
      if (FOTO && i === 0) await pb.screenshot({ path: join(FOTO, `B-${r.punto}-avanti.jpg`), type: 'jpeg', quality: 75 });
      await pb.locator('[data-opzione]').first().tap(); await pb.waitForTimeout(700); await pb.locator('[data-azione="continua"]').tap().catch(() => {}); await pb.waitForTimeout(900);
    }
    // fine partita col motore B sullo stato salvato da B
    const sv = await pb.evaluate(() => JSON.parse(localStorage.getItem('valmora-salvataggio')).in_corso);
    const { M, Bt, creaCaso, dich, m } = B; let s = sv; const g = Bt.attenta(creaCaso(1), dich);
    try {
      if (s && !M.missioneFinita(m, s)) {
        if (!s.disposizione) s = M.schiera(m, s, g.schiera(m, s));
        for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich);
        s = M.chiudiOndata(m, s, dich);
        while (!M.missioneFinita(m, s)) { s = M.schiera(m, s, g.schiera(m, s)); for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = M.chiudiOndata(m, s, dich); }
      }
      r.fineMotoreB = s ? M.concludiMissione(m, s, dich).esito.id : '(nessuna partita in corso)';
      r.scelteFinali = s?.scelte?.filter((x) => /barca/.test(x.chiamata)).map((x) => `${x.ondata}:${x.chiamata}/${x.opzione}`);
    } catch (e) { r.bloccoMotoreB = e.message.slice(0, 200); }
    r.ok = !r.erroreImporta && r.b.scena === r.a?.scena && !r.bloccoMotoreB;
  } catch (e) { r.erroreB = e.message.slice(0, 200); r.ok = false; }
  console.log(`${r.punto}: ${r.ok ? 'ok' : 'NO'} A ${r.a?.scena}/${r.a?.chiamata} → B ${r.b?.scena}/${r.b?.chiamata} · viste ${JSON.stringify(r.viste)} · fine ${r.fineGiro} · motore B ${r.fineMotoreB ?? r.bloccoMotoreB} ${JSON.stringify(r.scelteFinali)}`);
}
await b.close(); SB.srv.close(); writeFileSync(OUT, JSON.stringify({ ris, errA, errB }, null, 1));
console.log(`ripresi ${ris.filter((r) => r.ok).length}/${ris.length}; errori di console A ${errA.length}, B ${errB.length}`, [...new Set([...errA, ...errB])].slice(0, 5));
