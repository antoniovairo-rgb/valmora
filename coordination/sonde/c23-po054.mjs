// Sonda C-023 (sola lettura): PO-054 nell'interfaccia vera (dist/). Per ogni episodio di EP, all'ondata 1, a 360×760,
// 375×667, 412×915: per ogni risorsa non fissa con almeno 2 unità libere, la si mette K volte (2 o 3) sullo stesso
// settore (tocco unità → tocco settore), poi si tocca la pastiglia [data-presenza="r@s"] (tap vero, al centro, dopo
// aver controllato con elementFromPoint che il centro sia la pastiglia): attesa K-1 sulla pastiglia e +1 libere nel
// vassoio; poi «Annulla» ([data-azione=annulla]): attesa di nuovo K. Infine ritiro fino a 0 (pastiglia sparisce) e
// K «Annulla» di fila (torna K). Controlla anche la bozza nel salvataggio dopo il ritiro singolo. Foto prima/dopo.
// Uso: node coordination/sonde/c23-po054.mjs <radice> <foto> · env EP=e01,e07,... ROSSO=C46R01
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c23'; mkdirSync(DIR, { recursive: true });
const ROSSI = process.env.ROSSO?.split(',').filter(Boolean) ?? []; const suff = ROSSI.length ? '-rosso' : '';
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const M = await import(`${R}/src/logica/missione.ts`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const base = salvataggioTutti(missioni, v0); const errori = []; const conta = { prove: 0, ok: 0, male: [] };
const EP = (process.env.EP ?? 'e01,e07,e04,e13,e15,e23,e28,e34').split(',');
const n = (p, r, s) => p.evaluate(([r, s]) => { const e = document.querySelector(`[data-presenza="${r}@${s}"] .pastiglia`); return e ? Number(e.textContent.replace(/\D/g, '')) : 0; }, [r, s]);
const libere = (p, r) => p.evaluate((r) => Number(document.querySelector(`[data-risorsa="${r}"] strong`)?.textContent ?? -1), r);
const tocca = async (p, sel) => {
  const ok = await p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return 'manca'; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t && (t === e || e.contains(t)) ? 'ok' : `coperto da ${t?.className}`; }, sel);
  if (ok !== 'ok') return ok;
  const r = await p.locator(sel).boundingBox(); await p.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await p.waitForTimeout(120); return 'ok';
};
for (const [w, h] of [[360, 760], [375, 667], [412, 915]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  if (ROSSI.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, ROSSI);
  p.on('console', (x) => { if (x.type() === 'error') errori.push(`${w}: ${x.text().slice(0, 160)}`); }); p.on('pageerror', (e) => errori.push(`${w}: ${e.message.slice(0, 160)}`));
  await p.goto(URL);
  for (const id of EP) {
    const m = missioni.find((x) => x.id === id);
    const fisse = Object.entries(m.mappa.risorse).filter(([, x]) => x.fissa).map(([r]) => r);
    const carica = async () => {
      await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify({ ...base, in_corso: M.iniziaMissione(m, { ...v0 }, dich) }));
      await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click();
      await p.waitForFunction(() => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === 'schieramento' && getComputedStyle(s[0]).opacity === '1'; }, null, { timeout: 10000 });
      await p.waitForTimeout(200);
    };
    await carica();
    const risorse = await p.$$eval('[data-risorsa]', (xs) => xs.map((x) => [x.dataset.risorsa, Number(x.querySelector('strong').textContent)]));
    const settori = await p.$$eval('[data-settore]', (xs) => xs.filter((x) => !x.dataset.vietato).map((x) => x.dataset.settore));
    let foto = false;
    for (const [r, lib] of risorse) {
      if (fisse.includes(r) || lib < 2) continue;
      const K = Math.min(3, lib);
      let s = null;
      for (const cand of settori) {
        await carica();
        for (let k = 0; k < K; k++) { await tocca(p, `[data-risorsa="${r}"]`); await tocca(p, `[data-settore="${cand}"] .settore-punto`); }
        if ((await n(p, r, cand)) === K) { s = cand; break; }
      }
      conta.prove++;
      if (!s) { conta.male.push(`${w} ${id} ${r}: nessun settore accetta ${K} unità`); continue; }
      const lib0 = await libere(p, r);
      if (!foto) await p.screenshot({ path: `${DIR}/po054-${w}-${id}-prima${suff}.jpg`, type: 'jpeg', quality: 72 });
      const t = await tocca(p, `[data-presenza="${r}@${s}"]`);
      const dopo = await n(p, r, s), lib1 = await libere(p, r);
      const bozza = await p.evaluate(([r, s]) => JSON.parse(localStorage.getItem('valmora-salvataggio'))?.bozza?.d?.[r]?.[s] ?? 0, [r, s]);
      if (!foto) await p.screenshot({ path: `${DIR}/po054-${w}-${id}-ritiro1${suff}.jpg`, type: 'jpeg', quality: 72 });
      await tocca(p, '[data-azione="annulla"]'); const annullato = await n(p, r, s);
      if (!foto) { await p.screenshot({ path: `${DIR}/po054-${w}-${id}-annulla${suff}.jpg`, type: 'jpeg', quality: 72 }); foto = true; }
      // fino a 0, poi K annulla
      const scala = [];
      for (let k = 0; k < K + 1; k++) { await tocca(p, `[data-presenza="${r}@${s}"]`); scala.push(await n(p, r, s)); }
      const su = [];
      for (let k = 0; k < K; k++) { await tocca(p, '[data-azione="annulla"]'); su.push(await n(p, r, s)); }
      const atteso = { dopo: K - 1, lib1: lib0 + 1, bozza: K - 1, annullato: K };
      const ok = t === 'ok' && dopo === K - 1 && lib1 === lib0 + 1 && bozza === K - 1 && annullato === K && su.at(-1) === K && scala.includes(0);
      if (ok) conta.ok++; else conta.male.push(`${w} ${id} ${r}@${s} K=${K}: tocco ${t}, dopo ${dopo}, libere ${lib0}→${lib1}, bozza ${bozza}, annulla ${annullato}, scala ${scala}, su ${su}`);
      console.log(`${w} ${id} ${r}@${s}: K=${K} → tocco pastiglia ${t} → ${dopo} (libere ${lib0}→${lib1}, bozza ${bozza}) → Annulla ${annullato} · ritiri ${scala.join('>')} · annulla ${su.join('>')} ${ok ? 'OK' : 'DIVERSO da ' + JSON.stringify(atteso)}`);
    }
  }
  await p.close();
}
console.log(`PO-054: ${conta.ok}/${conta.prove} prove come atteso; diverse ${conta.male.length}${conta.male.length ? '\n  ' + conta.male.join('\n  ') : ''}`);
console.log(`errori di console: ${errori.length} ${[...new Set(errori)].slice(0, 5).join(' | ')}`);
await b.close(); srv.close();
