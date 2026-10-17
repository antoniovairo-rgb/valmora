// Sonda C-033 (sola lettura): D-136 / C28-14. Come c29-pastiglie.mjs (stati del bot attento all'inizio di ogni ondata,
// bozza con le unità nel salvataggio, a 360×760, 375×667, 412×915), più: posto delle unità (anche i nuovi destra-basso e
// sinistra-basso), nomi stretti su più righe (maxWidth scritto da etichette.ts, righe, testo che esce dal riquadro),
// tocchi di pastiglie di settori diversi sovrapposti o col centro sotto un altro tocco, pastiglie sopra i dischi altrui.
// Uso: [ROSSI=C94N01] node coordination/sonde/c33-pastiglie.mjs <radice con dist/> <uscita.json> [cartella foto]
import { createServer } from 'node:http'; import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const OUT = process.argv[3] ?? 'c33-pastiglie.json'; const FOTO = process.argv[4]; if (FOTO) mkdirSync(FOTO, { recursive: true });
const ROSSI = (process.env.ROSSI ?? '').split(',').filter(Boolean);
const MISURE = (process.env.MISURE ?? '360x760,375x667,412x915').split(',').map((x) => x.split('x').map(Number));
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { partenzeAttente, mappaSchieramento } = await import(`${R}/tools/foto-schieramenti.mjs`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const base = salvataggioTutti(missioni, v0); const stati = partenzeAttente(join(R, 'data')); const RIS = []; const errori = [];
const extra = (p) => p.evaluate(() => {
  const mappa = document.querySelector('.mappa:not(.citta)'); if (!mappa) return null; const m = mappa.getBoundingClientRect();
  const a = (A, B) => Math.max(0, Math.min(A.right, B.right) - Math.max(A.left, B.left)) * Math.max(0, Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top));
  const settori = [...mappa.querySelectorAll('[data-settore]')];
  const posti = {}; for (const s of settori) if (s.querySelector('.settore-unita')) posti[s.dataset.unita] = (posti[s.dataset.unita] ?? 0) + 1;
  const stretti = settori.map((s) => [s, s.querySelector('.settore-nome')]).filter(([, n]) => n && n.style.maxWidth).map(([s, n]) => {
    const lh = parseFloat(getComputedStyle(n).lineHeight) || 1, pad = parseFloat(getComputedStyle(n).paddingTop) + parseFloat(getComputedStyle(n).paddingBottom);
    return { settore: s.dataset.settore, nome: n.textContent, largo: n.style.maxWidth, righe: Math.round((n.clientHeight - pad) / lh), esce: n.scrollWidth > n.clientWidth + 0.5 };
  });
  const tutteRighe = settori.map((s) => s.querySelector('.settore-nome')).filter(Boolean).map((n) => { const lh = parseFloat(getComputedStyle(n).lineHeight) || 1, pad = parseFloat(getComputedStyle(n).paddingTop) + parseFloat(getComputedStyle(n).paddingBottom); return Math.round((n.clientHeight - pad) / lh); });
  const esconoTesti = settori.map((s) => s.querySelector('.settore-nome')).filter((n) => n && n.scrollWidth > n.clientWidth + 0.5).map((n) => n.textContent);
  const tocchi = settori.flatMap((s) => [...s.querySelectorAll('button.tocco-pastiglia')].filter((t) => t.getClientRects().length).map((t) => ({ s: s.dataset.settore, r: t.getBoundingClientRect(), id: t.dataset.presenza })));
  const toccoSuTocco = []; const centroSottoAltro = [];
  for (const [i, t] of tocchi.entries()) for (const u of tocchi.slice(i + 1)) if (t.s !== u.s && a(t.r, u.r) > 1) toccoSuTocco.push(`${t.s}/${t.id} × ${u.s}/${u.id} ${a(t.r, u.r).toFixed(0)} px²`);
  for (const t of tocchi) { const x = (t.r.left + t.r.right) / 2, y = (t.r.top + t.r.bottom) / 2; for (const u of tocchi) if (u.s !== t.s && x >= u.r.left && x <= u.r.right && y >= u.r.top && y <= u.r.bottom) centroSottoAltro.push(`${t.s}/${t.id} sotto ${u.s}/${u.id}`); }
  const dischi = settori.map((s) => [s.dataset.settore, s.querySelector('.settore-punto')?.getBoundingClientRect()]).filter(([, r]) => r);
  const suDischi = settori.flatMap((s) => [...s.querySelectorAll('.settore-unita .pastiglia')].filter((e) => e.getClientRects().length).flatMap((e) => dischi.filter(([id, r]) => id !== s.dataset.settore && a(e.getBoundingClientRect(), r) > 1).map(([id]) => `${s.dataset.settore} × disco ${id}`)));
  const nomiFuori = settori.map((s) => s.querySelector('.settore-nome')).filter((n) => n && n.getClientRects().length).filter((n) => { const r = n.getBoundingClientRect(); return r.left < m.left - 0.5 || r.right > m.right + 0.5 || r.top < m.top - 0.5 || r.bottom > m.bottom + 0.5; }).map((n) => n.textContent);
  // il testo vero dei nomi (Range sul testo), non il riquadro: con maxWidth stretto il testo può uscire dal riquadro
  const testoDi = (n) => { const rg = document.createRange(); rg.selectNodeContents(n); return [...rg.getClientRects()]; };
  const pastAll = settori.flatMap((s) => [...s.querySelectorAll('.settore-unita .pastiglia')].filter((e) => e.getClientRects().length).map((e) => [s.dataset.settore, e.textContent, e.getBoundingClientRect()]));
  const testoSu = settori.filter((s) => s.querySelector('.settore-nome')).flatMap((s) => { const n = s.querySelector('.settore-nome'), box = n.getBoundingClientRect();
    return testoDi(n).filter((t) => t.right > box.right + 0.5 || t.left < box.left - 0.5).flatMap((t) => [
      ...pastAll.filter(([, , r]) => a(t, r) > 1).map(([id, x, r]) => `testo «${n.textContent}» fuori riquadro × pastiglia «${x}» di ${id} ${a(t, r).toFixed(0)} px²`),
      ...settori.filter((o) => o !== s && o.querySelector('.settore-nome')).filter((o) => a(t, o.querySelector('.settore-nome').getBoundingClientRect()) > 1).map((o) => `testo «${n.textContent}» fuori riquadro × nome ${o.querySelector('.settore-nome').textContent}`),
      ...(t.right > m.right || t.left < m.left ? [`testo «${n.textContent}» fuori mappa`] : []) ]); });
  const fuoriPx = settori.map((s) => s.querySelector('.settore-nome')).filter(Boolean).map((n) => { const box = n.getBoundingClientRect(); const e = Math.max(0, ...testoDi(n).map((t) => Math.max(t.right - box.right, box.left - t.left))); return [n.textContent, +e.toFixed(1)]; }).filter(([, e]) => e > 0.5);
  // a chi sembrano appartenere le pastiglie: centro del gruppo di pastiglie, distanza dal disco del proprio settore contro
  // il disco più vicino di un altro settore (più vicino a un altro = gruppo ambiguo)
  const centro = (r) => [(r.left + r.right) / 2, (r.top + r.bottom) / 2];
  const ambigue = settori.filter((s) => s.querySelector('.settore-unita .pastiglia')).flatMap((s) => {
    const ps = [...s.querySelectorAll('.settore-unita .pastiglia')].filter((e) => e.getClientRects().length).map((e) => e.getBoundingClientRect()); if (!ps.length) return [];
    const u = { left: Math.min(...ps.map((r) => r.left)), right: Math.max(...ps.map((r) => r.right)), top: Math.min(...ps.map((r) => r.top)), bottom: Math.max(...ps.map((r) => r.bottom)) };
    const [cx, cy] = centro(u), dist = (r) => { const [x, y] = centro(r); return Math.hypot(x - cx, y - cy); };
    const mio = dist(s.querySelector('.settore-punto').getBoundingClientRect());
    const altri = dischi.filter(([id]) => id !== s.dataset.settore).map(([id, r]) => [id, dist(r)]).sort((a, b) => a[1] - b[1]);
    return altri.length && altri[0][1] < mio ? [`${s.dataset.settore} (${s.dataset.unita}): proprio disco ${mio.toFixed(0)} px, ${altri[0][0]} ${altri[0][1].toFixed(0)} px`] : []; });
  const scorre = document.documentElement.scrollWidth > innerWidth;
  return { posti, stretti, righeMax: Math.max(0, ...tutteRighe), esconoTesti, testoSu, fuoriPx, ambigue, toccoSuTocco, centroSottoAltro, suDischi, nomiFuori, scorre };
});
for (const [W, H] of MISURE) {
  const p = await b.newPage({ viewport: { width: W, height: H }, reducedMotion: 'reduce' });
  if (ROSSI.length) await p.addInitScript((r) => { for (const x of r) globalThis[`__NO_${x}`] = true; }, ROSSI);
  p.on('pageerror', (e) => errori.push(`${W}: ${e.message.slice(0, 160)}`)); p.on('console', (x) => { if (x.type() === 'error') errori.push(`${W}: ${x.text().slice(0, 160)}`); });
  await p.goto(URL);
  for (const st of stati) {
    await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify({ ...base, in_corso: st.s, bozza: { missione: st.s.missione, ondata: st.s.ondata, d: st.d } }));
    await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click();
    if (!(await p.waitForSelector('[data-barra]', { timeout: 5000 }).then(() => true, () => false))) { RIS.push({ W, ep: st.m.id, n: st.n, aperto: false }); continue; }
    await p.waitForTimeout(150); const r = await mappaSchieramento(p); const x = await extra(p); RIS.push({ W, ep: st.m.id, n: st.n, ...r, ...x });
    const strano = r.suNomi.length || r.coperte.length || x?.toccoSuTocco.length || x?.centroSottoAltro.length || x?.stretti.length || (x && (x.posti['destra-basso'] || x.posti['sinistra-basso']));
    if (FOTO && strano) await p.locator('.mappa:not(.citta)').screenshot({ path: `${FOTO}/pastiglie-${W}${ROSSI.length ? '-rosso' : ''}-${st.m.id}-o${st.n}.png` });
  }
  await p.close();
  const qui = RIS.filter((x) => x.W === W), conta = (f) => qui.filter(f).length;
  const posti = {}; for (const x of qui) for (const [k, v] of Object.entries(x.posti ?? {})) posti[k] = (posti[k] ?? 0) + v;
  console.log(`${W}×${H}: ondate ${qui.length}, pastiglie sopra i nomi ${conta((x) => x.suNomi?.length)}, nomi su nomi ${conta((x) => x.sopra?.length)}, centro coperto ${conta((x) => x.coperte?.length)}, fuori mappa ${conta((x) => x.fuori?.length)}, nomi fuori ${conta((x) => x.nomiFuori?.length)}, non aperte ${conta((x) => x.aperto === false)}`);
  console.log(`  tocco su tocco (aree) ${conta((x) => x.toccoSuTocco?.length)}, centro sotto un altro tocco ${conta((x) => x.centroSottoAltro?.length)}, pastiglie su dischi altrui ${conta((x) => x.suDischi?.length)}, nomi stretti ${conta((x) => x.stretti?.length)} ondate (${qui.reduce((c, x) => c + (x.stretti?.length ?? 0), 0)} nomi), testo che esce ${conta((x) => x.esconoTesti?.length)}, righe max ${Math.max(...qui.map((x) => x.righeMax ?? 0))}, scorrimento ${conta((x) => x.scorre)}`);
  console.log(`  testo fuori dal riquadro: ${conta((x) => x.fuoriPx?.length)} ondate, max ${Math.max(0, ...qui.flatMap((x) => (x.fuoriPx ?? []).map((f) => f[1])))} px; testo fuori riquadro sopra pastiglie/nomi/bordo: ${conta((x) => x.testoSu?.length)}`);
  console.log(`  gruppi di pastiglie più vicini al disco di un altro settore: ${conta((x) => x.ambigue?.length)} ondate (${qui.reduce((c, x) => c + (x.ambigue?.length ?? 0), 0)} gruppi)`);
  for (const x of qui.filter((x) => x.ambigue?.length)) console.log(`  ambiguo ${x.ep} o${x.n}: ${x.ambigue.join('; ')}`);
  for (const x of qui.filter((x) => x.testoSu?.length)) console.log(`  ${x.ep} o${x.n}: ${x.testoSu.join('; ')}`);
  console.log(`  posti delle unità ${JSON.stringify(posti)}`);
  for (const x of qui.filter((x) => x.suNomi?.length || x.coperte?.length || x.centroSottoAltro?.length)) console.log(`  ${x.ep} o${x.n}: suNomi [${x.suNomi.join('; ')}] coperte [${x.coperte.join(', ')}] centroSottoAltro [${x.centroSottoAltro.join('; ')}]`);
  for (const x of qui.filter((x) => x.stretti?.length)) console.log(`  stretto ${x.ep} o${x.n}: ${x.stretti.map((s) => `${s.nome} (${s.largo.replace('calc(var(--nome-max) * ', '×').replace(')', '')}, ${s.righe} righe${s.esce ? ', ESCE' : ''})`).join('; ')}`);
  for (const x of qui.filter((x) => x.posti?.['destra-basso'] || x.posti?.['sinistra-basso'])) console.log(`  posto nuovo ${x.ep} o${x.n}: ${JSON.stringify(x.posti)}`);
}
await b.close(); srv.close(); writeFileSync(OUT, JSON.stringify({ ROSSI, RIS, errori })); console.log(`errori ${errori.length}`, errori.slice(0, 5));
