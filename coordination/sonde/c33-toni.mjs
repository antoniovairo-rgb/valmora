// Sonda C-033 (sola lettura): PO-059 / D-133, espressioni di fine ondata. Due parti.
// A) motore: ogni strategia del bot × semi 1…N × 36 episodi; a ogni fine ondata il tono atteso (livello più alto della
//    tensione a fine ondata: ≤1 calmo, 2-3 teso, ≥4 critico, src/resa/espressioni.ts) incrociato con com'è andata l'ondata:
//    settori scoperti (degenerati), premio di fiducia, picco della tensione durante l'ondata.
// B) interfaccia (build dist/): per strategie × semi 1…NUI, il rapporto di ogni ondata ripreso da un salvataggio
//    (in_corso dopo chiudiOndata, rapporto_aperto = n, genere alternato m/f): data-tono, nome della vignetta, nascosta o no,
//    espressione di protagonista e vice (bocca, sopracciglia, braccia), contro il tono atteso; foto di un caso per tono e genere.
// Uso: [N=200] [NUI=2] [W=360 H=760] [ROSSI=C96P01] [SOLO_A=1] node coordination/sonde/c33-toni.mjs <radice> <uscita.json> [foto]
import { createServer } from 'node:http'; import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const OUT = process.argv[3] ?? 'c33-toni.json'; const FOTO = process.argv[4]; if (FOTO) mkdirSync(FOTO, { recursive: true });
const N = Number(process.env.N ?? 200), NUI = Number(process.env.NUI ?? 2), W = Number(process.env.W ?? 360), H = Number(process.env.H ?? { 360: 760, 375: 667, 412: 915 }[W] ?? 768);
const ROSSI = (process.env.ROSSI ?? '').split(',').filter(Boolean);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`); const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
const lv = (t) => (t <= 0 ? 0 : Math.min(5, Math.ceil(t / 2))); const tonoDi = (m) => (m <= 1 ? 'calmo' : m <= 3 ? 'teso' : 'critico');
const STRAT = Object.keys(B.STRATEGIE);
const fineOndate = (m, strat, seme, cb) => { const g = B.STRATEGIE[strat](creaCaso(seme), dich); let s = M.iniziaMissione(m, v0, dich);
  while (!M.missioneFinita(m, s)) { s = M.schiera(m, s, g.schiera(m, s)); for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = M.chiudiOndata(m, s, dich); cb(s, s.rapporti.at(-1)); } };
// A) motore
const A = { tono: {}, perStrat: {}, incroci: { scopertoCalmo: 0, scopertoTeso: 0, scopertoCritico: 0, premioPiuCritico: 0, premioPiuCalmo: 0, piccoCriticoFinaleCalmo: 0, piccoCriticoFinaleTeso: 0, nessunoScopertoCritico: 0, degeneratoCalmo: 0, degeneratoTeso: 0, degeneratoCritico: 0 }, esempi: {}, totale: 0 };
for (const strat of STRAT) for (let seme = 1; seme <= N; seme++) for (const m of missioni) fineOndate(m, strat, seme, (s, r) => {
  const mx = Math.max(0, ...m.mappa.settori.map((x) => lv(r.tensione[x.id] ?? 0))), pk = Math.max(0, ...m.mappa.settori.map((x) => lv(r.picco?.[x.id] ?? 0)));
  const sc = Object.values(r.scoperto).filter((v) => v > 0).length, t = tonoDi(mx); A.totale++; A.tono[t] = (A.tono[t] ?? 0) + 1; (A.perStrat[strat] ??= {})[t] = (A.perStrat[strat][t] ?? 0) + 1;
  const k = (n) => { A.incroci[n]++; if (!A.esempi[n]) A.esempi[n] = `${m.id} o${r.n} ${strat} seme ${seme}: livelli fine ${JSON.stringify(Object.fromEntries(m.mappa.settori.map((x) => [x.id, lv(r.tensione[x.id] ?? 0)])))} picco ${pk} scoperti ${sc} fiducia ${r.fiducia ?? 0}`; };
  if (sc && t === 'calmo') k('scopertoCalmo'); if (sc && t === 'teso') k('scopertoTeso'); if (sc && t === 'critico') k('scopertoCritico'); if (!sc && t === 'critico') k('nessunoScopertoCritico');
  if ((r.fiducia ?? 0) > 0 && t === 'critico') k('premioPiuCritico'); if ((r.fiducia ?? 0) > 0 && t === 'calmo') k('premioPiuCalmo');
  if ((r.fiducia ?? 0) < 0) k(t === 'calmo' ? 'degeneratoCalmo' : t === 'teso' ? 'degeneratoTeso' : 'degeneratoCritico');
  if (pk >= 4 && t === 'calmo') k('piccoCriticoFinaleCalmo'); if (pk >= 4 && t === 'teso') k('piccoCriticoFinaleTeso');
});
console.log(`A) motore: ${STRAT.join(', ')} × semi 1…${N} × ${missioni.length} episodi: ${A.totale} fini d'ondata; toni ${JSON.stringify(A.tono)}`);
for (const s of STRAT) console.log(`  ${s}: ${JSON.stringify(A.perStrat[s])}`);
console.log(`  incroci ${JSON.stringify(A.incroci)}`); for (const [k, v] of Object.entries(A.esempi)) console.log(`  es. ${k}: ${v}`);
const RIS = []; const errori = [];
if (process.env.SOLO_A !== '1') {
  const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
  const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
  await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
  const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: W, height: H }, reducedMotion: 'reduce' });
  if (ROSSI.length) await p.addInitScript((r) => { for (const x of r) globalThis[`__NO_${x}`] = true; }, ROSSI);
  p.on('pageerror', (e) => errori.push(e.message.slice(0, 160))); p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 160)); });
  await p.goto(URL); const base = salvataggioTutti(missioni, v0); const fotoFatte = new Set(); let i = 0;
  const BOCCHE = { 'M-7 19 Q0 13 7 19': 'giu', 'M-6 17 L6 17': 'dritta', 'M-7 15 Q0 22 7 15': 'su' };
  for (const strat of STRAT) for (let seme = 1; seme <= NUI; seme++) for (const m of missioni) {
    const stati = []; fineOndate(m, strat, seme, (s, r) => stati.push([s, r])); 
    for (const [s, r] of stati) {
      const genere = i++ % 2 ? 'f' : 'm'; const atteso = tonoDi(Math.max(0, ...m.mappa.settori.map((x) => lv(r.tensione[x.id] ?? 0))));
      await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify({ ...base, genere, in_corso: s, rapporto_aperto: r.n }));
      await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click();
      const ok = await p.waitForFunction(() => { const x = document.querySelectorAll('.scena'); return x.length === 1 && x[0].dataset.scena === 'rapporto' && getComputedStyle(x[0]).opacity === '1'; }, null, { timeout: 8000 }).then(() => true, () => false);
      await p.waitForTimeout(120);
      const v = await p.evaluate((BOCCHE) => { const c = document.querySelector('.scena [data-tono]'), svg = c?.querySelector('[data-vignetta]');
        const bocche = [...(svg?.querySelectorAll('path') ?? [])].map((x) => BOCCHE[x.getAttribute('d')]).filter(Boolean);
        const sopr = [...(svg?.querySelectorAll('[data-sopracciglia]') ?? [])].map((x) => x.dataset.sopracciglia || '-');
        const g = [...(svg?.querySelectorAll('g[transform^="translate"]') ?? [])]; const braccia = g.map((x) => x.querySelector(':scope > [data-braccia]')?.dataset.braccia ?? '-');
        const capelli = svg ? (svg.innerHTML.match(/v-capelli|lunghi/g) ?? []).length : 0; const r = svg?.getBoundingClientRect();
        return { tono: c?.dataset.tono ?? null, vignetta: svg?.dataset.vignetta ?? null, nascosta: !!svg?.hasAttribute('data-nascosta'), bocche, sopr, braccia, alt: r ? Math.round(r.height) : 0,
          scorre: document.documentElement.scrollWidth > innerWidth, titolo: svg?.querySelector('title')?.textContent ?? svg?.getAttribute('aria-label') ?? '' }; }, BOCCHE);
      const x = { strat, seme, ep: m.id, n: r.n, genere, atteso, ok, ...v }; RIS.push(x);
      const chiave = `${atteso}-${genere}`;
      if (FOTO && ok && !v.nascosta && !fotoFatte.has(chiave)) { fotoFatte.add(chiave); await p.screenshot({ path: `${FOTO}/${W}x${H}${ROSSI.length ? '-rosso' : ''}-${chiave}-${m.id}-o${r.n}.png` }); }
    }
  }
  await b.close(); srv.close();
  const conta = (f) => RIS.filter(f).length;
  console.log(`B) interfaccia ${W}×${H}: rapporti ${RIS.length}, aperti ${conta((x) => x.ok)}, con vignetta ${conta((x) => x.tono)}, nascoste ${conta((x) => x.nascosta)}, scorrimento ${conta((x) => x.scorre)}`);
  console.log(`  data-tono ≠ atteso ${conta((x) => x.tono && x.tono !== x.atteso)}; vignetta ≠ ondata-<atteso> ${conta((x) => x.tono && x.vignetta !== `ondata-${x.atteso}`)}`);
  const espr = {}; for (const x of RIS.filter((x) => x.tono)) { const k = `${x.tono}`; (espr[k] ??= new Set()).add(JSON.stringify({ bocche: x.bocche, sopr: x.sopr, braccia: x.braccia })); }
  for (const [k, v] of Object.entries(espr)) console.log(`  espressioni viste con tono ${k}: ${[...v].join(' | ')}`);
  const perT = {}; for (const x of RIS) { const k = `${x.atteso}`; perT[k] ??= { n: 0, nascoste: 0 }; perT[k].n++; if (x.nascosta) perT[k].nascoste++; } console.log(`  per tono atteso ${JSON.stringify(perT)}`);
  const perEp = {}; for (const x of RIS.filter((x) => x.nascosta)) perEp[x.ep] = (perEp[x.ep] ?? 0) + 1; console.log(`  nascoste per episodio ${JSON.stringify(perEp)}`);
  for (const x of RIS.filter((x) => x.tono && x.tono !== x.atteso).slice(0, 10)) console.log(`  DIVERSO ${x.ep} o${x.n} ${x.strat} ${x.seme}: ${x.tono} contro ${x.atteso}`);
}
writeFileSync(OUT, JSON.stringify({ A, RIS, errori })); console.log(`errori ${errori.length}`, errori.slice(0, 5));
