// Sonda C-024 (copia di c23-partite.mjs, sola lettura): episodi di EP (e01,e07,e13,e15,e28) giocati dall'interfaccia dalla mappa della città
// (salvataggio con tutti gli episodi conclusi, «Rigioca»), piano del bot attento e del peggiore, a 360×760, 375×667 e
// 412×915; stesse misure della C-018:
//  - PO-097: versione [data-versione-angolo] su ogni schermata; sovrapposizione con comandi (button, a, .opzione,
//    [role=button], .settore-punto) a scorrimento 0 e a fondo pagina; dentro la finestra a fondo pagina;
//  - C17-15: in chiamata, «Rispondi» presente? che cosa copre a scorrimento 0; dopo il tocco la prima opzione è intera
//    nella finestra e non coperta da elementi sticky;
//  - C17-17: settori pulsanti in sala e nel briefing (data-lampeggianti);
//  - PO-096: «?» dello schieramento: misure del tasto e dell'icona, carattere del testo d'aiuto;
//  - PO-092: vignette per schermata ([data-vignetta]) e id SVG duplicati nella pagina;
//  - testi coperti da elementi sticky a fondo pagina (non raggiungibili scorrendo).
// Foto della FINESTRA (non della pagina intera) in <cartella>: <w>-<scena>[-fondo|-dopo-rispondi|-aiuto].jpg.
// Uso: node coordination/sonde/c18-grafica.mjs <radice con dist/> <cartella foto>
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c24'; const EP = (process.env.EP ?? 'e01,e07,e13,e15,e28').split(',');
mkdirSync(DIR, { recursive: true });
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const dati = leggiDati(join(R, 'data')); const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { missioni, v0 } = missioniDai(join(R, 'data')); const base = salvataggioTutti(missioni, v0); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 10000 });
const quale = (p) => p.evaluate(() => document.querySelector('.scena')?.dataset.scena);
const piano = (m, strategia) => { const g = B[strategia](creaCaso(1), dich); let s = M.iniziaMissione(m, Object.fromEntries([...dich.values()].map((d) => [d.id, d.iniziale])), dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return { ond }; };
async function schiera(p, d) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); } }
// misure nella pagina: versione contro comandi, testi coperti da sticky, vignette e id duplicati
const misura = (p) => p.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0'; };
  const ov = (a, c) => Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left)) * Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top));
  const comandi = [...document.querySelectorAll('button, a, .opzione, [role=button], .settore-punto')].filter(vis);
  const v = document.querySelector('[data-versione-angolo]');
  const vr = v && vis(v) ? v.getBoundingClientRect() : null;
  const vSov = vr ? comandi.map((e) => [e, ov(vr, e.getBoundingClientRect())]).filter(([, a]) => a > 0).map(([e, a]) => `${(e.textContent || e.getAttribute('aria-label') || e.className).trim().slice(0, 16)} ${Math.round(a)}px²`) : [];
  const stickyEl = [...document.querySelectorAll('.scena *')].filter((e) => vis(e) && ['sticky', 'fixed'].includes(getComputedStyle(e).position));
  const foglie = [...document.querySelectorAll('.scena *')].filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && !e.closest('.mappa-tela'));
  const coperti = [];
  for (const f of foglie) for (const s of stickyEl) { if (s.contains(f) || f.contains(s)) continue; const a = ov(f.getBoundingClientRect(), s.getBoundingClientRect()); if (a > 40) coperti.push(`«${f.textContent.trim().slice(0, 18)}» sotto «${s.textContent.trim().slice(0, 14)}» ${Math.round(a)}px²`); }
  const ids = [...document.querySelectorAll('svg [id]')].map((e) => e.id); const dup = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
  const se = document.scrollingElement; const mp = document.querySelector('.mappa');
  return { y: Math.round(scrollY), maxY: se.scrollHeight - innerHeight, versione: v?.textContent ?? null, vFont: v ? parseFloat(getComputedStyle(v).fontSize) : null,
    vDentro: vr ? vr.top >= 0 && vr.bottom <= innerHeight : false, vSov, coperti: coperti.slice(0, 4), vignette: document.querySelectorAll('[data-vignetta]').length, dup: dup.slice(0, 4),
    lamp: mp?.dataset.lampeggianti ?? '-' };
});
const RIS = []; const errori = [];
const foto = (p, w, nome) => p.screenshot({ path: `${DIR}/gioco-${w}-${nome}.jpg`, type: 'jpeg', quality: 70 });
async function scena(p, w, nome, fai = false) {
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(150);
  const a = await misura(p); await p.evaluate(() => scrollTo(0, document.scrollingElement.scrollHeight)); await p.waitForTimeout(250);
  const z = await misura(p);
  RIS.push({ w, nome, a, z });
  if (fai) { await foto(p, w, `${nome}-fondo`); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(100);
  if (fai) await foto(p, w, nome);
}
const RISP = [];
for (const ep of EP) for (const [w, h] of [[360, 760], [375, 667], [412, 915]]) for (const strategia of ['attenta', 'peggiore']) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  p.on('console', (x) => { if (x.type() === 'error') errori.push(`${w} ${strategia}: ${x.text().slice(0, 140)}`); }); p.on('pageerror', (e) => errori.push(`${w} ${strategia}: ${e.message.slice(0, 140)}`));
  const F = strategia === 'attenta'; const n = { c: 0 };
  await p.goto(URL); await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(base)); await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click();
  await sc(p, 'citta'); const mm = missioni.find((x) => x.id === ep); const st = p.locator(`[data-stagione="${mm.stagione}"]`); if (await st.count()) await st.click();
  await p.locator(`[data-episodio="${ep}"] .settore-punto`).click(); await p.waitForTimeout(400); await scena(p, w, `${ep}-citta`, F);
  await p.click('[data-azione="avvia-episodio"]'); if (await p.locator('.tripla').count()) { for (let q = 0; q < 5 && (await p.locator('[data-azione="conferma-passo"]').count()); q++) await p.click('[data-azione="conferma-passo"]'); await p.click('[data-azione="conferma-rigioca"]'); } await sc(p, 'sala'); await p.waitForTimeout(500);
  let k = 0; while (await p.locator('[data-azione="passo"]').count()) { await scena(p, w, `${ep}-sala-${++k}`, F && k === 1); await p.click('[data-azione="passo"]'); await p.waitForTimeout(150); } await scena(p, w, `${ep}-sala-${++k}`, F);
  await p.click('[data-azione="avanti"]'); await sc(p, 'briefing');
  k = 0; while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) { await scena(p, w, `${ep}-briefing-${++k}`, F && k === 1); await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.waitForTimeout(150); }
  await scena(p, w, `${ep}-briefing-${++k}`, false); await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento');
  const m = dati[`missioni/${ep}.json`]; const pl = piano(m, strategia);
  for (const [i, o] of pl.ond.entries()) {
    if (i) await sc(p, 'schieramento');
    if (i === 0) { // PO-096: il «?»
      await p.click('[data-azione="aiuto"]'); await p.waitForTimeout(200);
      const x = await p.evaluate(() => { const bt = document.querySelector('[data-azione="aiuto"]').getBoundingClientRect(); const ic = document.querySelector('[data-azione="aiuto"] svg')?.getBoundingClientRect(); const t = document.querySelector('[data-aiuto] p');
        return { tasto: `${Math.round(bt.width)}×${Math.round(bt.height)}`, icona: ic ? `${Math.round(ic.width)}×${Math.round(ic.height)}` : null, font: t ? parseFloat(getComputedStyle(t).fontSize) : null, colore: t ? getComputedStyle(t).color : null, fondo: t ? getComputedStyle(t.closest('.scheda')).backgroundColor : null, aiutoTop: t ? Math.round(t.closest('.scheda').getBoundingClientRect().top) : null }; });
      RIS.push({ w, nome: `${ep}-aiuto`, aiuto: x }); if (F) await foto(p, w, `${ep}-schieramento-aiuto`);
      await scena(p, w, `${ep}-schieramento-aiuto`, false);
      await p.click('[data-azione="aiuto"]'); await p.waitForTimeout(150);
    }
    await schiera(p, o.d); await scena(p, w, `${ep}-schieramento-${i + 1}`, F && i === 0);
    await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) { if (i === 0) await scena(p, w, `${ep}-riepilogo`, F); await p.click('[data-azione="conferma-davvero"]'); }
    for (const [cid, op] of o.rs) {
      await sc(p, 'chiamata'); await p.waitForTimeout(300); n.c++;
      const nome = `${ep}-chiamata-${cid}`; await scena(p, w, nome, F && n.c <= 2);
      const ind = await p.locator('[data-indicatore="opzioni"]').count();
      const r = { w, strategia, cid: `${ep}:${cid}`, ind };
      if (ind) {
        r.copre = await p.evaluate(() => { const i = document.querySelector('[data-indicatore="opzioni"]').getBoundingClientRect(); const ov = (a, c) => Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left)) * Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top));
          return [...document.querySelectorAll('.testo-radio, .vice-a-margine, .mittente, .vignetta')].map((e) => [e.className.baseVal ?? e.className, ov(i, e.getBoundingClientRect())]).filter(([, a]) => a > 0).map(([c, a]) => `${String(c).split(' ')[0]} ${Math.round(a)}px²`).join(', '); });
        await p.click('[data-indicatore="opzioni"]'); await p.waitForTimeout(900);
        r.dopo = await p.evaluate(() => { const o = document.querySelector('.opzione').getBoundingClientRect(); const ov = (a, c) => Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left)) * Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top));
          const st = [...document.querySelectorAll('.scena *')].filter((e) => ['sticky', 'fixed'].includes(getComputedStyle(e).position) && e.getBoundingClientRect().height > 0 && !e.contains(document.querySelector('.opzione')));
          return { top: Math.round(o.top), bottom: Math.round(o.bottom), h: innerHeight, intera: o.top >= 0 && o.bottom <= innerHeight, coperta: st.reduce((t, e) => t + ov(o, e.getBoundingClientRect()), 0), indicatore: !!document.querySelector('[data-indicatore="opzioni"]') }; });
        if (F && n.c === 1) await foto(p, w, `${nome}-dopo-rispondi`);
      }
      RISP.push(r);
      await p.click(`[data-opzione="${op}"]`); await p.waitForTimeout(350);
      if (await p.locator('[data-azione="continua"]').count()) { await scena(p, w, `${ep}-risposta-${cid}`, F && n.c === 1); await p.click('[data-azione="continua"]'); }
    }
    await sc(p, 'chiusura'); await scena(p, w, `${ep}-chiusura-${i + 1}`, F && i === 0); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); await p.waitForTimeout(250);
    await scena(p, w, `${ep}-${F ? '' : 'persa-'}rapporto-${i + 1}`, i === pl.ond.length - 1);
    await p.click('[data-azione="avanti"]');
  }
  await sc(p, 'verbale'); await p.waitForTimeout(400);
  k = 0; while (await p.locator('[data-azione="passo"]').count()) { await scena(p, w, `${ep}-${F ? '' : 'persa-'}verbale-${++k}`, k === 1); await p.click('[data-azione="passo"]'); await p.waitForTimeout(150); } await scena(p, w, `${ep}-${F ? '' : 'persa-'}verbale-${++k}`, true);
  await p.close();
}
// riepilogo
const sintesi = (x) => `y${x.y}/${x.maxY} v=${x.versione ?? '–'}${x.vFont ? ` ${x.vFont}px` : ''} dentro=${x.vDentro} sovrComandi=${x.vSov.join('; ') || 0} coperti=${x.coperti.join('; ') || 0} vignette=${x.vignette}${x.dup.length ? ` idDoppi=${x.dup.join(',')}` : ''} pulsa=«${x.lamp}»`;
if (process.env.TUTTO) for (const r of RIS) console.log(r.aiuto ? `${r.w} AIUTO ${JSON.stringify(r.aiuto)}` : `${r.w} ${r.nome.padEnd(30)} inizio ${sintesi(r.a)}\n${' '.repeat(35)}fondo  ${sintesi(r.z)}`);
const conV = RIS.filter((r) => r.a); const senzaV = conV.filter((r) => !r.a.versione); const sovV = conV.filter((r) => r.a.vSov.length || r.z.vSov.length); const fuori = conV.filter((r) => r.a.versione && !r.z.vDentro);
for (const r of RIS.filter((r) => r.a && (r.a.coperti.length || r.z.coperti.length || r.a.vSov.length || r.z.vSov.length))) console.log(`${r.w} ${r.nome}: inizio ${sintesi(r.a)} | fondo ${sintesi(r.z)}`);
console.log(`\nPO-097: schermate misurate ${conV.length}; senza versione ${senzaV.length} (${senzaV.map((r) => r.w + ' ' + r.nome).slice(0, 6).join(', ')}); versione sopra un comando ${sovV.length}; versione fuori dalla finestra a fondo pagina ${fuori.length}`);
const ind = RISP.filter((r) => r.ind);
console.log(`C17-15: chiamate ${RISP.length}; con «Rispondi» ${ind.length}; dopo il tocco prima opzione intera ${ind.filter((r) => r.dopo.intera).length}, coperta da sticky ${ind.filter((r) => r.dopo.coperta > 0).length}; «Rispondi» sopra testo della chiamata ${ind.filter((r) => r.copre).length}`);
for (const w of [360, 375, 412]) { const x = RISP.filter((r) => r.w === w); console.log(`  ${w}: ${x.length} chiamate, «Rispondi» in ${x.filter((r) => r.ind).length}, prima opzione intera dopo il tocco ${x.filter((r) => r.ind && r.dopo.intera).length}/${x.filter((r) => r.ind).length}`); }
for (const w of [360, 375, 412]) { const x = ind.filter((r) => r.w === w); const conta = (k) => x.filter((r) => (r.copre ?? '').includes(k)).length; const mx = (k) => Math.max(0, ...x.map((r) => Number(((r.copre ?? '').match(new RegExp(`${k} (\\d+)px`)) ?? [])[1] ?? 0)));
  console.log(`  ${w}: «Rispondi» sopra testo-radio ${conta('testo-radio')}/${x.length} (max ${mx('testo-radio')} px²), vice ${conta('vice-a-margine')}/${x.length} (max ${mx('vice-a-margine')}), vignetta ${conta('vignetta')}/${x.length} (max ${mx('vignetta')})`); }
for (const r of ind.filter((r) => !r.dopo.intera || r.dopo.coperta || r.copre)) console.log(`  ${r.w} ${r.strategia} ${r.cid}: copre ${r.copre || '–'} · dopo ${JSON.stringify(r.dopo)}`);
console.log(`errori di console: ${errori.length}`); for (const e of errori.slice(0, 20)) console.log('  ' + e);
await b.close(); srv.close();
