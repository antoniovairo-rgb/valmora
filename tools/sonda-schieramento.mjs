// PO-128 (C128-02): uno schieramento con le unità del bot attento, a 360×760, ripetuto N volte; stampa i posti e i nomi
// «rubati» / le pastiglie sui nomi come tools/foto-schieramenti.mjs. Uso (dalla radice):
//   VALMORA_CHROME=$(node tools/chrome-ci.mjs) M=e14 O=1 N=10 node tools/sonda-schieramento.mjs
//   altre variabili: VALMORA_ROSSI, LENTO=1 (caratteri +1,5 s), ARGS, RIDISPONI, MISURE, SOPRASX, FOTO=<prefisso>
import { chromium } from 'playwright-core';
import { createServer } from 'node:http'; import { readFileSync, existsSync } from 'node:fs'; import { join, extname } from 'node:path';
import { partenzeAttente, ascoltaEtichette, etichetteFerme, mappaSchieramento } from './foto-schieramenti.mjs';
import { salvataggioTutti } from './foto-bozze.mjs';
import { leggiDati } from './dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const p = join('dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const url = `http://127.0.0.1:${srv.address().port}/`;
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x).sort((a, b) => a.episodio - b.episodio);
const base = salvataggioTutti(missioni, v0);
const [mid = 'e14', on = 1, prove = 5] = [process.env.M, Number(process.env.O ?? 1), Number(process.env.N ?? 5)];
const st = partenzeAttente('data').find((x) => x.m.id === mid && x.n === on);
const b = await chromium.launch({ executablePath: process.env.VALMORA_CHROME ?? '/opt/pw-browsers/chromium', args: (process.env.ARGS ?? '').split(' ').filter(Boolean) });
let rossi = 0;
for (let i = 1; i <= prove; i++) {
  const q = await b.newPage({ viewport: { width: 360, height: 760 }, reducedMotion: 'reduce' });
  const xs = (process.env.VALMORA_ROSSI ?? '').split(',').filter(Boolean); if (xs.length) await q.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, xs);
  if (process.env.LENTO) await q.route('**/*.woff2', async (r) => { await new Promise((ok) => setTimeout(ok, 1500)); await r.continue(); });
  await q.goto(url);
  await q.evaluate((v) => localStorage.setItem('vandelfalls-salvataggio', v), JSON.stringify({ ...base, in_corso: st.s, bozza: { missione: st.s.missione, ondata: st.s.ondata, d: st.d } }));
  await q.reload(); await q.getByRole('button', { name: 'Riprendi' }).click(); await q.waitForSelector('[data-barra]');
  await ascoltaEtichette(q); const ferme = await etichetteFerme(q);
  const r = await mappaSchieramento(q);
  const pos = await q.evaluate(() => [...document.querySelectorAll('.mappa:not(.citta) [data-settore]')].filter((x) => /biglietteria|tornelli/i.test(x.dataset.settore)).map((x) => `${x.dataset.settore}:${x.dataset.nome}/${x.dataset.unita}/${x.querySelector('.settore-nome')?.style.maxWidth ?? ''}`).join(' '));
  const tr = await q.evaluate(() => getComputedStyle(document.querySelector('.scena')).transform);
  if (process.env.RIDISPONI) { await ascoltaEtichette(q); await q.setViewportSize({ width: 384, height: 784 }); await etichetteFerme(q, true); await ascoltaEtichette(q); await q.setViewportSize({ width: 360, height: 760 }); await etichetteFerme(q, true);
    const r2 = await mappaSchieramento(q); const pos2 = await q.evaluate(() => [...document.querySelectorAll('.mappa:not(.citta) [data-settore]')].filter((x) => /biglietteria|tornelli/i.test(x.dataset.settore)).map((x) => `${x.dataset.settore}:${x.dataset.nome}/${x.dataset.unita}`).join(' '));
    console.log(`   dopo ridisposizione a scena ferma: ${pos2} rubati=${r2.rubati.length} suNomi=${r2.suNomi.length}`); }
  if (process.env.MISURE) console.log(JSON.stringify(await q.evaluate(() => { const m = document.querySelector('.mappa:not(.citta)').getBoundingClientRect();
    return { mappa: [m.width, m.height].map((x) => +x.toFixed(1)), font: getComputedStyle(document.querySelector('.settore-nome')).fontFamily.slice(0, 30), nomi: [...document.querySelectorAll('.mappa:not(.citta) [data-settore]')].map((x) => { const n = x.querySelector('.settore-nome').getBoundingClientRect(), p = x.querySelector('.settore-punto').getBoundingClientRect(), u = x.querySelector('.settore-unita')?.getBoundingClientRect();
      return `${x.dataset.settore} nome ${n.width.toFixed(1)}x${n.height.toFixed(1)} punto ${p.left.toFixed(1)},${p.top.toFixed(1)} ${p.width.toFixed(1)} unita ${u ? u.width.toFixed(1) + 'x' + u.height.toFixed(1) : '-'}`; }) }; })));
  if (process.env.SOPRASX) console.log('sopra-sx:', JSON.stringify(await q.evaluate(() => { const c = document.querySelector('.mappa:not(.citta)'), m = c.getBoundingClientRect(), s = c.querySelector('[data-settore="biglietteria"]'), n = s.querySelector('.settore-nome');
    const prima = [s.dataset.nome, s.dataset.unita]; s.setAttribute('data-nome', 'sopra-sx'); s.setAttribute('data-unita', 'sotto'); const r = n.getBoundingClientRect(); const g = document.createRange(); g.selectNodeContents(n); const t = [...g.getClientRects()].map((z) => +(z.left - m.left).toFixed(2));
    s.setAttribute('data-nome', prima[0]); s.setAttribute('data-unita', prima[1]); return { daSinistra: +(r.left - m.left).toFixed(2), testoDaSinistra: t, larghezza: r.width, margineMinimo: 5 }; })));
  const bad = r.rubati.length || r.suNomi.length; if (bad) rossi++;
  console.log(`prova ${i}: ${bad ? 'ROSSO' : 'verde'} ferme=${ferme} tr=${tr} ${pos} | rubati=${r.rubati.length} suNomi=${JSON.stringify(r.suNomi)}`);
  if (process.env.FOTO) await q.screenshot({ path: `${process.env.FOTO}-${i}.png` });
  await q.close();
}
console.log(`${mid} o${on}: ${rossi} rossi su ${prove}`); await b.close(); srv.close();
