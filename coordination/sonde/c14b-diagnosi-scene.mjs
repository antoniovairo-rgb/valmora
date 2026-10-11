// Diagnosi C-014b: sequenza delle scene (data-scena, opacità, testo) dopo «Alla prima ondata», ogni 100 ms.
// Uso: LARG=360 node coordination/sonde/c14b-diagnosi-scene.mjs
import { avviaServer, apriBrowser, nuovaPagina, MISURE, attesa, attendiScena, osserva } from './c14b-lib.mjs';
const LARG = Number(process.env.LARG ?? 360);
const alt = MISURE.find(([l]) => l === LARG)[1];
const { srv, url } = await avviaServer(); const b = await apriBrowser(); const p = await nuovaPagina(b, url, [LARG, alt]);
if (process.env.PRIMA === 'si') { await attendiScena(p, ['titolo']); await p.click('[data-azione="guida"]'); await attesa(p, 400); for (let n = 2; n <= 12; n++) { if (!(await p.locator('[data-azione="guida-avanti"]').count())) break; await p.click('[data-azione="guida-avanti"]'); await attesa(p, 300); } if (await p.locator('[data-azione="guida-fine"]').count()) await p.click('[data-azione="guida-fine"]'); else await p.click('[data-azione="guida-chiudi"]'); await attesa(p, 300); await p.click('[data-azione="crediti"]'); await attesa(p, 600); await p.goto(url); await attendiScena(p, ['titolo']); }
await p.getByRole('button', { name: 'Nuova partita' }).click(); await p.click('[data-genere="m"]'); await attesa(p, 800);
await p.click('[data-azione="avvia-episodio"]'); await p.waitForSelector('[data-azione="avanti"],[data-azione="passo"]', { timeout: 8000 });
for (let k = 0; k < 30 && !(await p.locator('[data-azione="avanti"]').count()); k++) { await p.click('[data-azione="passo"]'); await attesa(p, 120); }
await p.click('[data-azione="avanti"]');
for (let k = 0; k < 40 && !(await p.locator('[data-azione="inizia"]').count()); k++) {
  const a = p.locator('[data-azione="passo"]').first(); if (await a.count()) await a.click(); await attesa(p, 150);
}
await p.click('[data-azione="inizia"]');
console.log('attendi →', await attendiScena(p, ['schieramento', 'chiamata', 'risposta', 'chiusura', 'rapporto', 'verbale']));
await attesa(p, 350);
const m1 = await osserva(p, { larg: LARG, episodio: 'e01', scena: 'schieramento' });
console.log('misura dopo 350 ms', JSON.stringify({ v: m1.verticale, o: m1.orizzontale, piccoli: m1.piccoli, tagliati: m1.tagliati }));
let ultimo = '';
for (let i = 0; i < 40; i++) {
  const st = await p.evaluate(() => [...document.querySelectorAll('.scena')].map((s) => `${s.dataset.scena}@${getComputedStyle(s).opacity}`).join('|') + ' · azioni=' + [...document.querySelectorAll('[data-azione]')].map((x) => x.dataset.azione).join(',') + ' · ' + (document.querySelector('.scena')?.innerText ?? '').slice(0, 50).replace(/\n/g, ' '));
  if (st !== ultimo) { console.log(`${String(i * 100).padStart(5)} ms  ${st}`); ultimo = st; }
  await attesa(p, 100);
}
console.log('errori pagina:', JSON.stringify(p.errori));
await b.close(); srv.close();
