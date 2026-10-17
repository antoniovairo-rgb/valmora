// Sonda C-035: foto prima (build A, 0.34.0) e dopo (build B, 0.35.0) delle schermate che la 0.35.0 cambia, a più
// finestre, con gli asset veri. Lo stato del motore di ciascuna build (bot attento, seme 1, scelte forzate) si mette
// nel salvataggio, «Riprendi», si attende la scena e si fotografa; si annotano chiamata aperta, opzioni e testo.
//  e02 o3 caldo_casa dopo mediatore_corteo · e35 o3 chiamata delle banchine dopo blocca_barca e dopo segui_barca ·
//  e21 o4 pullman21 · e21 o1 schieramento con la «i» aperta.
// Uso: [MISURE=360x760,…] node coordination/sonde/c35-foto-novita.mjs <radice A> <radice B> <cartella foto> <uscita.json>
import { createServer } from 'node:http'; import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const [RA, RB] = [resolve(process.argv[2]), resolve(process.argv[3])]; const DIR = process.argv[4]; const OUT = process.argv[5]; mkdirSync(DIR, { recursive: true });
const MISURE = (process.env.MISURE ?? '360x760,375x667,412x915,1366x768').split(',').map((m) => m.split('x').map(Number));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const servi = async (R) => { const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); }); await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); return { srv, url: `http://127.0.0.1:${srv.address().port}/` }; };
const { chromium } = await import(`${RB}/node_modules/playwright-core/index.mjs`);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const carica = async (R) => { const M = await import(`${R}/src/logica/missione.ts`); const Bt = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
  const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
  const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
  return { M, Bt, creaCaso, dich, missioni, v0, salvataggioTutti }; };
const CASI = [
  { nome: 'e02-o3-caldo_casa', ep: 'e02', ondata: 3, fino: 'caldo_casa', forza: { corteo_viale: 'mediatore_corteo' } },
  { nome: 'e35-o3-banchine-blocca', ep: 'e35', ondata: 3, fino: ['barca_ritorno', 'barca_ormeggiata'], forza: { barca_porto: 'blocca_barca' } },
  { nome: 'e35-o3-banchine-segui', ep: 'e35', ondata: 3, fino: ['barca_ritorno', 'barca_ormeggiata'], forza: { barca_porto: 'segui_barca' } },
  { nome: 'e21-o4-pullman21', ep: 'e21', ondata: 4, fino: 'pullman21', forza: {} },
  { nome: 'e21-o1-info', ep: 'e21', ondata: 1, schieramento: true, forza: {} },
];
const stato = (X, c) => { const { M, Bt, creaCaso, dich, missioni, v0 } = X; const m = missioni.find((x) => x.id === c.ep); const g = Bt.attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v0, dich);
  const sc1 = (ch) => (c.forza[ch.id] && M.opzioniValide(ch, s, m).some((o) => o.id === c.forza[ch.id]) ? c.forza[ch.id] : g.scegli(m, s, ch));
  while (s.ondata < c.ondata) { s = M.schiera(m, s, g.schiera(m, s)); for (let ch = M.chiamateAperte(m, s)[0]; ch; ch = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, ch.id, sc1(ch), dich); s = M.chiudiOndata(m, s, dich); }
  if (c.schieramento) return s;
  s = M.schiera(m, s, g.schiera(m, s)); const fino = [c.fino].flat();
  for (let ch = M.chiamateAperte(m, s)[0]; ch && !fino.includes(ch.id); ch = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, ch.id, sc1(ch), dich);
  return s; };
const ris = []; const errori = [];
for (const [nomeB, R] of [['034', RA], ['035', RB]]) {
  const X = await carica(R); const S = await servi(R);
  for (const [w, h] of MISURE) {
    const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, reducedMotion: 'reduce' }); p.on('pageerror', (e) => errori.push(`${nomeB} ${w}: ${e.message.slice(0, 160)}`)); p.on('console', (x) => { if (x.type() === 'error') errori.push(`${nomeB} ${w}: ${x.text().slice(0, 160)}`); });
    await p.goto(S.url);
    for (const c of CASI) {
      const r = { build: nomeB, misura: `${w}x${h}`, caso: c.nome };
      try {
        const s = stato(X, c);
        await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v); }, ['valmora-salvataggio', JSON.stringify({ ...X.salvataggioTutti(X.missioni, X.v0), in_corso: s })]); await p.reload(); await sc(p, 'titolo');
        await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, c.schieramento ? 'schieramento' : 'chiamata'); await p.waitForTimeout(700);
        if (c.schieramento) { await p.click('[data-azione="info-ondata"]'); await p.waitForTimeout(500); }
        Object.assign(r, await p.evaluate(() => { const a = [...document.querySelectorAll('[data-messaggio^="chiamata-"]')].at(-1); return { chiamata: a?.dataset.messaggio ?? null, testo: a?.innerText.replace(/\s+/g, ' ').slice(0, 200) ?? null,
          opzioni: [...document.querySelectorAll('[data-opzione]')].map((x) => `${x.dataset.opzione}: ${x.innerText.replace(/\s+/g, ' ').slice(0, 160)}`), info: document.querySelector('.ondata-info, [data-info-ondata], .info-ondata')?.innerText.replace(/\s+/g, ' ') ?? (document.querySelector('main')?.innerText.match(/(Inizio serata[^\n]*)/)?.[1] ?? null),
          oriz: document.documentElement.scrollWidth > innerWidth ? 1 : 0 }; }));
        r.foto = `${c.nome}-${w}x${h}-${nomeB}.jpg`; await p.screenshot({ path: join(DIR, r.foto), type: 'jpeg', quality: 78, fullPage: true });
      } catch (e) { r.errore = e.message.slice(0, 200); }
      ris.push(r); console.log(JSON.stringify(r));
    }
    await p.close();
  }
  S.srv.close();
}
await b.close(); writeFileSync(OUT, JSON.stringify({ ris, errori }, null, 1)); console.log(`casi ${ris.length}, errori di pagina/console ${errori.length}`, errori.slice(0, 5));
