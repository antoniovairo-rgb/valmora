// Sonda C-022: fogli di ritagli ingranditi per il giudizio di forma (PO-106). Ogni elemento censito da c22-grafica.mjs
// compare due volte: alla dimensione reale (1 px CSS = 1 px del foglio, con la densità DPR del ritaglio) e ingrandito
// ×ZOOM a pixel pieni (image-rendering: pixelated), con tipo, nome, contesto, lato in px CSS e prima schermata.
// Uso: node coordination/sonde/c22-fogli.mjs <radice> <uscita.json di c22-grafica> <cartella foto> [ZOOM=4]
import { readFileSync, writeFileSync } from 'node:fs'; import { resolve } from 'node:path'; import { pathToFileURL } from 'node:url';
const R = resolve(process.argv[2] ?? '.'); const J = JSON.parse(readFileSync(process.argv[3], 'utf8')); const DIR = process.argv[4] ?? 'docs/foto/c22'; const Z = Number(process.env.ZOOM ?? 4);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const GRUPPI = { icone: ['icona', 'stella', 'stemma'], segni: ['segno', 'tasto-lettera', 'pastiglia', 'tacca', 'unita-fissa', 'timbro'], vignette: ['vignetta-chi', 'vignetta'] };
// la larghezza della finestra sta nel nome del ritaglio (<larghezza>[x2]-NNNN.png): r.w è il lato dell'elemento
for (const r of J.ritagli) r.vw = Number(r.f.split('/').pop().match(/^(\d+)/)[1]);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage({ viewport: { width: 1100, height: 800 }, deviceScaleFactor: 1 });
for (const w of [...new Set(J.ritagli.map((r) => r.vw))]) for (const [g, tipi] of Object.entries(GRUPPI)) {
  const visti = new Set(); const xs = J.ritagli.filter((r) => r.vw === w && tipi.includes(r.tipo) && (r.tipo !== 'vignetta' || r.w <= 130)).filter((r) => { const k = `${r.tipo}|${r.nome}|${r.ctx}|${r.tipo === 'vignetta-chi' ? r.nome : ''}`; if (visti.has(k)) return false; visti.add(k); return true; });
  if (!xs.length) continue; const dpr = xs[0].dpr;
  const celle = xs.map((r) => `<figure><div class="v"><img src="${pathToFileURL(resolve(r.f))}" style="width:${(r.w2 ?? 0) || 'auto'}" data-d="${dpr}"><img class="z" src="${pathToFileURL(resolve(r.f))}" data-d="${dpr}"></div><figcaption><b>${r.tipo}</b> ${String(r.nome).slice(0, 26)}<br>${String(r.ctx).slice(0, 26)} · ${r.tipo === 'vignetta-chi' ? r.riquadro : `${r.w}×${r.h}`}${r.glifo ? ` · glifo ${r.glifo}` : ''}${r.tratto ? ` · tratto ${r.tratto}` : ''}<br>${r.ep} ${r.scena.slice(0, 24)}</figcaption></figure>`).join('');
  const html = `<!doctype html><meta charset="utf-8"><style>body{margin:8px;font:11px/1.25 sans-serif;background:#ddd}h1{font-size:14px;margin:0 0 6px}main{display:flex;flex-wrap:wrap;gap:6px}figure{margin:0;padding:4px;background:#fff;border:1px solid #999;width:250px}.v{display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap}img.z{image-rendering:pixelated}</style>
<h1>C-022 · ${w} px · DPR ${dpr} · ${g}: a sinistra dimensione reale (px CSS), a destra ×${Z}</h1><main>${celle}</main>
<script>for(const i of document.images){i.decode().then(()=>{const d=+i.dataset.d;const w=i.naturalWidth/d,h=i.naturalHeight/d;if(i.classList.contains('z')){i.style.width=(w*${Z})+'px';i.style.height=(h*${Z})+'px';const f=i.closest('figure');f.style.width=Math.max(250,w*${Z}+w+24)+'px'}else{i.style.width=w+'px';i.style.height=h+'px'}})}</script>`;
  const f = `${process.env.FOGLIO_DIR ?? "/tmp"}/c22-foglio.html`; writeFileSync(f, html); await p.goto(pathToFileURL(f).href); await p.waitForTimeout(600);
  await p.screenshot({ path: `${DIR}/foglio-${w}${dpr === 2 ? 'x2' : ''}-${g}.png`, fullPage: true }); console.log(`foglio ${w} dpr${dpr} ${g}: ${xs.length} elementi`);
}
await b.close();
