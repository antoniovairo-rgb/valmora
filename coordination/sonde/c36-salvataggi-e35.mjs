// Sonda C-036 (sola lettura): salvataggi VERI di una versione A (0.34.0 o 0.35.0) fermi in TUTTI i punti di e35, nei due
// rami della barca (blocca_barca / segui_barca) e con le due risposte alla chiamata della barca in ondata 3, ripresi in B.
// Generalizza c35-salvataggi-e35.mjs. Punti per ogni ondata: «sala» (prima dello schieramento), «su <chiamata>» (chiamata
// aperta, nessun tocco) e «dopo <chiamata>» (risposta toccata nell'interfaccia di A, «continua»: l'ultimo passo lo salva A;
// dopo l'ultima chiamata è la chiusura dell'ondata). Poi file esportato col pulsante, importato in B, «Riprendi».
// In B: scena e chiamata, poi avanti nell'interfaccia fino a fine ondata, poi motore B fino a fine partita.
// Controlli: (1) mai le due chiamate della barca nella stessa partita; (2) dopo blocca_barca mai barca_ritorno nuova,
// dopo segui_barca mai barca_ormeggiata; (3) nessuna chiamata risposta due volte; (4) nessun blocco; (5) scena come in A
// (tranne il caso atteso «A su barca_ritorno nel ramo blocca» della 0.34.0, dove B corregge il racconto).
// Uso: node coordination/sonde/c36-salvataggi-e35.mjs <radice A> <radice B> <cartella salvataggi> <uscita.json> [foto] [filtro]
import { createServer } from 'node:http'; import { readFileSync, existsSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const [RA, RB] = [resolve(process.argv[2]), resolve(process.argv[3])]; const DIR = process.argv[4]; const OUT = process.argv[5]; const FOTO = process.argv[6] || ''; const FILTRO = process.argv[7] ? new RegExp(process.argv[7]) : null;
mkdirSync(DIR, { recursive: true }); if (FOTO) mkdirSync(FOTO, { recursive: true });
const VA = readFileSync(join(RA, 'src/versione.ts'), 'utf8').match(/GAME_VERSION = '([^']+)'/)[1]; const VB = readFileSync(join(RB, 'src/versione.ts'), 'utf8').match(/GAME_VERSION = '([^']+)'/)[1];
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const servi = async (R) => { const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); }); await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); return { srv, url: `http://127.0.0.1:${srv.address().port}/` }; };
const { chromium } = await import(`${RB}/node_modules/playwright-core/index.mjs`);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const CH = 'valmora-salvataggio';
async function pagina(url, errori) { const p = await b.newPage({ viewport: { width: 360, height: 760 }, hasTouch: true, reducedMotion: 'reduce', acceptDownloads: true }); p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 160)); }); p.on('pageerror', (e) => errori.push(e.message.slice(0, 160))); await p.goto(url); return p; }
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const stabile = (p) => p.waitForFunction(() => { const s = document.querySelectorAll('.scena'); return s.length === 1 && getComputedStyle(s[0]).opacity === '1'; }, null, { timeout: 15000 }).catch(() => {});
const quale = (p) => p.evaluate(() => { const aperta = [...document.querySelectorAll('[data-messaggio^="chiamata-"]')].filter((x) => !x.classList.contains('risposta')).at(-1); return { scena: document.querySelector('.scena')?.dataset.scena, chiamata: aperta?.dataset.messaggio ?? null,
  testata: (document.body.innerText.match(/ONDATA\s*\d+\/\d+[^\n]*CHIAMATA\s*\d+\/\d+|CHIAMATA\s*\d+\/\d+/i) ?? [null])[0],
  testo: aperta?.innerText.replace(/\s+/g, ' ').slice(0, 300) ?? null, opzioni: [...document.querySelectorAll('[data-opzione]')].map((x) => x.dataset.opzione), salvato: (() => { try { const s = JSON.parse(localStorage.getItem('valmora-salvataggio')).in_corso; return s ? { ondata: s.ondata, risposte: Object.keys(s.risposte), scelte: s.scelte.map((x) => `${x.ondata}:${x.chiamata}/${x.opzione}`) } : null; } catch { return 'illeggibile'; } })() }; });

const carica = async (R) => { const M = await import(`${R}/src/logica/missione.ts`); const Bt = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
  const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`); const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`);
  const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
  return { M, Bt, creaCaso, dich, missioni, v0, salvataggioTutti, m: missioni.find((x) => x.id === 'e35') }; };
const A = await carica(RA); const B = await carica(RB);
const BARCA3 = new Set(['barca_ritorno', 'barca_ormeggiata']);

// Scelta del motore A: barca_porto forzata; chiamata della barca in o3: opzione n. idx3 fra le valide; le altre dal bot attento.
const scelta = (M, m, s, c, g, varr) => { const val = M.opzioniValide(c, s, m).map((o) => o.id);
  if (c.id === 'barca_porto') return varr.barca; if (BARCA3.has(c.id)) return val[Math.min(varr.idx3, val.length - 1)]; return g.scegli(m, s, c); };
// Punti: si gioca col motore A tutta la partita annotando, per ogni ondata, la sala e ogni chiamata.
const punti = []; for (const barca of ['blocca_barca', 'segui_barca']) for (const idx3 of [0, 1]) {
  const { M, Bt, creaCaso, dich, m, v0 } = A; const g = Bt.attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v0, dich); const varr = { barca, idx3 };
  while (!M.missioneFinita(m, s)) { const w = s.ondata; const tutti = idx3 === 0 || w >= 3; if (tutti) punti.push({ varr, ondata: w, fino: null, nome: `${barca}-o3x${idx3}-o${w}-sala` });
    s = M.schiera(m, s, g.schiera(m, s)); let dopoBarca = false;
    for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = scelta(M, m, s, c, g, varr);
      if (tutti && (idx3 === 0 || w > 3 || dopoBarca || BARCA3.has(c.id))) { if (!(idx3 === 1 && w === 3 && BARCA3.has(c.id))) punti.push({ varr, ondata: w, fino: c.id, nome: `${barca}-o3x${idx3}-o${w}-su-${c.id}` }); punti.push({ varr, ondata: w, fino: c.id, tocca: o, nome: `${barca}-o3x${idx3}-o${w}-dopo-${c.id}-${o}` }); }
      if (BARCA3.has(c.id)) dopoBarca = true; s = M.rispondi(m, s, c.id, o, dich); }
    s = M.chiudiOndata(m, s, dich); } }
const statoA = (pt) => { const { M, Bt, creaCaso, dich, m, v0 } = A; const g = Bt.attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v0, dich);
  const tutta = () => { for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, scelta(M, m, s, c, g, pt.varr), dich); };
  while (s.ondata < pt.ondata) { s = M.schiera(m, s, g.schiera(m, s)); tutta(); s = M.chiudiOndata(m, s, dich); }
  if (pt.fino === null) return { s, tocco: null };
  s = M.schiera(m, s, g.schiera(m, s));
  for (let c = M.chiamateAperte(m, s)[0]; c && c.id !== pt.fino; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, scelta(M, m, s, c, g, pt.varr), dich);
  return { s, tocco: pt.tocca ?? null }; };
const lista = FILTRO ? punti.filter((p) => FILTRO.test(p.nome)) : punti;
console.log(`A ${VA} → B ${VB}: ${lista.length} punti`);

const SA = await servi(RA); const errA = []; const pa = await pagina(SA.url, errA); const ris = [];
for (const pt of lista) {
  const r = { punto: pt.nome };
  try {
    const { s, tocco } = statoA(pt);
    await pa.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v); }, [CH, JSON.stringify({ ...A.salvataggioTutti(A.missioni, A.v0), in_corso: s })]); await pa.reload(); await sc(pa, 'titolo');
    await pa.getByRole('button', { name: 'Riprendi' }).click(); await pa.waitForTimeout(700); await stabile(pa);
    if (tocco) { await pa.locator(`[data-opzione="${tocco}"]`).tap({ timeout: 8000 }); await pa.waitForTimeout(800); await pa.locator('[data-azione="continua"]').tap({ timeout: 4000 }).catch(() => {}); await pa.waitForTimeout(900); await stabile(pa); }
    r.a = await quale(pa); if (FOTO) await pa.screenshot({ path: join(FOTO, `A${VA}-${pt.nome}.jpg`), type: 'jpeg', quality: 70 });
    await pa.reload(); await sc(pa, 'titolo');
    const [scarico] = await Promise.all([pa.waitForEvent('download'), pa.click('[data-azione="esporta"]')]); r.file = join(DIR, `${VA}-e35-${pt.nome}.json`); copyFileSync(await scarico.path(), r.file);
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
    await pb.reload(); await sc(pb, 'titolo'); await pb.getByRole('button', { name: 'Riprendi' }).click(); await pb.waitForTimeout(700); await stabile(pb);
    r.b = await quale(pb); if (FOTO) await pb.screenshot({ path: join(FOTO, `B${VB}-da${VA}-${r.punto}.jpg`), type: 'jpeg', quality: 70 });
    r.viste = [];
    for (let i = 0; i < 8; i++) {
      const q = await quale(pb); if (q.scena !== 'chiamata' || !q.opzioni.length) { r.fineGiro = q.scena; break; }
      r.viste.push(`${q.chiamata} ${q.testata ?? ''} [${q.opzioni.join(',')}]`);
      await pb.locator('[data-opzione]').first().tap(); await pb.waitForTimeout(700); await pb.locator('[data-azione="continua"]').tap({ timeout: 4000 }).catch(() => {}); await pb.waitForTimeout(900); await stabile(pb);
    }
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
      const sc2 = (s?.scelte ?? []).map((x) => `${x.ondata}:${x.chiamata}/${x.opzione}`); r.scelteBarca = sc2.filter((x) => /barca/.test(x));
      const ids = (s?.scelte ?? []).map((x) => `${x.ondata}:${x.chiamata}`); r.doppie = ids.filter((x, i) => ids.indexOf(x) !== i);
      const ha = (id) => r.scelteBarca.some((x) => x.includes(`:${id}/`)); r.dueBarche = ha('barca_ritorno') && ha('barca_ormeggiata');
      r.ramoSmentito = (r.scelteBarca.some((x) => x.includes('blocca_barca')) && ha('barca_ritorno') && !(r.a?.salvato?.scelte ?? []).some((x) => x.includes('barca_ritorno')))
        || (r.scelteBarca.some((x) => x.includes('segui_barca')) && ha('barca_ormeggiata'));
    } catch (e) { r.bloccoMotoreB = e.message.slice(0, 200); }
    r.attesoDiverso = VA === '0.34.0' && r.a?.chiamata === 'chiamata-barca_ritorno' && /blocca_barca/.test(r.punto) && r.b?.chiamata === 'chiamata-barca_ormeggiata';
    r.stessaScena = r.b.scena === r.a?.scena && (r.b.chiamata === r.a?.chiamata || r.attesoDiverso);
    r.ok = !r.erroreImporta && r.stessaScena && !r.bloccoMotoreB && !r.dueBarche && !r.ramoSmentito && !r.doppie.length;
  } catch (e) { r.erroreB = e.message.slice(0, 200); r.ok = false; }
  console.log(`${r.ok ? 'ok' : 'NO'} ${r.punto}: A ${r.a?.scena}/${r.a?.chiamata ?? '-'} → B ${r.b?.scena}/${r.b?.chiamata ?? '-'}${r.attesoDiverso ? ' (corretto)' : ''} · viste ${r.viste?.length} · fine ${r.fineGiro} · ${r.fineMotoreB ?? r.bloccoMotoreB} ${JSON.stringify(r.scelteBarca)}${r.dueBarche ? ' DUE-BARCHE' : ''}${r.ramoSmentito ? ' RAMO-SMENTITO' : ''}${r.doppie?.length ? ' DOPPIE ' + r.doppie : ''}${r.erroreA ? ' erroreA ' + r.erroreA : ''}${r.erroreB ? ' erroreB ' + r.erroreB : ''}`);
}
await b.close(); SB.srv.close(); writeFileSync(OUT, JSON.stringify({ VA, VB, ris, errA, errB }, null, 1));
console.log(`A ${VA} → B ${VB}: ripresi senza difetti ${ris.filter((r) => r.ok).length}/${ris.length}; errori di console A ${errA.length}, B ${errB.length}`, [...new Set([...errA, ...errB])].slice(0, 5));
