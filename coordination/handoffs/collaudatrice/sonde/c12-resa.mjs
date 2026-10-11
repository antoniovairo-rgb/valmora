// Sonda C-12: bilancio nel verbale (D-085), colori e stemmi dei club (D-086/D-088), picco nel rapporto (C09-01). Solo lettura.
// Uso: SPENTI=… node coordination/handoffs/collaudatrice/sonde/c12-resa.mjs <radice con dist/> <cartella foto> [larghezze] [partite per episodio]
import { createServer } from 'node:http'; import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
const R = resolve(process.argv[2]); const FOTO = resolve(process.argv[3]); const LARG = (process.argv[4] ?? '360,375,412').split(',').map(Number); const PART = Number(process.argv[5] ?? 4); mkdirSync(FOTO, { recursive: true });
const SPENTI = (process.env.SPENTI ?? '').split(',').filter(Boolean);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { variabiliIniziali } = await import(`${R}/src/logica/condizioni.ts`); const E = await import(`${R}/src/logica/episodi.ts`); const { SAVE_VERSION } = await import(`${R}/src/salvataggi/salvataggio.ts`);
const { bilancio } = await import(`${R}/src/logica/bilancio.ts`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m).sort((a, b) => a.episodio - b.episodio);
const club = new Map(Object.entries(dati).filter(([k]) => k.startsWith('club/')).map(([, c]) => [c.id, c]));
const testi = Object.assign({}, ...readdirSync(join(R, 'data/testi/it')).map((f) => JSON.parse(readFileSync(join(R, 'data/testi/it', f), 'utf8'))));
const t = (k) => testi[String(k).replace('testi:', '')] ?? `[[${k}]]`;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const BASE = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const out = (id, larg, cosa, esito) => console.log(`${id} · ${larg}px · ${cosa} → ${esito}`);
console.log(`interruttori rossi: ${SPENTI.join(',') || 'nessuno'}`);

function salvataggioFino(fino) {
  let v = variabiliIniziali(dich.values()); let reg = {}; const concluse = [];
  for (const m of missioni) { if (m.episodio >= fino) break; const prima = v; const r = M.giocaMissione(m, v, dich, B.equilibrata(creaCaso(1), dich)); const ris = E.valutaEpisodio(m, r);
    reg = E.registra(reg, m.id, prima, ris, r.variabili).registro; v = r.variabili; concluse.push(m.id); }
  return { save_version: SAVE_VERSION, game_version: 'collaudo', seme: 1, caso: 1, variabili: v, missioni_concluse: concluse, episodi: reg, genere: 'm', rapporto_aperto: null, in_corso: null };
}
// Piano misto: schieramento casuale o attento (alternati) e risposte casuali, dal seme; il motore dà rapporti, esito e bilancio attesi.
function piano(m, v, seme) {
  const caso = creaCaso(`c12:${m.id}:${seme}`); const cas = B.casuale(caso, dich), att = B.attenta(caso, dich); const g = { schiera: seme % 2 ? cas.schiera : att.schiera, scegli: cas.scegli };
  let s = M.iniziaMissione(m, v, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  const esito = M.concludiMissione(m, s, dich); return { ond, esito, stelle: E.valutaEpisodio(m, esito).stelle, rapporti: s.rapporti };
}
const segno = (n) => (n > 0 ? `+${n}` : `−${Math.abs(n)}`);
const parole = (i) => i.tipo === 'credito' ? `${segno(i.valore)} credito` : i.tipo === 'riserva' ? `${segno(i.valore)} ${t(`risorsa.${i.dove}`)} di riserva` : `${segno(i.valore)} ${i.tipo} su ${t(`settore.${i.dove}`)}`;
const livello = (x) => (x <= 0 ? 0 : Math.min(5, Math.ceil(x / 2)));
const SIMB = { almeno: '≥', al_massimo: '≤', uguale: '=' };
function atteso(m, p) {
  const bl = bilancio(m, p.esito); const opz = (c, o) => m.ondate.flatMap((x) => x.chiamate ?? []).find((x) => x.id === c)?.opzioni.find((x) => x.id === o);
  const voce = (v) => `${t(opz(v.chiamata, v.opzione).testo)}|Ondata ${v.ondata} · ${v.impatti.map(parole).join(', ')}`;
  const lista = p.stelle >= 3 ? null : p.stelle === 2 ? bl.stelle.tre : bl.stelle.due;
  const dist = (q) => (typeof q.soglia === 'number' && typeof q.valore === 'number' ? Math.abs(q.soglia - q.valore) : Infinity);
  const manca = lista && lista.filter((q) => !q.ok).sort((a, c) => dist(a) - dist(c))[0];
  const stella = !lista ? 'Hai tutte e tre le stelle.' : manca ? (manca.confronto === 'altro' ? 'Serve un altro esito della serata.' : `${t(`var.${manca.var}`)} ${SIMB[manca.confronto]} ${manca.soglia}: hai ${manca.valore}`) : 'I numeri ci sono: la stella in più dipende da come finisce la serata.';
  return { aiuti: bl.aiuti.map(voce), pesi: bl.pesi.map(voce), scoperti: bl.scoperti.map((s) => `${s.ondata}:${s.settore}`), stella };
}
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 10000 });
const quale = (p) => p.evaluate(() => document.querySelector('.scena')?.dataset.scena);
async function pagina(larg, url, sal) {
  const p = await b.newPage({ viewport: { width: larg, height: 760 }, hasTouch: true, reducedMotion: 'reduce' });
  if (SPENTI.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, SPENTI);
  p.errori = []; p.on('pageerror', (e) => p.errori.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') p.errori.push(m.text()); });
  await p.goto(url); await p.evaluate((s) => { localStorage.clear(); if (s) localStorage.setItem('valmora-salvataggio', JSON.stringify(s)); }, sal ?? null); await p.reload(); return p;
}
const stemmi = (p) => p.evaluate(() => [...document.querySelectorAll('.scena [data-stemma]')].map((e) => `${e.dataset.stemma}:${e.dataset.forma}${e.querySelector('text') ? ':iniziali=' + e.querySelector('text').textContent : ''}`));
// Colore delle curve sui pixel: foto della mappa, poi conteggio dei pixel vicini al primario di ogni club attorno a ogni curva (Python/PIL).
async function coloriCurve(p, m, nome) {
  const file = join(FOTO, `${nome}-mappa.png`); await p.waitForFunction(() => document.querySelector('.mappa')?.dataset.pronta === 'si', null, { timeout: 10000 }).catch(() => {});
  await p.waitForTimeout(500); const box = await p.locator('.mappa').boundingBox(); await p.locator('.mappa').screenshot({ path: file });
  const punti = await p.evaluate(() => [...document.querySelectorAll('.mappa [data-settore]')].map((e) => { const r = e.querySelector('.settore-punto').getBoundingClientRect(); return [e.dataset.settore, r.x + r.width / 2, r.y + r.height / 2]; }));
  const curve = m.mappa.settori.filter((s) => s.club).map((s) => s.id); const prim = [...new Set(m.mappa.settori.filter((s) => s.club).map((s) => s.club))].map((c) => [c, club.get(c).colori.primario]);
  const args = JSON.stringify({ file, box, punti: punti.filter(([id]) => curve.includes(id)), prim });
  const py = `import json,sys\nfrom PIL import Image\na=json.loads(sys.argv[1]);im=Image.open(a['file']).convert('RGB');W,H=im.size;sx=W/a['box']['width'];sy=H/a['box']['height']\nh=lambda c:tuple(int(c[i:i+2],16) for i in (1,3,5))\nres={}\nfor sid,x,y in a['punti']:\n  cx=(x-a['box']['x'])*sx;cy=(y-a['box']['y'])*sy;cnt={c:0 for c,_ in a['prim']}\n  for dx in range(-70,71,2):\n    for dy in range(-70,71,2):\n      if dx*dx+dy*dy>70*70 or dx*dx+dy*dy<26*26: continue\n      px,py_=int(cx+dx*sx),int(cy+dy*sy)\n      if not(0<=px<W and 0<=py_<H): continue\n      r,g,bb=im.getpixel((px,py_))\n      for c,hx in a['prim']:\n        R,G,BB=h(hx)\n        if (r-R)**2+(g-G)**2+(bb-BB)**2<55**2: cnt[c]+=1\n  res[sid]=cnt\nprint(json.dumps(res))`;
  return JSON.parse(execFileSync('python3', ['-c', py, args], { encoding: 'utf8' }));
}
async function gioca(p, m, pl, larg, nome) {
  await sc(p, 'sala'); const stSala = await stemmi(p); const pix = await coloriCurve(p, m, `${larg}-${nome}`);
  await p.click('[data-azione="avanti"]'); await sc(p, 'briefing'); while (await p.locator('[data-azione="prossimo"]').count()) { await p.click('[data-azione="prossimo"]'); await p.waitForTimeout(50); } await p.click('[data-azione="inizia"]');
  const picchi = [];
  for (const [i, o] of pl.ond.entries()) {
    await sc(p, 'schieramento');
    for (const [r, ps] of Object.entries(o.d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); }
    await p.click('[data-azione="conferma"]');
    for (const [, op] of o.rs) { await sc(p, 'chiamata'); await p.locator(`[data-opzione="${op}"]`).scrollIntoViewIfNeeded(); await p.click(`[data-opzione="${op}"]`); await p.waitForTimeout(150); if ((await quale(p)) === 'risposta') await p.click('[data-azione="continua"]'); }
    await sc(p, 'chiusura'); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto');
    const vis = await p.evaluate(() => [...document.querySelectorAll('[data-picco]')].map((e) => e.dataset.picco).sort());
    const r = pl.rapporti[i]; const att = Object.keys(r.tensione).filter((k) => livello(r.picco?.[k] ?? 0) > livello(r.tensione[k])).sort();
    const valore = Object.keys(r.tensione).filter((k) => (r.picco?.[k] ?? 0) > r.tensione[k] && livello(r.picco[k]) === livello(r.tensione[k]));
    picchi.push({ n: i + 1, vis, att, nascosti: valore });
    await p.click('[data-azione="avanti"]');
  }
  await sc(p, 'verbale'); const stVerb = await stemmi(p);
  const ui = await p.evaluate(() => { const sez = (n) => [...document.querySelectorAll(`[data-sezione="${n}"] li[data-scelta]`)].map((li) => `${li.querySelector('span').textContent}|${li.querySelector('small').textContent}`);
    return { aiuti: sez('aiuti'), pesi: sez('pesi'), scoperti: [...document.querySelectorAll('[data-sezione="scoperti"] [data-scoperto]')].map((e) => e.dataset.scoperto), stella: document.querySelector('[data-sezione="stelle"] p')?.textContent, esito: document.querySelector('[data-esito]')?.dataset.esito }; });
  await p.screenshot({ path: join(FOTO, `${larg}-${nome}-verbale.png`), fullPage: true });
  return { ui, stSala, stVerb, pix, picchi };
}
const curveClub = (m) => m.mappa.settori.filter((s) => s.club).map((s) => `${s.id}=${s.club}`).join(', ');

for (const larg of LARG) {
  const conti = { partite: 0, bilancioOk: 0, diffs: [], picchiOk: 0, picchiTot: 0, nascosti: 0, picchiDiff: [] };
  for (const id of ['e01', 'e02', 'e03']) { const m = dati[`missioni/${id}.json`]; const sal = salvataggioFino(m.episodio);
    for (let k = 1; k <= PART; k++) {
      const pl = piano(m, sal.variabili, k + larg); const p = await pagina(larg, BASE, sal);
      await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta');
      await p.click(`[data-episodio="${id}"] .settore-punto`).catch(() => {}); await p.waitForTimeout(200); const stCitta = await stemmi(p);
      await p.click('[data-azione="avvia-episodio"]'); let g;
      try { g = await gioca(p, m, pl, larg, `${id}-${k}`); } catch (e) { out('ERRORE', larg, `${id} partita ${k}`, `${e.message.split('\n')[0]} in «${await quale(p)}»`); await p.close(); continue; }
      conti.partite++; const a = atteso(m, pl); const diff = [];
      for (const s of ['aiuti', 'pesi', 'scoperti']) if (JSON.stringify(a[s]) !== JSON.stringify(g.ui[s])) diff.push(`${s}: resa ${JSON.stringify(g.ui[s])} ≠ motore ${JSON.stringify(a[s])}`);
      if (a.stella !== g.ui.stella) diff.push(`stella: resa «${g.ui.stella}» ≠ atteso «${a.stella}»`);
      if (g.ui.esito !== pl.esito.esito.id) diff.push(`esito resa ${g.ui.esito} ≠ motore ${pl.esito.esito.id}`);
      if (diff.length) conti.diffs.push(`${id}#${k}: ${diff.join(' ; ')}`); else conti.bilancioOk++;
      for (const x of g.picchi) { conti.picchiTot++; if (JSON.stringify(x.vis) === JSON.stringify(x.att)) conti.picchiOk++; else conti.picchiDiff.push(`${id}#${k} ondata ${x.n}: resa ${JSON.stringify(x.vis)} motore ${JSON.stringify(x.att)}`); conti.nascosti += x.nascosti.length; }
      if (k === 1) out('CLUB', larg, `${id} (${curveClub(m)})`, `stemmi città ${JSON.stringify(stCitta)}; sala ${JSON.stringify(g.stSala)}; verbale ${JSON.stringify(g.stVerb)}; pixel vicini al primario per curva ${JSON.stringify(g.pix)}`);
      if (k === 1) out('BILANCIO-ESEMPIO', larg, `${id}#1 (${pl.esito.esito.id}, ${pl.stelle}★)`, JSON.stringify(g.ui));
      if (p.errori.length) out('ERRORI', larg, `${id}#${k}`, p.errori.slice(0, 2).join('; ')); await p.close();
    }
  }
  out('BILANCIO', larg, `partite ${conti.partite}`, `uguali al motore ${conti.bilancioOk}; differenze ${conti.diffs.length ? conti.diffs.slice(0, 4).join(' || ') : 'nessuna'}`);
  out('PICCO', larg, `rapporti ${conti.picchiTot}`, `uguali al motore (livello picco > livello finale) ${conti.picchiOk}; diversi ${conti.picchiDiff.length ? conti.picchiDiff.slice(0, 4).join(' || ') : 'nessuno'}; settori con picco > finale ma stesso colore (non mostrati) ${conti.nascosti}`);
  // abbozzi con club senza stemma: città e sala con ?bozze=1
  for (const [cid, c] of club) { if (c.stemma) continue; const m = missioni.find((x) => x.mappa.settori.some((s) => s.club === cid)); if (!m) { out('FALLBACK', larg, cid, 'nessuna missione lo usa'); continue; }
    const p = await pagina(larg, `${BASE}?bozze=1`, salvataggioFino(m.episodio)); await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta');
    if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) { await p.click(`[data-stagione="${m.stagione}"]`); await p.waitForTimeout(200); }
    await p.click(`[data-episodio="${m.id}"] .settore-punto`).catch(() => {}); await p.waitForTimeout(200); const sCitta = await stemmi(p);
    await p.click('[data-azione="avvia-episodio"]'); await sc(p, 'sala'); const sSala = await stemmi(p); const pix = await coloriCurve(p, m, `${larg}-${m.id}-${cid}`);
    await p.screenshot({ path: join(FOTO, `${larg}-${m.id}-sala.png`), fullPage: false });
    out('FALLBACK', larg, `${cid} in ${m.id} (${curveClub(m)})`, `città ${JSON.stringify(sCitta)}; sala ${JSON.stringify(sSala)}; pixel ${JSON.stringify(pix)}; errori ${p.errori.length ? p.errori.slice(0, 2).join('; ') : 'nessuno'}`); await p.close(); }
}
await b.close(); srv.close();
