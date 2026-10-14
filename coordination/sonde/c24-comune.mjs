// Sonda C-024 (sola lettura): parti comuni alle sonde c24-*.mjs. Server statico di dist/, Chromium del container,
// stati di gioco in cui ogni chiamata è la prima aperta (raccolti col motore come in c23-grafica.mjs), apertura di
// una chiamata nell'interfaccia vera dal salvataggio («Riprendi»).
import { createServer } from 'node:http'; import { readFileSync, existsSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
export const R = resolve(process.argv[2] ?? '.');
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
export const M = await import(`${R}/src/logica/missione.ts`); export const B = await import(`${R}/src/logica/bot.ts`);
const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`);
export const dati = leggiDati(join(R, 'data')); export const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
export const { missioni, v0 } = missioniDai(join(R, 'data'));
export const club = Object.fromEntries(Object.entries(dati).filter(([k]) => k.startsWith('club/')).map(([, c]) => [c.id, c]));
export const base = salvataggioTutti(missioni, v0);
export { creaCaso };

/** Per ogni chiamata il primo stato in cui è la prima aperta. SEMI semi per le strategie non deterministiche; metà
 *  delle partite casuali con variabili di partenza a caso (come c23-grafica.mjs). */
export function statiChiamate({ SEMI = 20, EP } = {}) {
  const stati = new Map(); let partite = 0, blocchi = 0;
  for (const m of missioni) {
    if (EP && !EP.includes(m.id)) continue;
    for (const [nome, st] of Object.entries(B.STRATEGIE)) for (let seme = 1; seme <= (B.DETERMINISTICHE.has(nome) ? 1 : SEMI); seme++) {
      const g = st(creaCaso(seme * 7919 + m.episodio), dich); partite++;
      const cv = creaCaso(seme * 104729 + m.episodio), r = () => cv.numero();
      const v = nome === 'casuale' && seme % 2 === 0 ? Object.fromEntries(dati['stato.json'].variabili.map((d) => [d.id, d.tipo === 'bool' ? r() < 0.5 : d.tipo === 'enum' ? d.valori[Math.floor(r() * d.valori.length)] : d.id === 'tensione_max' ? 0 : Math.round(d.min + r() * (d.max - d.min))])) : { ...v0 };
      let s = M.iniziaMissione(m, v, dich), passi = 0;
      try {
        while (!M.missioneFinita(m, s)) {
          if (++passi > 400) { blocchi++; break; }
          s = M.schiera(m, s, g.schiera(m, s));
          for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) {
            const k = `${m.id}:${c.id}`; if (!stati.has(k)) stati.set(k, { m, n: s.ondata, c, s: structuredClone(s) });
            s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich); if (++passi > 400) throw new Error('blocco');
          }
          s = M.chiudiOndata(m, s, dich);
        }
      } catch (e) { blocchi++; console.error(`${m.id} ${nome} ${seme}: ${e.message}`); }
    }
  }
  const tutte = missioni.filter((m) => !EP || EP.includes(m.id)).flatMap((m) => m.ondate.flatMap((o) => (o.chiamate ?? []).map((c) => `${m.id}:${c.id}`)));
  return { stati, partite, blocchi, tutte, mai: tutte.filter((k) => !stati.has(k)) };
}

const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
export async function avvia() {
  const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
  await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const errori = [];
  const pagina = async ({ w, h, scala = 1, ridotto = true, rossi = [], etichetta = '' }) => {
    const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: scala, reducedMotion: ridotto ? 'reduce' : 'no-preference' });
    if (rossi.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, rossi);
    p.on('console', (x) => { if (x.type() === 'error') errori.push(`${etichetta} ${w}: ${x.text().slice(0, 160)}`); }); p.on('pageerror', (e) => errori.push(`${etichetta} ${w}: ${e.message.slice(0, 160)}`));
    await p.goto(`http://127.0.0.1:${srv.address().port}/`); return p;
  };
  const chiudi = async () => { await b.close(); srv.close(); };
  return { b, pagina, errori, chiudi, URL: `http://127.0.0.1:${srv.address().port}/` };
}

/** Apre nell'interfaccia la chiamata dello stato x (salvataggio con in_corso = x.s, «Riprendi»). */
export async function apriChiamata(p, x, attesa = 250) {
  await p.evaluate((v) => { localStorage.setItem('valmora-salvataggio', v); }, JSON.stringify({ ...base, in_corso: x.s }));
  await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click();
  await p.waitForFunction(() => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === 'chiamata' && getComputedStyle(s[0]).opacity === '1'; }, null, { timeout: 10000 });
  await p.waitForSelector('.mappa[data-pronta="si"]', { timeout: 10000 }).catch(() => {}); await p.waitForTimeout(attesa);
}
export const sc = (p, nome, timeout = 10000) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, nome, { timeout });
/** Dalla città (salvataggio con tutti gli episodi conclusi) fino al primo passo del briefing dell'episodio ep. */
export async function alBriefing(p, ep) {
  await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(base)); await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click();
  await sc(p, 'citta'); const mm = missioni.find((x) => x.id === ep); const st = p.locator(`[data-stagione="${mm.stagione}"]`); if (await st.count()) await st.click();
  await p.locator(`[data-episodio="${ep}"] .settore-punto`).click(); await p.waitForTimeout(300);
  await p.click('[data-azione="avvia-episodio"]'); if (await p.locator('.tripla').count()) { for (let q = 0; q < 5 && (await p.locator('[data-azione="conferma-passo"]').count()); q++) await p.click('[data-azione="conferma-passo"]'); await p.click('[data-azione="conferma-rigioca"]'); }
  await sc(p, 'sala'); while (await p.locator('[data-azione="passo"]').count()) await p.click('[data-azione="passo"]');
  await p.click('[data-azione="avanti"]'); await sc(p, 'briefing'); await p.waitForTimeout(200);
}
