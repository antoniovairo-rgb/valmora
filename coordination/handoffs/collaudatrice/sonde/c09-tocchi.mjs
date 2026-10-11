// Sonda C-09 · verifica dei «tocchi muti»: tocchi ripetuti sullo stesso settore e sul punto già scelto in città (build pubblicata).
// Uso: node coordination/handoffs/collaudatrice/sonde/c09-tocchi.mjs [larghezza]
import { chromium } from '../../../../node_modules/playwright-core/index.mjs';
const L = Number(process.argv[2] ?? 360);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY } });
const p = await b.newPage({ viewport: { width: L, height: 760 }, hasTouch: true });
await p.goto('https://antoniovairo-rgb.github.io/valmora/'); await p.evaluate(() => localStorage.clear()); await p.reload();
const sc = (n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
await sc('titolo'); await p.click('text=Nuova partita'); await sc('genere'); await p.click('[data-genere="f"]'); await sc('citta');
const scelto = await p.evaluate(() => [...document.querySelectorAll('[data-episodio]')].map((e) => `${e.dataset.episodio}:${e.className.includes('acceso') ? 'scelto' : '-'}`));
const scheda = await p.getAttribute('[data-scheda-episodio]', 'data-scheda-episodio');
console.log(`città: punti ${JSON.stringify(scelto)}, scheda già aperta su ${scheda} prima di toccare`);
await p.click('[data-azione="avvia-episodio"]'); await sc('sala'); await p.click('[data-azione="avanti"]'); await sc('briefing');
while (await p.locator('[data-azione="prossimo"]').count()) { await p.click('[data-azione="prossimo"]'); await p.waitForTimeout(300); }
await p.click('[data-azione="inizia"]'); await sc('schieramento');
const conta = () => p.evaluate(() => ({ libere: [...document.querySelectorAll('[data-risorsa]')].map((e) => `${e.dataset.risorsa}:${e.querySelector('strong')?.textContent}`).join(','), qui: [...document.querySelectorAll('[data-settore="curva_cinderwick"] [data-presenza]')].map((e) => `${e.dataset.presenza}=${e.textContent.trim()}`).join(',') }));
for (let i = 1; i <= 5; i++) { await p.click('[data-settore="curva_cinderwick"] .settore-punto'); await p.waitForTimeout(400); console.log(`tocco ${i} su curva_cinderwick → ${JSON.stringify(await conta())}`); }
await b.close();
